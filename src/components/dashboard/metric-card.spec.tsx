import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MetricCard, getDeltaTone } from "./metric-card";

describe("getDeltaTone", () => {
    it("returns stable for near-zero deltas", () => {
        expect(getDeltaTone(0).statusLabel).toBe("Estable");
    });

    it("returns improvement for positive deltas", () => {
        expect(getDeltaTone(0.12).statusLabel).toBe("Mejora");
    });

    it("returns decline for negative deltas", () => {
        expect(getDeltaTone(-0.08).statusLabel).toBe("Empeora");
    });
});

describe("MetricCard", () => {
    it("renders period, trend and context rows", () => {
        render(
            <MetricCard
                label="Facturación"
                value="€3.814.125"
                periodLabel="Cierre 2026-12"
                trendLabel="Mejora vs periodo anterior"
                deltaValue={0.061}
                contextItems={[
                    { label: "YTD actual", value: "€39.298.468" },
                    { label: "YTD anterior", value: "€38.008.641" },
                ]}
                accent="primary"
            />,
        );

        expect(screen.getByText("Cierre 2026-12")).toBeInTheDocument();
        expect(screen.getByText("Mejora vs periodo anterior")).toBeInTheDocument();
        expect(screen.getByText("YTD actual")).toBeInTheDocument();
        expect(screen.getByText("€38.008.641")).toBeInTheDocument();
    });
});
