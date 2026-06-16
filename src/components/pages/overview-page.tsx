import { useMemo, useState } from "react";
import type { InteractionEvent } from "@microsoft/fabric-visuals-core";
import { convertDataTableToRows, formatValue } from "@microsoft/fabric-visuals-core";
import { attentionItems, channelMix, kpiSummary, monthlyTrend, regionalComparison } from "@/queries";
import { useSemanticModelQuery } from "@/hooks/use-semantic-model-query";
import { toDataTable } from "@/lib/to-data-table";
import { cn } from "@/lib/utils";
import { MetricCard } from "@/components/dashboard/metric-card";
import { QueryChartPanel } from "@/components/dashboard/query-chart-panel";
import { QueryGridPanel } from "@/components/dashboard/query-grid-panel";
import {
    getCombinedOverviewFilters,
    hasOverviewActiveFilters,
    highlightOverviewVisual,
    listOverviewActiveFilters,
    reduceOverviewFilters,
    type OverviewActiveFilters,
    type OverviewFilterSource,
} from "./overview-filters";

function formatMetric(value: unknown, format?: string) {
    if (typeof value === "string") {
        return value;
    }

    const formatted = formatValue(value, format, { locale: "es-ES" });
    return typeof formatted === "string" ? formatted : String(formatted ?? "—");
}

function formatDelta(value: unknown, format = "0.0%") {
    return formatMetric(value, format);
}

