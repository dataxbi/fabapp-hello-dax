import type { VisualizationSpec } from "@microsoft/fabric-visuals";
import type { ColumnMetadataMap } from "@/lib/to-data-table";
import query from "./regional-comparison.dax?raw";
import vegaLiteSpec from "./regional-comparison.json";

const connection = "salesModel";

export const columnMetadata: ColumnMetadataMap = {
    "Region Region": { name: "RegionRegion", displayName: "Region" },
    "Revenue": { name: "Revenue", displayName: "Facturacion", format: "€#,##0" },
    "Margin": { name: "Margin", displayName: "Margen", format: "€#,##0" },
    "Margin Percent": { name: "MarginPercent", displayName: "Margen %", format: "0.0%" },
    "Orders": { name: "Orders", displayName: "Pedidos", format: "#,##0" },
    "Active Clients": { name: "ActiveClients", displayName: "Clientes activos", format: "#,##0" },
    "Revenue Previous": { name: "RevenuePrevious", displayName: "Facturacion anterior", format: "€#,##0" },
    "Revenue Share": { name: "RevenueShare", displayName: "Peso sobre facturacion", format: "0.0%" },
    "Revenue vs Previous %": { name: "RevenueVsPreviousPct", displayName: "Var. vs periodo anterior", format: "0.0%" }
};

export function regionalComparison() {
    return { connection, query, columnMetadata, vegaLiteSpec: vegaLiteSpec as VisualizationSpec };
}
