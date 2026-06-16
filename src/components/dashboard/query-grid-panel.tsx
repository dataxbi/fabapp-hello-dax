import type { ReactNode } from "react";
import type { InteractionEvent } from "@microsoft/fabric-visuals-core";
import { DataGrid } from "@microsoft/fabric-datagrid";
import type { VisualizationSpec } from "@microsoft/fabric-visuals";
import type { ColumnMetadataMap } from "@/lib/to-data-table";
import { useSemanticModelQuery } from "@/hooks/use-semantic-model-query";
import { toDataTable } from "@/lib/to-data-table";
import { Panel } from "./panel";
import { useCssTheme } from "@microsoft/fabric-visuals";

interface QueryVisualization {
    connection: string;
    query: string;
    columnMetadata: ColumnMetadataMap;
    vegaLiteSpec: VisualizationSpec;
}

interface QueryGridPanelProps {
    title: string;
    description: string;
    visual: QueryVisualization;
    className?: string;
    gridClassName?: string;
    onInteraction?: (events: InteractionEvent[]) => void;
    headerAction?: ReactNode;
}

export function QueryGridPanel({
    title,
    description,
    visual,
    className,
    gridClassName = "max-h-[360px]",
    onInteraction,
    headerAction,
}: QueryGridPanelProps) {
    const theme = useCssTheme();
    const { data, error, isLoading } = useSemanticModelQuery({
        connection: visual.connection,
        query: visual.query,
    });

    let content: ReactNode;

    if (isLoading) {
        content = <div className="h-40 animate-pulse rounded-3xl bg-muted" />;
    } else if (error || data?.status === "error") {
        content = (
            <div className="rounded-3xl border border-destructive/30 bg-destructive/8 p-l text-[length:var(--text-200)] text-destructive">
                {(error ?? (data?.status === "error" ? new Error(data.error.message) : undefined))?.message}
            </div>
        );
    } else if (data?.status !== "success") {
        content = (
            <div className="rounded-3xl border border-dashed border-border p-l text-[length:var(--text-200)] text-muted-foreground">
                No hay filas para mostrar.
            </div>
        );
    } else {
        const dataTable = toDataTable(data.table, visual.columnMetadata);
        content = (
            <div className={`${gridClassName} overflow-auto`}>
                <DataGrid data={dataTable} theme={theme} onInteraction={onInteraction} />
            </div>
        );
    }

    return (
        <Panel title={title} description={description} className={className} headerAction={headerAction}>
            {content}
        </Panel>
    );
}
