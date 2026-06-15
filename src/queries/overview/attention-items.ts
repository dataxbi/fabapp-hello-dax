import type { VisualizationSpec } from "@microsoft/fabric-visuals";
import type { ColumnMetadataMap } from "@/lib/to-data-table";
import { applyOverviewFilters, type OverviewFilters } from "./filters";
import query from "./attention-items.dax?raw";
import vegaLiteSpec from "./attention-items.json";

const connection = "salesModel";

export const columnMetadata: ColumnMetadataMap = {
    "Scope": { name: "Scope", displayName: "Ambito" },
    "Entity": { name: "Entity", displayName: "Entidad" },
    "Revenue": { name: "Revenue", displayName: "Facturacion", format: "€#,##0" },
    "Revenue Previous": { name: "RevenuePrevious", displayName: "Facturacion anterior", format: "€#,##0" },
    "Revenue Var Percent": { name: "RevenueVarPercent", displayName: "Variacion", format: "0.0%" },
    "Margin Percent": { name: "MarginPercent", displayName: "Margen %", format: "0.0%" }
};

export function attentionItems(filters?: OverviewFilters) {
    return {
        connection,
        query: applyOverviewFilters(query, filters),
        columnMetadata,
        vegaLiteSpec: vegaLiteSpec as VisualizationSpec,
    };
}
