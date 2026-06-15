//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import { toDataTable } from "@/lib/to-data-table";
import type { ColumnMetadataMap } from "@/lib/to-data-table";
import type { QueryTable } from "@microsoft/fabric-app-data";

describe("toDataTable", () => {
    const queryTable: QueryTable = {
        columns: [
            { name: "Products[Region]", dataType: "string" },
            { name: "[Total Revenue]", dataType: "number" },
        ],
        rows: [
            ["East", 100],
            ["West", 200],
        ],
    };

    it("merges column metadata with the query table columns", () => {
        const columnMetadata: ColumnMetadataMap = {
            "Products[Region]": { name: "ProductsRegion", displayName: "Region" },
            "[Total Revenue]": { name: "TotalRevenue", displayName: "Total Revenue", format: "$#,0.00" },
        };

        const result = toDataTable(queryTable, columnMetadata);

        expect(result.columns).toEqual([
            { name: "ProductsRegion", displayName: "Region" },
            { name: "TotalRevenue", displayName: "Total Revenue", format: "$#,0.00" },
        ]);
    });

    it("falls back to { name: col.name } for columns with no metadata entry", () => {
        const result = toDataTable(queryTable, {});

        expect(result.columns).toEqual([
            { name: "Products[Region]" },
            { name: "[Total Revenue]" },
        ]);
    });

    it("passes rows through unchanged", () => {
        const result = toDataTable(queryTable, {});

        expect(result.rows).toEqual(queryTable.rows);
    });

    it("applies metadata to known columns and falls back for unknown ones", () => {
        const columnMetadata: ColumnMetadataMap = {
            "Products[Region]": { name: "ProductsRegion", displayName: "Region" },
        };

        const result = toDataTable(queryTable, columnMetadata);

        expect(result.columns[0]).toEqual({ name: "ProductsRegion", displayName: "Region" });
        expect(result.columns[1]).toEqual({ name: "[Total Revenue]" });
    });

    it("matches metadata using normalized column names when runtime names differ", () => {
        const runtimeQueryTable: QueryTable = {
            columns: [{ name: "Fecha[Year Month]", dataType: "string" }],
            rows: [["2026-12"]],
        };
        const columnMetadata: ColumnMetadataMap = {
            "Fecha Year Month": { name: "FechaYearMonth", displayName: "Periodo" },
        };

        const result = toDataTable(runtimeQueryTable, columnMetadata);

        expect(result.columns).toEqual([{ name: "FechaYearMonth", displayName: "Periodo" }]);
    });

    it("coerces numeric strings based on query column data types", () => {
        const typedQueryTable: QueryTable = {
            columns: [
                { name: "Revenue", dataType: "Decimal" },
                { name: "Margin Percent", dataType: "Double" },
                { name: "Orders", dataType: "Int64" },
            ],
            rows: [["$3,814,125.17", "30.20%", "1,227"]],
        };

        const result = toDataTable(typedQueryTable, {});

        expect(result.rows).toEqual([[3814125.17, 0.302, 1227]]);
    });
});
