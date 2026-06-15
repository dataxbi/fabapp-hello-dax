import { useState } from "react";
import type { InteractionEvent } from "@microsoft/fabric-visuals-core";
import { regionChannelBreakdown, regionComparison, regionMonthlyTrend } from "@/queries";
import { QueryChartPanel } from "@/components/dashboard/query-chart-panel";
import { QueryGridPanel } from "@/components/dashboard/query-grid-panel";

export function RegionsPage() {
    const [activeSelection, setActiveSelection] = useState<string | null>(null);

    const handleSelection = (surface: string, events: InteractionEvent[]) => {
        setActiveSelection(events.some((event) => event.action === "select") ? surface : null);
    };

    return (
        <div className="space-y-xxl">
            <section className="flex flex-col gap-l lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-m">
                    <p className="text-[length:var(--text-200)] uppercase tracking-[0.24em] text-primary">Detalle · Regiones</p>
                    <h2 className="font-heading text-[length:var(--text-hero-800)] leading-hero-800 text-foreground">
                        Geografía comercial y consistencia operativa.
                    </h2>
                    <p className="max-w-[72ch] text-[length:var(--text-300)] leading-300 text-muted-foreground">
                        Compara rendimiento, evolución temporal y composición por canal para entender dónde se concentra la tracción del negocio.
                    </p>
                </div>
                {activeSelection ? (
                    <div className="rounded-full border border-border bg-card/80 px-l py-s text-[length:var(--text-200)] text-foreground">
                        Selección activa en <span className="font-semibold">{activeSelection}</span>
                    </div>
                ) : null}
            </section>

            <div className="grid gap-l xl:grid-cols-[0.95fr_1.05fr]">
                <QueryChartPanel
                    title="Comparativa por región"
                    description="Lectura consolidada de facturación, margen, pedidos y clientes activos para el horizonte 2025-2026."
                    visual={regionComparison()}
                    onInteraction={(events) => handleSelection("comparativa por región", events)}
                />
                <QueryGridPanel
                    title="Tabla ejecutiva"
                    description="La misma comparativa en formato tabular para revisar magnitudes y priorizar preguntas de seguimiento."
                    visual={regionComparison()}
                    onInteraction={(events) => handleSelection("tabla ejecutiva", events)}
                />
            </div>

            <QueryChartPanel
                title="Tendencia temporal por región"
                description="Serie mensual completa para identificar aceleraciones, estacionalidad y estabilidad relativa entre territorios."
                visual={regionMonthlyTrend()}
                chartClassName="h-[360px]"
                onInteraction={(events) => handleSelection("tendencia temporal", events)}
            />

            <QueryChartPanel
                title="Desglose por canal dentro de cada región"
                description="Cruce entre territorio y canal comercial para entender el reparto del crecimiento y la calidad del mix."
                visual={regionChannelBreakdown()}
                chartClassName="h-[360px]"
                onInteraction={(events) => handleSelection("desglose por canal", events)}
            />
        </div>
    );
}
