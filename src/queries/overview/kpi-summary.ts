import type { VisualizationSpec } from "@microsoft/fabric-visuals";
import type { ColumnMetadataMap } from "@/lib/to-data-table";
import { applyOverviewFilters, type OverviewFilters } from "./filters";
import query from "./kpi-summary.dax?raw";
import vegaLiteSpec from "./kpi-summary.json";

const connection = "salesModel";

export const columnMetadata: ColumnMetadataMap = {
    "Latest Period": { name: "LatestPeriod", displayName: "Periodo" },
    "Revenue Current": { name: "RevenueCurrent", displayName: "Facturacion actual", format: "€#,##0" },
    "Revenue Previous": { name: "RevenuePrevious", displayName: "Facturacion periodo anterior", format: "€#,##0" },
    "Revenue vs Previous %": { name: "RevenueVsPreviousPct", displayName: "Facturacion vs periodo anterior", format: "0.0%" },
    "Revenue vs Last Year %": { name: "RevenueVsLastYearPct", displayName: "Facturacion vs año anterior", format: "0.0%" },
    "Revenue YTD": { name: "RevenueYtd", displayName: "Facturacion YTD", format: "€#,##0" },
    "Revenue YTD Previous": { name: "RevenueYtdPrevious", displayName: "Facturacion YTD anterior", format: "€#,##0" },
    "Revenue YTD vs Previous %": { name: "RevenueYtdVsPreviousPct", displayName: "Facturacion YTD vs anterior", format: "0.0%" },
    "Margin Current": { name: "MarginCurrent", displayName: "Margen actual", format: "€#,##0" },
    "Margin vs Previous %": { name: "MarginVsPreviousPct", displayName: "Margen vs periodo anterior", format: "0.0%" },
    "Margin Percent Current": { name: "MarginPercentCurrent", displayName: "Margen % actual", format: "0.0%" },
    "Margin Percent Previous": { name: "MarginPercentPrevious", displayName: "Margen % periodo anterior", format: "0.0%" },
    "Orders Current": { name: "OrdersCurrent", displayName: "Pedidos actuales", format: "#,##0" },
    "Orders vs Previous %": { name: "OrdersVsPreviousPct", displayName: "Pedidos vs periodo anterior", format: "0.0%" },
    "Active Clients Current": { name: "ActiveClientsCurrent", displayName: "Clientes activos actuales", format: "#,##0" },
    "Active Clients vs Previous %": { name: "ActiveClientsVsPreviousPct", displayName: "Clientes activos vs periodo anterior", format: "0.0%" }
};

export function kpiSummary(filters?: OverviewFilters): {
    connection: string;
    query: string;
    columnMetadata: ColumnMetadataMap;
    vegaLiteSpec: VisualizationSpec;
} {
    return {
        connection,
        query: applyOverviewFilters(query, filters),
        columnMetadata,
        vegaLiteSpec: vegaLiteSpec as VisualizationSpec,
    };
}
