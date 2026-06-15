import type { VisualizationSpec } from "@microsoft/fabric-visuals";
import type { ColumnMetadataMap } from "@/lib/to-data-table";
import query from "./region-channel-breakdown.dax?raw";
import vegaLiteSpec from "./region-channel-breakdown.json";

const connection = "salesModel";

export const columnMetadata: ColumnMetadataMap = {
    "Region Region": { name: "RegionRegion", displayName: "Region" },
    "Canal Channel Group": { name: "CanalChannelGroup", displayName: "Grupo de canal" },
    "Canal Sales Channel": { name: "CanalSalesChannel", displayName: "Canal" },
    "Revenue": { name: "Revenue", displayName: "Facturacion", format: "€#,##0" },
    "Margin": { name: "Margin", displayName: "Margen", format: "€#,##0" },
    "Margin Percent": { name: "MarginPercent", displayName: "Margen %", format: "0.0%" },
    "Orders": { name: "Orders", displayName: "Pedidos", format: "#,##0" }
};

export function regionChannelBreakdown() {
    return { connection, query, columnMetadata, vegaLiteSpec: vegaLiteSpec as VisualizationSpec };
}
