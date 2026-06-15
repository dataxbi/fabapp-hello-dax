import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricContextItem {
    label: string;
    value: string;
}

interface MetricCardProps {
    label: string;
    value: string;
    periodLabel: string;
    trendLabel: string;
    deltaValue?: number | null;
    contextItems: MetricContextItem[];
    accent?: "primary" | "secondary";
}

export function getDeltaTone(deltaValue: number | null | undefined) {
    if (deltaValue == null || Number.isNaN(deltaValue)) {
        return {
            badgeClassName: "bg-muted text-muted-foreground",
            icon: Minus,
            prefix: "",
            statusLabel: "Sin contexto",
        };
    }

    if (Math.abs(deltaValue) < 0.001) {
        return {
            badgeClassName: "bg-muted text-muted-foreground",
            icon: Minus,
            prefix: "",
            statusLabel: "Estable",
        };
    }

    if (deltaValue > 0) {
        return {
            badgeClassName: "bg-primary/12 text-primary",
            icon: ArrowUpRight,
            prefix: "+",
            statusLabel: "Mejora",
        };
    }

    return {
        badgeClassName: "bg-destructive/10 text-destructive",
        icon: ArrowDownRight,
        prefix: "",
        statusLabel: "Empeora",
    };
}

export function MetricCard({
    label,
    value,
    periodLabel,
    trendLabel,
    deltaValue,
    contextItems,
    accent = "secondary",
}: MetricCardProps) {
    const deltaTone = getDeltaTone(deltaValue);
    const DeltaIcon = deltaTone.icon;
    const deltaText =
        deltaValue == null || Number.isNaN(deltaValue)
            ? "N/D"
            : `${deltaTone.prefix}${(deltaValue * 100).toFixed(1)}%`;

    return (
        <article
            className={cn(
                "rounded-4xl border border-border bg-card/95 p-xl shadow-[0_18px_60px_rgba(7,17,31,0.08)] backdrop-blur-sm",
                accent === "primary" && "border-primary/30 bg-[linear-gradient(180deg,rgba(10,184,166,0.08),rgba(252,254,255,0.96))]",
            )}
        >
            <div className="flex items-start justify-between gap-m">
                <p className="min-w-0 text-[length:var(--text-200)] font-medium text-muted-foreground">{label}</p>
                <span
                    className={cn(
                        "inline-flex shrink-0 items-center gap-xs rounded-full px-s py-xs text-[length:var(--text-200)] font-semibold whitespace-nowrap",
                        deltaTone.badgeClassName,
                    )}
                >
                    <DeltaIcon className="icon-size-200" />
                    {deltaText}
                    <span className="font-semibold">{deltaTone.statusLabel}</span>
                </span>
            </div>

            <div className="mt-m space-y-s">
                <h3 className="font-heading text-[length:var(--text-hero-700)] leading-hero-700 text-foreground">
                    {value}
                </h3>
                <p className="inline-flex rounded-full bg-muted/60 px-s py-xs text-[length:var(--text-200)] text-muted-foreground">
                    {periodLabel}
                </p>
            </div>

            <div className="mt-l rounded-3xl border border-border/80 bg-background/70 p-l">
                <div className="flex items-start gap-s">
                    <span className={cn("inline-flex rounded-full p-xs", deltaTone.badgeClassName)}>
                        <DeltaIcon className="icon-size-200" />
                    </span>
                    <div className="space-y-xs">
                        <p className="text-[length:var(--text-200)] uppercase tracking-[0.18em] text-muted-foreground">
                            Comparativa
                        </p>
                        <p className="text-[length:var(--text-300)] leading-300 font-semibold text-foreground">
                            {trendLabel}
                        </p>
                        <p className="text-[length:var(--text-200)] text-muted-foreground">
                            {deltaTone.statusLabel === "Estable" ? "Sin cambios relevantes respecto al periodo de comparación." : `${deltaTone.statusLabel} respecto a la referencia elegida.`}
                        </p>
                    </div>
                </div>
            </div>

            <dl className="mt-l grid gap-s">
                {contextItems.map((item) => (
                    <div key={item.label} className="flex items-center justify-between gap-m border-b border-border/70 pb-s last:border-b-0 last:pb-0">
                        <dt className="text-[length:var(--text-200)] text-muted-foreground">{item.label}</dt>
                        <dd className="text-[length:var(--text-200)] font-semibold text-foreground">{item.value}</dd>
                    </div>
                ))}
            </dl>
        </article>
    );
}
