import type { VisualizationSpec } from "@microsoft/fabric-visuals";
import type { ColumnMetadataMap } from "@/lib/to-data-table";
import query from "./brand-performance.dax?raw";
import vegaLiteSpec from "./brand-performance.json";

const connection = "salesModel";

export const columnMetadata: ColumnMetadataMap = {
    "Producto Category": { name: "ProductoCategory", displayName: "Categoria" },
    "Producto Brand": { name: "ProductoBrand", displayName: "Marca" },
    "Revenue": { name: "Revenue", displayName: "Facturacion", format: "€#,##0" },
    "Margin": { name: "Margin", displayName: "Margen", format: "€#,##0" },
    "Margin Percent": { name: "MarginPercent", displayName: "Margen %", format: "0.0%" },
    "Orders": { name: "Orders", displayName: "Pedidos", format: "#,##0" },
    "Units": { name: "Units", displayName: "Unidades", format: "#,##0" }
};

export function brandPerformance() {
    return { connection, query, columnMetadata, vegaLiteSpec: vegaLiteSpec as VisualizationSpec };
}
