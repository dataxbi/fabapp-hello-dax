import { describe, expect, it } from "vitest";
import { overviewDynamicRangeStats, overviewDynamicTextFilterValues, toDynamicFilterDefinitions } from "./dynamic-filters";

describe("toDynamicFilterDefinitions", () => {
    it("maps visible metadata rows to typed filter definitions", () => {
        expect(
            toDynamicFilterDefinitions([
                {
                    Table: "Fecha",
                    Column: "Date",
                    DataType: "Date",
                    DataCategory: "Regular",
                    SummarizeBy: "None",
                    FormatString: "Long Date",
                    SortByColumn: null,
                },
                {
                    Table: "Producto",
                    Column: "Brand",
                    DataType: "Text",
                    DataCategory: "Regular",
                    SummarizeBy: "Default",
                    FormatString: null,
                    SortByColumn: null,
                },
            ]),
        ).toEqual([
            expect.objectContaining({
                id: "Fecha.Date",
                filterKind: "date",
            }),
            expect.objectContaining({
                id: "Producto.Brand",
                filterKind: "text",
            }),
        ]);
    });

    it("filters out likely technical columns", () => {
        expect(
            toDynamicFilterDefinitions([
                {
                    Table: "Producto",
                    Column: "Product ID",
                    DataType: "Text",
                },
            ]),
        ).toEqual([]);
    });
});

describe("dynamic filter query builders", () => {
    it("builds a distinct value query for text filters", () => {
        const visual = overviewDynamicTextFilterValues({
            id: "Producto.Brand",
            table: "Producto",
            column: "Brand",
            label: "Brand",
            dataType: "Text",
            filterKind: "text",
        });

        expect(visual.query).toContain("VALUES('Producto'[Brand])");
        expect(visual.query).toContain(`"Value", 'Producto'[Brand]`);
    });

    it("builds a range stats query for date filters", () => {
        const visual = overviewDynamicRangeStats({
            id: "Fecha.Date",
            table: "Fecha",
            column: "Date",
            label: "Date",
            dataType: "Date",
            filterKind: "date",
        });

        expect(visual.query).toContain(`FORMAT(MIN('Fecha'[Date]), "yyyy-mm-dd")`);
        expect(visual.query).toContain(`FORMAT(MAX('Fecha'[Date]), "yyyy-mm-dd")`);
    });
});
