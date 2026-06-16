import type { VisualizationSpec } from "@microsoft/fabric-visuals";
import type { InteractionEvent } from "@microsoft/fabric-visuals-core";
import type { OverviewFilters } from "@/queries/overview/filters";

export type OverviewFilterSource = "monthlyTrend" | "regionalComparison" | "channelMix" | "attentionItems";
type OverviewFilterKey = keyof OverviewFilters;

export interface OverviewActiveFilter {
    source: OverviewFilterSource;
    label: string;
    detail: string;
    filters: OverviewFilters;
}

export type OverviewActiveFilters = Partial<Record<OverviewFilterSource, OverviewActiveFilter>>;

const DIMMED_OPACITY = 0.35;
const OVERVIEW_FILTER_SOURCE_ORDER: OverviewFilterSource[] = [
    "monthlyTrend",
    "regionalComparison",
    "channelMix",
    "attentionItems",
];

function buildSelectionTest(field: string, value: string) {
    return `datum.${field} === ${JSON.stringify(value)}`;
}

function applyConditionalOpacity(spec: VisualizationSpec, field: string, value: string): VisualizationSpec {
    const highlightedSpec = structuredClone(spec) as {
        encoding?: Record<string, unknown>;
    };

    highlightedSpec.encoding = {
        ...highlightedSpec.encoding,
        opacity: {
            condition: {
                test: buildSelectionTest(field, value),
                value: 1,
            },
            value: DIMMED_OPACITY,
        },
    };

    return highlightedSpec as VisualizationSpec;
}

function applyMonthlyTrendHighlight(spec: VisualizationSpec, value: string): VisualizationSpec {
    const highlightedSpec = structuredClone(spec) as {
        mark?: string | Record<string, unknown>;
        layer?: unknown[];
    } & Record<string, unknown>;

    const mark =
        typeof highlightedSpec.mark === "string"
            ? { type: highlightedSpec.mark }
            : { ...(highlightedSpec.mark ?? { type: "line" }) };

    delete highlightedSpec.mark;
    delete highlightedSpec.layer;

    return {
        ...highlightedSpec,
        layer: [
            {
                mark: {
                    ...mark,
                    point: false,
                    opacity: DIMMED_OPACITY,
                },
            },
            {
                mark: {
                    type: "point",
                    filled: true,
                    strokeWidth: 2,
                },
                encoding: {
                    opacity: {
                        condition: {
                            test: buildSelectionTest("FechaYearMonth", value),
                            value: 1,
                        },
                        value: DIMMED_OPACITY,
                    },
                    size: {
                        condition: {
                            test: buildSelectionTest("FechaYearMonth", value),
                            value: 220,
                        },
                        value: 80,
                    },
                },
            },
        ],
    } as VisualizationSpec;
}

function getSetValue(events: InteractionEvent[], name: string) {
    const selectionEvent = events.find((event) => event.action === "select");
    const predicates = selectionEvent?.action === "select" ? selectionEvent.selections[0]?.predicates : undefined;
    const predicate = predicates?.find((item) => item.type === "set" && item.name === name);
    const value = predicate?.type === "set" ? predicate.values[0] : undefined;

    return typeof value === "string" ? value : undefined;
}

export function deriveOverviewFilter(source: OverviewFilterSource, events: InteractionEvent[]): OverviewActiveFilter | null {
    if (!events.some((event) => event.action === "select")) {
        return null;
    }

    if (source === "monthlyTrend") {
        const yearMonth = getSetValue(events, "FechaYearMonth");
        return yearMonth
            ? {
                  source,
                  label: "Periodo",
                  detail: yearMonth,
                  filters: { yearMonth },
              }
            : null;
    }

    if (source === "regionalComparison") {
        const region = getSetValue(events, "RegionRegion");
        return region
            ? {
                  source,
                  label: "Región",
                  detail: region,
                  filters: { region },
              }
            : null;
    }

    if (source === "channelMix") {
        const salesChannel = getSetValue(events, "CanalSalesChannel");
        return salesChannel
            ? {
                  source,
                  label: "Canal",
                  detail: salesChannel,
                  filters: { salesChannel },
              }
            : null;
    }

    const scope = getSetValue(events, "Scope");
    const entity = getSetValue(events, "Entity");

    if (scope === "Region" && entity) {
        return {
            source,
            label: "Región prioritaria",
            detail: entity,
            filters: { region: entity },
        };
    }

    if (scope === "Categoria" && entity) {
        return {
            source,
            label: "Categoría prioritaria",
            detail: entity,
            filters: { category: entity },
        };
    }

    return null;
}

