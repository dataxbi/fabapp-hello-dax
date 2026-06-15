import { useMemo, useState } from "react";
import { convertDataTableToRows, formatValue, type InteractionEvent } from "@microsoft/fabric-visuals-core";
import { attentionItems, channelMix, kpiSummary, monthlyTrend, regionalComparison } from "@/queries";
import { useSemanticModelQuery } from "@/hooks/use-semantic-model-query";
import { toDataTable } from "@/lib/to-data-table";
import { MetricCard } from "@/components/dashboard/metric-card";
import { QueryChartPanel } from "@/components/dashboard/query-chart-panel";
import { QueryGridPanel } from "@/components/dashboard/query-grid-panel";

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
    const summaryVisual = kpiSummary();
    const summaryQuery = useSemanticModelQuery({
        connection: summaryVisual.connection,
        query: summaryVisual.query,
    });
    const [activeSelection, setActiveSelection] = useState<string | null>(null);

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

    const handleSelection = (surface: string, events: InteractionEvent[]) => {
        setActiveSelection(events.some((event) => event.action === "select") ? surface : null);
    };

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
                    {activeSelection ? (
                        <div className="rounded-full border border-border bg-card/80 px-l py-s text-[length:var(--text-200)] text-foreground">
                            Selección activa en <span className="font-semibold">{activeSelection}</span>
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
                    visual={monthlyTrend()}
                    onInteraction={(events) => handleSelection("tendencia mensual", events)}
                />
                <QueryChartPanel
                    title="Comparativa regional"
                    description="Peso de cada región en el último cierre y variación frente al periodo anterior para detectar impulsores del crecimiento."
                    visual={regionalComparison()}
                    onInteraction={(events) => handleSelection("comparativa regional", events)}
                />
            </div>

            <div className="grid gap-l xl:grid-cols-[0.9fr_1.1fr]">
                <QueryChartPanel
                    title="Mix por canal"
                    description="Cómo se reparte la facturación actual entre canal propio, indirecto y digital."
                    visual={channelMix()}
                    chartClassName="h-[300px]"
                    onInteraction={(events) => handleSelection("mix por canal", events)}
                />
                <QueryGridPanel
                    title="Bloque de atención"
                    description="Ranking de entidades que merecen seguimiento prioritario por su menor evolución relativa en el último cierre."
                    visual={attentionItems()}
                    onInteraction={(events) => handleSelection("bloque de atención", events)}
                />
            </div>
        </div>
    );
}
