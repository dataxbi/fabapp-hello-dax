import { useState } from "react";
import type { InteractionEvent } from "@microsoft/fabric-visuals-core";
import { brandPerformance, categoryPerformance, mixPrioritization } from "@/queries";
import { QueryChartPanel } from "@/components/dashboard/query-chart-panel";
import { QueryGridPanel } from "@/components/dashboard/query-grid-panel";

export function PortfolioPage() {
    const [activeSelection, setActiveSelection] = useState<string | null>(null);

    const handleSelection = (surface: string, events: InteractionEvent[]) => {
        setActiveSelection(events.some((event) => event.action === "select") ? surface : null);
    };

    return (
        <div className="space-y-xxl">
            <section className="flex flex-col gap-l lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-m">
                    <p className="text-[length:var(--text-200)] uppercase tracking-[0.24em] text-primary">Detalle · Portfolio comercial</p>
                    <h2 className="font-heading text-[length:var(--text-hero-800)] leading-hero-800 text-foreground">
                        Mix comercial, rentabilidad y volumen.
                    </h2>
                    <p className="max-w-[72ch] text-[length:var(--text-300)] leading-300 text-muted-foreground">
                        La página prioriza categorías, observa la elasticidad entre margen y volumen y detecta qué familias sostienen la rentabilidad.
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
                    title="Rendimiento por categoría"
                    description="Facturación, margen, pedidos y unidades por categoría para ordenar el peso económico del portfolio."
                    visual={categoryPerformance()}
                    onInteraction={(events) => handleSelection("rendimiento por categoría", events)}
                />
                <QueryGridPanel
                    title="Tabla de categorías"
                    description="Vista tabular del mix para revisar detalles antes de bajar a marcas o acciones comerciales."
                    visual={categoryPerformance()}
                    onInteraction={(events) => handleSelection("tabla de categorías", events)}
                />
            </div>

            <div className="grid gap-l xl:grid-cols-[1.15fr_0.85fr]">
                <QueryChartPanel
                    title="Rentabilidad frente a volumen"
                    description="Dispersión por marca donde el tamaño refleja facturación y el color ayuda a leer la composición por categoría."
                    visual={brandPerformance()}
                    chartClassName="h-[360px]"
                    onInteraction={(events) => handleSelection("rentabilidad frente a volumen", events)}
                />
                <QueryChartPanel
                    title="Priorización del mix"
                    description="Cuadrante para identificar categorías con más peso en facturación y margen dentro del portfolio global."
                    visual={mixPrioritization()}
                    chartClassName="h-[360px]"
                    onInteraction={(events) => handleSelection("priorización del mix", events)}
                />
            </div>
        </div>
    );
}
