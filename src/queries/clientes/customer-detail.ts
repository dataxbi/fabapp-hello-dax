import type { VisualizationSpec } from "@microsoft/fabric-visuals";
import type { ColumnMetadataMap } from "@/lib/to-data-table";
import query from "./customer-detail.dax?raw";
import vegaLiteSpec from "./customer-detail.json";

const connection = "salesModel";

export const columnMetadata: ColumnMetadataMap = {
    "Cliente Customer": { name: "ClienteCustomer", displayName: "Cliente" },
    "Empresa Company": { name: "EmpresaCompany", displayName: "Empresa" },
    "Cliente Segment": { name: "ClienteSegment", displayName: "Segmento" },
    "Region Region": { name: "RegionRegion", displayName: "Region" },
    "Revenue": { name: "Revenue", displayName: "Facturacion", format: "€#,##0" },
    "Margin": { name: "Margin", displayName: "Margen", format: "€#,##0" },
    "Margin Percent": { name: "MarginPercent", displayName: "Margen %", format: "0.0%" },
    "Orders": { name: "Orders", displayName: "Pedidos", format: "#,##0" },
    "Units": { name: "Units", displayName: "Unidades", format: "#,##0" }
};

export function customerDetail() {
    return { connection, query, columnMetadata, vegaLiteSpec: vegaLiteSpec as VisualizationSpec };
}
