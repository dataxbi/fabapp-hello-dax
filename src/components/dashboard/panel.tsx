import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
        <Card className={className}>
            <CardHeader className="flex-row items-start justify-between gap-l space-y-0">
                <div className="space-y-xs">
                    <CardTitle>{title}</CardTitle>
                    <CardDescription className="max-w-[68ch]">{description}</CardDescription>
                </div>
                {headerAction}
            </CardHeader>
            <CardContent className={cn("pt-0", !headerAction && "pb-xl")}>{children}</CardContent>
        </Card>
    );
}
