import { describe, expect, it } from "vitest";
import { companySummary, customerDetail, segmentSummary } from "./index";

describe("clientes queries", () => {
    it("builds the segment summary factory", () => {
        const visual = segmentSummary();

        expect(visual.connection).toBe("salesModel");
        expect(visual.query).toContain("'Cliente'[Segment]");
        expect(visual.vegaLiteSpec.mark).toMatchObject({ type: "bar" });
    });

    it("builds the company summary factory", () => {
        const visual = companySummary();

        expect(visual.query).toContain("'Empresa'[Company]");
        expect(visual.columnMetadata["Empresa Company"]?.displayName).toBe("Empresa");
    });

    it("builds the customer detail factory", () => {
        const visual = customerDetail();

        expect(visual.query).toContain("'Cliente'[Customer]");
        expect(visual.columnMetadata["Cliente Customer"]?.displayName).toBe("Cliente");
    });
});
