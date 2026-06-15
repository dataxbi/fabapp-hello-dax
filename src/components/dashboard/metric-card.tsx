import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
    label: string;
    value: string;
    supportingText: string;
    deltaLabel: string;
    deltaValue?: number | null;
    accent?: "primary" | "secondary";
}

function getDeltaTone(deltaValue: number | null | undefined) {
    if (deltaValue == null || Number.isNaN(deltaValue)) {
        return {
            badgeClassName: "bg-muted text-muted-foreground",
            icon: Minus,
            prefix: "",
        };
    }

    if (deltaValue >= 0) {
        return {
            badgeClassName: "bg-primary/12 text-primary",
            icon: ArrowUpRight,
            prefix: "+",
        };
    }

    return {
        badgeClassName: "bg-destructive/10 text-destructive",
        icon: ArrowDownRight,
        prefix: "",
    };
}

export function MetricCard({
    label,
    value,
    supportingText,
    deltaLabel,
    deltaValue,
    accent = "secondary",
}: MetricCardProps) {
    const deltaTone = getDeltaTone(deltaValue);
    const DeltaIcon = deltaTone.icon;

    return (
        <article
            className={cn(
                "rounded-4xl border border-border bg-card/95 p-xl shadow-[0_18px_60px_rgba(7,17,31,0.08)] backdrop-blur-sm",
                accent === "primary" && "border-primary/30 bg-primary/[0.05]",
            )}
        >
            <div className="flex items-start justify-between gap-l">
                <div>
                    <p className="text-[length:var(--text-200)] text-muted-foreground">{label}</p>
                    <h3 className="mt-m font-heading text-[length:var(--text-hero-700)] leading-hero-700 text-foreground">
                        {value}
                    </h3>
                </div>
                <span className={cn("inline-flex items-center gap-xs rounded-full px-s py-xs text-[length:var(--text-200)] font-semibold", deltaTone.badgeClassName)}>
                    <DeltaIcon className="icon-size-200" />
                    {deltaValue == null || Number.isNaN(deltaValue)
                        ? "N/D"
                        : `${deltaTone.prefix}${(deltaValue * 100).toFixed(1)}%`}
                </span>
            </div>
            <p className="mt-l text-[length:var(--text-200)] text-muted-foreground">{supportingText}</p>
            <p className="mt-xs text-[length:var(--text-200)] text-foreground">{deltaLabel}</p>
        </article>
    );
}
