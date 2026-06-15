import { describe, expect, it } from "vitest";
import { regionChannelBreakdown, regionComparison, regionMonthlyTrend } from "./index";

describe("regiones queries", () => {
    it("builds the region comparison factory", () => {
        const visual = regionComparison();

        expect(visual.connection).toBe("salesModel");
        expect(visual.query).toContain("'Region'[Region]");
        expect(visual.vegaLiteSpec.mark).toMatchObject({ type: "bar" });
    });

    it("builds the region monthly trend factory", () => {
        const visual = regionMonthlyTrend();

        expect(visual.query).toContain("'Fecha'[Year Month]");
        expect(visual.columnMetadata["Fecha Year Month"]?.displayName).toBe("Periodo");
    });

    it("builds the region channel breakdown factory", () => {
        const visual = regionChannelBreakdown();

        expect(visual.query).toContain("'Canal'[Channel Group]");
        expect(visual.columnMetadata["Canal Sales Channel"]?.displayName).toBe("Canal");
    });
});
