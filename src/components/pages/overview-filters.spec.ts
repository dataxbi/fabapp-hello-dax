import { describe, expect, it } from "vitest";
import { deriveOverviewFilter } from "./overview-filters";

describe("deriveOverviewFilter", () => {
    it("maps monthly trend selections to a year-month filter", () => {
        const filter = deriveOverviewFilter("monthlyTrend", [
            {
                action: "select",
                selections: [
                    {
                        predicates: [
                            {
                                type: "set",
                                name: "FechaYearMonth",
                                values: ["2026-12"],
                            },
                        ],
                    },
                ],
            },
        ]);

        expect(filter).toEqual({
            source: "monthlyTrend",
            label: "Periodo",
            detail: "2026-12",
            filters: { yearMonth: "2026-12" },
        });
    });

    it("maps attention rows with region scope to a region filter", () => {
        const filter = deriveOverviewFilter("attentionItems", [
            {
                action: "select",
                selections: [
                    {
                        predicates: [
                            { type: "set", name: "Scope", values: ["Region"] },
                            { type: "set", name: "Entity", values: ["Norte"] },
                        ],
                    },
                ],
            },
        ]);

        expect(filter?.filters).toEqual({ region: "Norte" });
        expect(filter?.label).toBe("Región prioritaria");
    });

    it("clears the filter when the event is clear", () => {
        expect(deriveOverviewFilter("channelMix", [{ action: "clear" }])).toBeNull();
    });
});
