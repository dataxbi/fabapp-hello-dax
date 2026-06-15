//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import App from "@/App";

vi.mock("@/components/pages/overview-page", () => ({
    OverviewPage: () => <div>OverviewPage</div>,
}));

vi.mock("@/components/pages/regions-page", () => ({
    RegionsPage: () => <div>RegionsPage</div>,
}));

vi.mock("@/components/pages/portfolio-page", () => ({
    PortfolioPage: () => <div>PortfolioPage</div>,
}));

vi.mock("@/components/pages/clients-page", () => ({
    ClientsPage: () => <div>ClientsPage</div>,
}));

vi.mock("@/hooks/theme.context", () => ({
    useThemeContext: () => ({
        isDark: false,
        toggleTheme: vi.fn(),
    }),
}));

describe("App", () => {
    it("renders without throwing", () => {
        expect(() => render(<App />)).not.toThrow();
    });

    it("mounts content into the document", () => {
        render(<App />);
        expect(document.body).not.toBeEmptyDOMElement();
    });
});
