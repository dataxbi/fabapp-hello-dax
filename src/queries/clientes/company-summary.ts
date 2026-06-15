import type { VisualizationSpec } from "@microsoft/fabric-visuals";
import type { ColumnMetadataMap } from "@/lib/to-data-table";
import query from "./company-summary.dax?raw";
import vegaLiteSpec from "./company-summary.json";

const connection = "salesModel";

export const columnMetadata: ColumnMetadataMap = {
    "Empresa Company": { name: "EmpresaCompany", displayName: "Empresa" },
    "Revenue": { name: "Revenue", displayName: "Facturacion", format: "€#,##0" },
    "Margin": { name: "Margin", displayName: "Margen", format: "€#,##0" },
    "Margin Percent": { name: "MarginPercent", displayName: "Margen %", format: "0.0%" },
    "Orders": { name: "Orders", displayName: "Pedidos", format: "#,##0" },
    "Active Clients": { name: "ActiveClients", displayName: "Clientes activos", format: "#,##0" }
};

export function companySummary() {
    return { connection, query, columnMetadata, vegaLiteSpec: vegaLiteSpec as VisualizationSpec };
}
