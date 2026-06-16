import { describe, expect, it } from "vitest";
import type { VisualizationSpec } from "@microsoft/fabric-visuals";
import {
    deriveOverviewFilter,
    getCombinedOverviewFilters,
    hasOverviewActiveFilters,
    highlightOverviewVisual,
    listOverviewActiveFilters,
    reduceOverviewFilters,
} from "./overview-filters";

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

    it("only clears the current filter when the clear event comes from the source visual", () => {
        const current = {
            monthlyTrend: {
                source: "monthlyTrend",
                label: "Periodo",
                detail: "2026-12",
                filters: { yearMonth: "2026-12" },
            },
        } as const;

        expect(reduceOverviewFilters(current, "monthlyTrend", [{ action: "clear" }])).toEqual({});
        expect(reduceOverviewFilters(current, "channelMix", [{ action: "clear" }])).toEqual(current);
    });

    it("toggles the filter off when the same element is selected again", () => {
        const current = {
            regionalComparison: {
                source: "regionalComparison",
                label: "Región",
                detail: "Norte",
                filters: { region: "Norte" },
            },
        } as const;

        expect(
            reduceOverviewFilters(current, "regionalComparison", [
                {
                    action: "select",
                    selections: [
                        {
                            predicates: [{ type: "set", name: "RegionRegion", values: ["Norte"] }],
                        },
                    ],
                },
            ]),
        ).toEqual({});
    });

    it("combines orthogonal filters from multiple visuals", () => {
        const nextState = reduceOverviewFilters(
            {
                monthlyTrend: {
                    source: "monthlyTrend",
                    label: "Periodo",
                    detail: "2026-12",
                    filters: { yearMonth: "2026-12" },
                },
            },
            "channelMix",
            [
                {
                    action: "select",
                    selections: [
                        {
                            predicates: [{ type: "set", name: "CanalSalesChannel", values: ["Directo"] }],
                        },
                    ],
                },
            ],
        );

        expect(getCombinedOverviewFilters(nextState)).toEqual({
            yearMonth: "2026-12",
            salesChannel: "Directo",
        });
        expect(listOverviewActiveFilters(nextState)).toHaveLength(2);
        expect(hasOverviewActiveFilters(nextState)).toBe(true);
    });

    it("replaces conflicting filters that target the same dimension", () => {
        const nextState = reduceOverviewFilters(
            {
                regionalComparison: {
                    source: "regionalComparison",
                    label: "Región",
                    detail: "Norte",
                    filters: { region: "Norte" },
                },
            },
            "attentionItems",
            [
                {
                    action: "select",
                    selections: [
                        {
                            predicates: [
                                { type: "set", name: "Scope", values: ["Region"] },
                                { type: "set", name: "Entity", values: ["Sur"] },
                            ],
                        },
                    ],
                },
            ],
        );

        expect(nextState.regionalComparison).toBeUndefined();
        expect(getCombinedOverviewFilters(nextState)).toEqual({ region: "Sur" });
    });

    it("dims non-selected bars when a categorical overview visual is the active filter source", () => {
        const spec: VisualizationSpec = {
            mark: { type: "bar" },
            encoding: {
                x: { field: "Revenue", type: "quantitative" },
                y: { field: "RegionRegion", type: "nominal" },
            },
        };

        const highlighted = highlightOverviewVisual("regionalComparison", spec, {
            regionalComparison: {
                source: "regionalComparison",
                label: "Región",
                detail: "Norte",
                filters: { region: "Norte" },
            },
        }) as {
            encoding?: {
                opacity?: {
                    condition?: { test?: string; value?: number };
                    value?: number;
                };
            };
        };

        expect(highlighted.encoding?.opacity?.condition?.test).toContain('datum.RegionRegion === "Norte"');
        expect(highlighted.encoding?.opacity?.value).toBe(0.35);
    });
});
