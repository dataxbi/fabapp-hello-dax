import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PanelProps {
    title: string;
    description: string;
    children: ReactNode;
    className?: string;
    headerAction?: ReactNode;
}

export function Panel({ title, description, children, className, headerAction }: PanelProps) {
    return (
        <section
            className={cn(
                "rounded-4xl border border-border bg-card/95 p-xl shadow-[0_18px_60px_rgba(7,17,31,0.08)] backdrop-blur-sm",
                className,
            )}
        >
            <div className="mb-l flex items-start justify-between gap-l">
                <div className="space-y-xs">
                    <h3 className="font-heading text-[length:var(--text-500)] leading-500 text-foreground">{title}</h3>
                    <p className="max-w-[68ch] text-[length:var(--text-200)] leading-200 text-muted-foreground">{description}</p>
                </div>
                {headerAction}
            </div>
            {children}
        </section>
    );
}
