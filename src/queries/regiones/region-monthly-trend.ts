import type { VisualizationSpec } from "@microsoft/fabric-visuals";
import type { ColumnMetadataMap } from "@/lib/to-data-table";
import query from "./region-monthly-trend.dax?raw";
import vegaLiteSpec from "./region-monthly-trend.json";

const connection = "salesModel";

export const columnMetadata: ColumnMetadataMap = {
    "Fecha Year": { name: "FechaYear", displayName: "Año", format: "#,##0" },
    "Fecha Year Month": { name: "FechaYearMonth", displayName: "Periodo" },
    "Region Region": { name: "RegionRegion", displayName: "Region" },
    "Revenue": { name: "Revenue", displayName: "Facturacion", format: "€#,##0" },
    "Margin": { name: "Margin", displayName: "Margen", format: "€#,##0" }
};

export function regionMonthlyTrend() {
    return { connection, query, columnMetadata, vegaLiteSpec: vegaLiteSpec as VisualizationSpec };
}
