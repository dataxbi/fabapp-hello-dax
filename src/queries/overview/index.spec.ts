import { describe, expect, it } from "vitest";
import { attentionItems, channelMix, kpiSummary, monthlyTrend, regionalComparison } from "./index";

describe("overview queries", () => {
    it("builds the KPI summary factory", () => {
        const visual = kpiSummary();

        expect(visual.connection).toBe("salesModel");
        expect(visual.query).toContain("Latest Period");
        expect(visual.columnMetadata["Revenue Current"]?.displayName).toBe("Facturacion actual");
    });

    it("builds the monthly trend factory", () => {
        const visual = monthlyTrend();

        expect(visual.query).toContain("'Fecha'[Year Month]");
        expect(visual.vegaLiteSpec.mark).toMatchObject({ type: "line" });
    });

    it("builds the regional comparison factory", () => {
        const visual = regionalComparison();

        expect(visual.query).toContain("'Region'[Region]");
        expect(visual.columnMetadata["Revenue vs Previous %"]?.format).toBe("0.0%");
    });

    it("builds the channel mix factory", () => {
        const visual = channelMix();

        expect(visual.query).toContain("'Canal'[Sales Channel]");
        expect(visual.vegaLiteSpec.layer?.[0]).toMatchObject({
            mark: { type: "bar" },
        });
    });

    it("injects filters into overview queries when provided", () => {
        const visual = kpiSummary({ region: "Norte" });

        expect(visual.query).toContain("CALCULATETABLE(");
        expect(visual.query).toContain(`KEEPFILTERS(TREATAS({ "Norte" }, 'Region'[Region]))`);
    });

    it("builds the attention items factory", () => {
        const visual = attentionItems();

        expect(visual.query).toContain("Revenue Var Percent");
        expect(visual.columnMetadata["Scope"]?.displayName).toBe("Ambito");
    });
});
