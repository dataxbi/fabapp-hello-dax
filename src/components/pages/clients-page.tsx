import { useState } from "react";
import type { InteractionEvent } from "@microsoft/fabric-visuals-core";
import { companySummary, customerDetail, segmentSummary } from "@/queries";
import { QueryChartPanel } from "@/components/dashboard/query-chart-panel";
import { QueryGridPanel } from "@/components/dashboard/query-grid-panel";

export function ClientsPage() {
    const [activeSelection, setActiveSelection] = useState<string | null>(null);

    const handleSelection = (surface: string, events: InteractionEvent[]) => {
        setActiveSelection(events.some((event) => event.action === "select") ? surface : null);
    };

    return (
        <div className="space-y-xxl">
            <section className="flex flex-col gap-l lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-m">
                    <p className="text-[length:var(--text-200)] uppercase tracking-[0.24em] text-primary">Detalle · Clientes</p>
                    <h2 className="font-heading text-[length:var(--text-hero-800)] leading-hero-800 text-foreground">
                        Actividad, contribución y composición de la base comercial.
                    </h2>
                    <p className="max-w-[72ch] text-[length:var(--text-300)] leading-300 text-muted-foreground">
                        Lee el negocio por segmento, compañía y cliente para entender concentración, capilaridad y calidad de la actividad comercial.
                    </p>
                </div>
                {activeSelection ? (
                    <div className="rounded-full border border-border bg-card/80 px-l py-s text-[length:var(--text-200)] text-foreground">
                        Selección activa en <span className="font-semibold">{activeSelection}</span>
                    </div>
                ) : null}
            </section>

            <div className="grid gap-l xl:grid-cols-2">
                <QueryChartPanel
                    title="Vista por segmento"
                    description="Peso de cada segmento sobre la facturación total con su contexto de margen, pedidos y clientes activos."
                    visual={segmentSummary()}
                    onInteraction={(events) => handleSelection("vista por segmento", events)}
                />
                <QueryChartPanel
                    title="Vista por empresa"
                    description="Comparativa rápida entre las compañías presentes en el modelo para detectar concentración del negocio."
                    visual={companySummary()}
                    onInteraction={(events) => handleSelection("vista por empresa", events)}
                />
            </div>

            <QueryGridPanel
                title="Tabla de clientes prioritarios"
                description="Detalle de clientes, empresa, segmento y región para análisis rápido de contribución y mix."
                visual={customerDetail()}
                gridClassName="max-h-[420px]"
                onInteraction={(events) => handleSelection("tabla de clientes", events)}
            />
        </div>
    );
}
