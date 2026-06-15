import type { InteractionEvent } from "@microsoft/fabric-visuals-core";
import type { OverviewFilters } from "@/queries/overview/filters";

export type OverviewFilterSource = "monthlyTrend" | "regionalComparison" | "channelMix" | "attentionItems";

export interface OverviewActiveFilter {
    source: OverviewFilterSource;
    label: string;
    detail: string;
    filters: OverviewFilters;
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
