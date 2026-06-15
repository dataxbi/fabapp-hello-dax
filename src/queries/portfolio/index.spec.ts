import { describe, expect, it } from "vitest";
import { brandPerformance, categoryPerformance, mixPrioritization } from "./index";

describe("portfolio queries", () => {
    it("builds the category performance factory", () => {
        const visual = categoryPerformance();

        expect(visual.connection).toBe("salesModel");
        expect(visual.query).toContain("'Producto'[Category]");
        expect(visual.columnMetadata["Units"]?.format).toBe("#,##0");
    });

    it("builds the brand performance factory", () => {
        const visual = brandPerformance();

        expect(visual.query).toContain("'Producto'[Brand]");
        expect(visual.vegaLiteSpec.mark).toMatchObject({ type: "point" });
    });

    it("builds the mix prioritization factory", () => {
        const visual = mixPrioritization();

        expect(visual.query).toContain("Revenue Share");
        expect(visual.columnMetadata["Margin Share"]?.displayName).toBe("Peso en margen");
    });
});
