import { describe, expect, it } from "vitest";
import { applyDynamicSemanticFilters, buildDynamicFilterExpression } from "./dynamic-semantic-filters";

describe("buildDynamicFilterExpression", () => {
    it("builds a TREATAS expression for text filters", () => {
        expect(
            buildDynamicFilterExpression({
                id: "region",
                table: "Region",
                column: "Region",
                label: "Region",
                filterKind: "text",
                value: {
                    kind: "text",
                    value: "Norte",
                },
            }),
        ).toBe(`KEEPFILTERS(TREATAS({ "Norte" }, 'Region'[Region]))`);
    });

    it("builds a bounded date filter expression", () => {
        expect(
            buildDynamicFilterExpression({
                id: "date",
                table: "Fecha",
                column: "Date",
                label: "Fecha",
                filterKind: "date",
                value: {
                    kind: "date",
                    start: "2026-01-01",
                    end: "2026-12-31",
                },
            }),
        ).toBe(
            `KEEPFILTERS(FILTER(ALL('Fecha'[Date]), 'Fecha'[Date] >= DATE(2026, 1, 1) && 'Fecha'[Date] <= DATE(2026, 12, 31)))`,
        );
    });

    it("builds a numeric range filter expression", () => {
        expect(
            buildDynamicFilterExpression({
                id: "year",
                table: "Fecha",
                column: "Year",
                label: "Year",
                filterKind: "number",
                value: {
                    kind: "number",
                    min: 2025,
                    max: 2026,
                },
            }),
        ).toBe(`KEEPFILTERS(FILTER(ALL('Fecha'[Year]), 'Fecha'[Year] >= 2025 && 'Fecha'[Year] <= 2026))`);
    });
});

describe("applyDynamicSemanticFilters", () => {
    const baseQuery = `DEFINE
  VAR _Core = ROW("Value", 1)
EVALUATE
_Core
ORDER BY [Value] DESC`;

    it("returns the original query when there are no active dynamic filters", () => {
        expect(applyDynamicSemanticFilters(baseQuery)).toBe(baseQuery);
    });

    it("wraps the query with CALCULATETABLE when dynamic filters exist", () => {
        const filtered = applyDynamicSemanticFilters(baseQuery, [
            {
                id: "region",
                table: "Region",
                column: "Region",
                label: "Region",
                filterKind: "text",
                value: { kind: "text", value: "Norte" },
            },
        ]);

        expect(filtered).toContain("EVALUATE\nCALCULATETABLE(");
        expect(filtered).toContain(`KEEPFILTERS(TREATAS({ "Norte" }, 'Region'[Region]))`);
        expect(filtered).toContain("ORDER BY [Value] DESC");
    });
});