function getFilterKeys(filters: OverviewFilters): OverviewFilterKey[] {
    return Object.entries(filters)
        .filter(([, value]) => typeof value === "string" && value.length > 0)
        .map(([key]) => key as OverviewFilterKey);
}

function hasOverlappingFilterKey(left: OverviewFilters, right: OverviewFilters) {
    const rightKeys = new Set(getFilterKeys(right));
    return getFilterKeys(left).some((key) => rightKeys.has(key));
}

function isSameOverviewFilter(left: OverviewActiveFilter | undefined, right: OverviewActiveFilter) {
    return left?.source === right.source && left.label === right.label && left.detail === right.detail;
}

export function listOverviewActiveFilters(activeFilters: OverviewActiveFilters) {
    return OVERVIEW_FILTER_SOURCE_ORDER.flatMap((source) => {
        const activeFilter = activeFilters[source];
        return activeFilter ? [activeFilter] : [];
    });
}

export function getCombinedOverviewFilters(
    activeFilters: OverviewActiveFilters,
    options?: { excludeSource?: OverviewFilterSource },
): OverviewFilters | undefined {
    const combinedFilters: OverviewFilters = {};

    for (const activeFilter of listOverviewActiveFilters(activeFilters)) {
        if (activeFilter.source === options?.excludeSource) {
            continue;
        }

        Object.assign(combinedFilters, activeFilter.filters);
    }

    return Object.keys(combinedFilters).length > 0 ? combinedFilters : undefined;
}

export function hasOverviewActiveFilters(activeFilters: OverviewActiveFilters) {
    return listOverviewActiveFilters(activeFilters).length > 0;
}

export function reduceOverviewFilters(
    current: OverviewActiveFilters,
    source: OverviewFilterSource,
    events: InteractionEvent[],
): OverviewActiveFilters {
    const nextFilter = deriveOverviewFilter(source, events);

    if (nextFilter) {
        const nextState = { ...current };
        const currentFilter = current[source];

        delete nextState[source];

        for (const [otherSource, activeFilter] of Object.entries(nextState) as Array<[OverviewFilterSource, OverviewActiveFilter]>) {
            if (hasOverlappingFilterKey(activeFilter.filters, nextFilter.filters)) {
                delete nextState[otherSource];
            }
        }

        if (isSameOverviewFilter(currentFilter, nextFilter)) {
            return nextState;
        }

        nextState[source] = nextFilter;
        return nextState;
    }

    if (events.some((event) => event.action === "clear") && current[source]) {
        const nextState = { ...current };
        delete nextState[source];
        return nextState;
    }

    return current;
}

export function highlightOverviewVisual(
    source: OverviewFilterSource,
    spec: VisualizationSpec,
    activeFilters: OverviewActiveFilters,
): VisualizationSpec {
    const activeFilter = activeFilters[source];

    if (!activeFilter || activeFilter.source !== source) {
        return spec;
    }

    if (source === "monthlyTrend") {
        return applyMonthlyTrendHighlight(spec, activeFilter.detail);
    }

    if (source === "regionalComparison") {
        return applyConditionalOpacity(spec, "RegionRegion", activeFilter.detail);
    }

    if (source === "channelMix") {
        return applyConditionalOpacity(spec, "CanalSalesChannel", activeFilter.detail);
    }

    return spec;
}
