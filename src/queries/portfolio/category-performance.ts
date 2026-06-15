import type { VisualizationSpec } from "@microsoft/fabric-visuals";
import type { ColumnMetadataMap } from "@/lib/to-data-table";
import query from "./category-performance.dax?raw";
import vegaLiteSpec from "./category-performance.json";

const connection = "salesModel";

export const columnMetadata: ColumnMetadataMap = {
    "Producto Category": { name: "ProductoCategory", displayName: "Categoria" },
    "Revenue": { name: "Revenue", displayName: "Facturacion", format: "€#,##0" },
    "Margin": { name: "Margin", displayName: "Margen", format: "€#,##0" },
    "Margin Percent": { name: "MarginPercent", displayName: "Margen %", format: "0.0%" },
    "Orders": { name: "Orders", displayName: "Pedidos", format: "#,##0" },
    "Units": { name: "Units", displayName: "Unidades", format: "#,##0" }
};

export function categoryPerformance() {
    return { connection, query, columnMetadata, vegaLiteSpec: vegaLiteSpec as VisualizationSpec };
}
