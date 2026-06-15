import type { VisualizationSpec } from "@microsoft/fabric-visuals";
import type { ColumnMetadataMap } from "@/lib/to-data-table";
import { applyOverviewFilters, type OverviewFilters } from "./filters";
import query from "./monthly-trend.dax?raw";
import vegaLiteSpec from "./monthly-trend.json";

const connection = "salesModel";

export const columnMetadata: ColumnMetadataMap = {
    "Fecha Year": { name: "FechaYear", displayName: "Año", format: "#,##0" },
    "Fecha Year Month": { name: "FechaYearMonth", displayName: "Periodo" },
    "Revenue": { name: "Revenue", displayName: "Facturacion", format: "€#,##0" },
    "Margin": { name: "Margin", displayName: "Margen", format: "€#,##0" },
    "Margin Percent": { name: "MarginPercent", displayName: "Margen %", format: "0.0%" },
    "Orders": { name: "Orders", displayName: "Pedidos", format: "#,##0" },
    "Active Clients": { name: "ActiveClients", displayName: "Clientes activos", format: "#,##0" }
};

export function monthlyTrend(filters?: OverviewFilters) {
    return {
        connection,
        query: applyOverviewFilters(query, filters),
        columnMetadata,
        vegaLiteSpec: vegaLiteSpec as VisualizationSpec,
    };
}
