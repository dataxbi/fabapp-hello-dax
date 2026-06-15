import type { VisualizationSpec } from "@microsoft/fabric-visuals";
import type { ColumnMetadataMap } from "@/lib/to-data-table";
import query from "./mix-prioritization.dax?raw";
import vegaLiteSpec from "./mix-prioritization.json";

const connection = "salesModel";

export const columnMetadata: ColumnMetadataMap = {
    "Producto Category": { name: "ProductoCategory", displayName: "Categoria" },
    "Revenue": { name: "Revenue", displayName: "Facturacion", format: "€#,##0" },
    "Margin": { name: "Margin", displayName: "Margen", format: "€#,##0" },
    "Units": { name: "Units", displayName: "Unidades", format: "#,##0" },
    "Revenue Share": { name: "RevenueShare", displayName: "Peso en facturacion", format: "0.0%" },
    "Margin Share": { name: "MarginShare", displayName: "Peso en margen", format: "0.0%" }
};

export function mixPrioritization() {
    return { connection, query, columnMetadata, vegaLiteSpec: vegaLiteSpec as VisualizationSpec };
}
