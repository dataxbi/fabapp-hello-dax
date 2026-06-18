//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import type { ColumnDef, DataTable } from "@microsoft/fabric-visuals-core";
import type { QueryTable } from "@microsoft/fabric-app-data";

/**
 * Dictionary keyed by the original column name from the DAX query result.
 * Each value holds the `ColumnDef` metadata for that column.
 */
export type ColumnMetadataMap = Record<string, ColumnDef>;

/**
 * Merges a raw SDK query table with static column metadata to produce
 * a `DataTable` that `VegaVisual` and `DataGrid` accept directly.
 *
 * @param queryTable - The `table` value from `CachedQueryResult` (SDK output).
 * @param columnMetadata - Metadata dictionary exported from the query barrel file,
 *                         keyed by the original column name.
 * @returns A `DataTable` with enriched `ColumnDef` entries and the original rows.
 *
 * @example
 * ```tsx
 * import { columnMetadata, query } from "@/queries/sales/revenue-by-region";
 * import { toDataTable } from "@/lib/to-data-table";
 *
 * const { data } = useSemanticModelQuery({ connection: "myModel", query });
 *
 * if (data?.status === "success") {
 *   const dataTable = toDataTable(data.table, columnMetadata);
 *   return <VegaVisual spec={vegaLiteSpec} data={dataTable} theme={theme} />;
 * }
 * ```
 */
export function toDataTable(
    queryTable: QueryTable,
    columnMetadata: ColumnMetadataMap,
): DataTable {
    const normalizedMetadata = new Map(
        Object.entries(columnMetadata).map(([key, value]) => [normalizeColumnName(key), value] as const),
    );

    const columns: ColumnDef[] = queryTable.columns.map((col) => {
        return (
            columnMetadata[col.name] ??
            normalizedMetadata.get(normalizeColumnName(col.name)) ??
            { name: col.name }
        );
    });

    const rows = queryTable.rows.map((row) =>
        row.map((value, index) => coerceCellValue(value, queryTable.columns[index]?.dataType)),
    );

    return { columns, rows };
}

function normalizeColumnName(input: string): string {
    return input.replace(/[\s.[\]\\'"`()%]/g, "").toLowerCase();
}

function coerceCellValue(value: unknown, dataType: string | undefined): unknown {
    if (value == null || typeof value !== "string" || !dataType) {
        return value;
    }

    const normalizedType = dataType.toLowerCase();

    if (normalizedType.includes("date")) {
        const parsedDate = new Date(value);
        return Number.isNaN(parsedDate.getTime()) ? value : parsedDate.toISOString();
    }

    if (
        normalizedType.includes("int") ||
        normalizedType.includes("decimal") ||
        normalizedType.includes("double") ||
        normalizedType.includes("number") ||
        normalizedType.includes("currency")
    ) {
        const isPercent = value.includes("%");
        const numericText = value
            .replace(/[€$£¥]/g, "")
            .replace(/\s/g, "")
            .replace(/,/g, "")
            .replace(/%/g, "");
        const parsedNumber = Number(numericText);

        if (!Number.isNaN(parsedNumber)) {
            return isPercent ? parsedNumber / 100 : parsedNumber;
        }
    }

    return value;
}
