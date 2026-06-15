import { describe, expect, it } from "vitest";
import { applyOverviewFilters } from "./filters";

describe("applyOverviewFilters", () => {
    const baseQuery = `DEFINE
  VAR _Core = ROW("Value", 1)
EVALUATE
_Core
ORDER BY [Value] DESC`;

    it("returns the original query when there are no filters", () => {
        expect(applyOverviewFilters(baseQuery)).toBe(baseQuery);
    });

    it("wraps the evaluate body with CALCULATETABLE when filters exist", () => {
        const filtered = applyOverviewFilters(baseQuery, {
            region: "Norte",
            salesChannel: "Directo",
        });

        expect(filtered).toContain("EVALUATE\nCALCULATETABLE(");
        expect(filtered).toContain(`KEEPFILTERS(TREATAS({ "Norte" }, 'Region'[Region]))`);
        expect(filtered).toContain(`KEEPFILTERS(TREATAS({ "Directo" }, 'Canal'[Sales Channel]))`);
        expect(filtered).toContain("ORDER BY [Value] DESC");
    });
});