export function OverviewPage() {
    const [activeFilters, setActiveFilters] = useState<OverviewActiveFilters>({});
    const combinedFilters = getCombinedOverviewFilters(activeFilters);
    const activeFilterList = listOverviewActiveFilters(activeFilters);
    const summaryVisual = kpiSummary(combinedFilters);
    const summaryQuery = useSemanticModelQuery({
        connection: summaryVisual.connection,
        query: summaryVisual.query,
    });
    const trendVisualBase = monthlyTrend(getCombinedOverviewFilters(activeFilters, { excludeSource: "monthlyTrend" }));
    const regionalVisualBase = regionalComparison(getCombinedOverviewFilters(activeFilters, { excludeSource: "regionalComparison" }));
    const channelVisualBase = channelMix(getCombinedOverviewFilters(activeFilters, { excludeSource: "channelMix" }));
    const attentionVisual = attentionItems(getCombinedOverviewFilters(activeFilters, { excludeSource: "attentionItems" }));
    const trendVisual = {
        ...trendVisualBase,
        vegaLiteSpec: highlightOverviewVisual("monthlyTrend", trendVisualBase.vegaLiteSpec, activeFilters),
    };
    const regionalVisual = {
        ...regionalVisualBase,
        vegaLiteSpec: highlightOverviewVisual("regionalComparison", regionalVisualBase.vegaLiteSpec, activeFilters),
    };
    const channelVisual = {
        ...channelVisualBase,
        vegaLiteSpec: highlightOverviewVisual("channelMix", channelVisualBase.vegaLiteSpec, activeFilters),
    };

    const metrics = useMemo(() => {
        if (summaryQuery.data?.status !== "success") {
            return [];
        }

        const table = toDataTable(summaryQuery.data.table, summaryVisual.columnMetadata);
        const [summary] = convertDataTableToRows(table) as Array<Record<string, unknown>>;
        const latestPeriod = String(summary?.LatestPeriod ?? "—");

        return [
            {
                label: "Facturación",
                value: formatMetric(summary?.RevenueCurrent, "€#,##0"),
                periodLabel: `Cierre ${latestPeriod}`,
                trendLabel: `vs periodo anterior ${formatDelta(summary?.RevenueVsPreviousPct)}`,
                deltaValue: Number(summary?.RevenueVsPreviousPct ?? 0),
                contextItems: [
                    { label: "YTD actual", value: formatMetric(summary?.RevenueYtd, "€#,##0") },
                    { label: "YTD anterior", value: formatMetric(summary?.RevenueYtdPrevious, "€#,##0") },
                    { label: "vs año anterior", value: formatDelta(summary?.RevenueVsLastYearPct) },
                ],
                accent: "primary" as const,
            },
            {
                label: "Margen",
                value: formatMetric(summary?.MarginCurrent, "€#,##0"),
                periodLabel: `Cierre ${latestPeriod}`,
                trendLabel: `vs periodo anterior ${formatDelta(summary?.MarginVsPreviousPct)}`,
                deltaValue: Number(summary?.MarginVsPreviousPct ?? 0),
                contextItems: [
                    { label: "Margen % actual", value: formatMetric(summary?.MarginPercentCurrent, "0.0%") },
                    { label: "Margen % anterior", value: formatMetric(summary?.MarginPercentPrevious, "0.0%") },
                    { label: "Facturación asociada", value: formatMetric(summary?.RevenueCurrent, "€#,##0") },
                ],
                accent: "secondary" as const,
            },
            {
                label: "Margen %",
                value: formatMetric(summary?.MarginPercentCurrent, "0.0%"),
                periodLabel: `Cierre ${latestPeriod}`,
                trendLabel: `vs año anterior ${formatDelta(summary?.RevenueVsLastYearPct)}`,
                deltaValue: Number(summary?.RevenueVsLastYearPct ?? 0),
                contextItems: [
                    { label: "Mes actual", value: formatMetric(summary?.MarginPercentCurrent, "0.0%") },
                    { label: "Mes anterior", value: formatMetric(summary?.MarginPercentPrevious, "0.0%") },
                    { label: "YTD vs anterior", value: formatDelta(summary?.RevenueYtdVsPreviousPct) },
                ],
                accent: "secondary" as const,
            },
            {
                label: "Pedidos",
                value: formatMetric(summary?.OrdersCurrent, "#,##0"),
                periodLabel: `Cierre ${latestPeriod}`,
                trendLabel: `vs periodo anterior ${formatDelta(summary?.OrdersVsPreviousPct)}`,
                deltaValue: Number(summary?.OrdersVsPreviousPct ?? 0),
                contextItems: [
                    { label: "Periodo actual", value: formatMetric(summary?.OrdersCurrent, "#,##0") },
                    { label: "Variación mensual", value: formatDelta(summary?.OrdersVsPreviousPct) },
                    { label: "Clientes activos", value: formatMetric(summary?.ActiveClientsCurrent, "#,##0") },
                ],
                accent: "secondary" as const,
            },
            {
                label: "Clientes activos",
                value: formatMetric(summary?.ActiveClientsCurrent, "#,##0"),
                periodLabel: `Cierre ${latestPeriod}`,
                trendLabel: `vs periodo anterior ${formatDelta(summary?.ActiveClientsVsPreviousPct)}`,
                deltaValue: Number(summary?.ActiveClientsVsPreviousPct ?? 0),
                contextItems: [
                    { label: "Periodo actual", value: formatMetric(summary?.ActiveClientsCurrent, "#,##0") },
                    { label: "Variación mensual", value: formatDelta(summary?.ActiveClientsVsPreviousPct) },
                    { label: "Pedidos actuales", value: formatMetric(summary?.OrdersCurrent, "#,##0") },
                ],
                accent: "secondary" as const,
            },
        ];
    }, [summaryQuery.data, summaryVisual.columnMetadata]);

    const handleSelection = (source: OverviewFilterSource, events: InteractionEvent[]) => {
        setActiveFilters((current) => reduceOverviewFilters(current, source, events));
    };

    const getPanelStateClassName = (source: OverviewFilterSource) =>
        cn(
            activeFilters[source] &&
                "border-primary/40 shadow-[0_18px_60px_rgba(10,184,166,0.18)] ring-1 ring-primary/15",
        );

    const getPanelAction = (source: OverviewFilterSource) =>
        activeFilters[source] ? (
            <span className="inline-flex rounded-full bg-primary/12 px-s py-xs text-[length:var(--text-200)] font-semibold text-primary">
                Selección activa
            </span>
        ) : null;

    return (
        <div className="space-y-xxl">
            <section className="rounded-4xl border border-primary/20 bg-[radial-gradient(circle_at_top_left,rgba(10,184,166,0.2),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(28,46,112,0.22),transparent_44%)] p-xxl">
                <p className="text-[length:var(--text-200)] uppercase tracking-[0.24em] text-primary">Overview ejecutiva</p>
                <div className="mt-l flex flex-col gap-l lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-[72ch] space-y-m">
                        <h2 className="font-heading text-[length:var(--text-hero-800)] leading-hero-800 text-foreground">
                            Lectura inmediata del negocio para dirección.
                        </h2>
                        <p className="text-[length:var(--text-300)] leading-300 text-muted-foreground">
                            Esta portada resume el cierre más reciente, la evolución temporal y los focos que conviene vigilar
                            antes de bajar a páginas de detalle.
                        </p>
                    </div>
                    {hasOverviewActiveFilters(activeFilters) ? (
                        <div className="flex flex-wrap items-center gap-s rounded-3xl border border-border bg-card/80 px-m py-s text-[length:var(--text-200)] text-foreground">
                            <span className="text-muted-foreground">Filtro activo:</span>
                            {activeFilterList.map((activeFilter) => (
                                <span
                                    key={activeFilter.source}
                                    className="inline-flex items-center gap-xs rounded-full border border-border bg-background/80 px-s py-xs"
                                >
                                    <span className="font-semibold">
                                        {activeFilter.label}: {activeFilter.detail}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setActiveFilters((current) => {
                                                const nextState = { ...current };
                                                delete nextState[activeFilter.source];
                                                return nextState;
                                            })
                                        }
                                        className="rounded-full px-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                                        aria-label={`Quitar filtro ${activeFilter.label} ${activeFilter.detail}`}
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                            <span className="text-muted-foreground">Pulsa de nuevo sobre el elemento marcado para limpiarlo.</span>
                            <button
                                type="button"
                                onClick={() => setActiveFilters({})}
                                className="rounded-full border border-border bg-background/80 px-s py-xs font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                            >
                                Limpiar todo
                            </button>
                        </div>
                    ) : null}
                </div>
            </section>

            <div className="grid gap-l md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
                {metrics.map((metric) => (
                    <MetricCard key={metric.label} {...metric} />
                ))}
            </div>

            <div className="grid gap-l xl:grid-cols-[1.45fr_0.95fr]">
                <QueryChartPanel
                    title="Tendencia mensual"
                    description="Evolución de la facturación con apoyo de margen, pedidos y clientes activos para contextualizar el ritmo comercial."
                    visual={trendVisual}
                    className={getPanelStateClassName("monthlyTrend")}
                    headerAction={getPanelAction("monthlyTrend")}
                    onInteraction={(events) => handleSelection("monthlyTrend", events)}
                />
                <QueryChartPanel
                    title="Comparativa regional"
                    description="Peso de cada región en el último cierre y variación frente al periodo anterior para detectar impulsores del crecimiento."
                    visual={regionalVisual}
                    className={getPanelStateClassName("regionalComparison")}
                    headerAction={getPanelAction("regionalComparison")}
                    onInteraction={(events) => handleSelection("regionalComparison", events)}
                />
            </div>

            <div className="grid gap-l xl:grid-cols-[0.9fr_1.1fr]">
                <QueryChartPanel
                    title="Canales por facturación"
                    description="Comparación del aporte actual de cada canal. Sustituimos el donut por barras para facilitar la lectura entre categorías."
                    visual={channelVisual}
                    className={getPanelStateClassName("channelMix")}
                    chartClassName="h-[300px]"
                    headerAction={getPanelAction("channelMix")}
                    onInteraction={(events) => handleSelection("channelMix", events)}
                />
                <QueryGridPanel
                    title="Bloque de atención"
                    description="Ranking de entidades que merecen seguimiento prioritario por su menor evolución relativa en el último cierre."
                    visual={attentionVisual}
                    className={getPanelStateClassName("attentionItems")}
                    headerAction={getPanelAction("attentionItems")}
                    onInteraction={(events) => handleSelection("attentionItems", events)}
                />
            </div>
        </div>
    );
}
