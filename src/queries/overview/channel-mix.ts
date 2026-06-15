import type { VisualizationSpec } from "@microsoft/fabric-visuals";
import type { ColumnMetadataMap } from "@/lib/to-data-table";
import { applyOverviewFilters, type OverviewFilters } from "./filters";
import query from "./channel-mix.dax?raw";
import vegaLiteSpec from "./channel-mix.json";

const connection = "salesModel";

export const columnMetadata: ColumnMetadataMap = {
    "Canal Channel Group": { name: "CanalChannelGroup", displayName: "Grupo de canal" },
    "Canal Sales Channel": { name: "CanalSalesChannel", displayName: "Canal" },
    "Revenue": { name: "Revenue", displayName: "Facturacion", format: "€#,##0" },
    "Margin": { name: "Margin", displayName: "Margen", format: "€#,##0" },
    "Orders": { name: "Orders", displayName: "Pedidos", format: "#,##0" },
    "Revenue Share": { name: "RevenueShare", displayName: "Peso sobre facturacion", format: "0.0%" }
};

export function channelMix(filters?: OverviewFilters) {
    return {
        connection,
        query: applyOverviewFilters(query, filters),
        columnMetadata,
        vegaLiteSpec: vegaLiteSpec as VisualizationSpec,
    };
}
