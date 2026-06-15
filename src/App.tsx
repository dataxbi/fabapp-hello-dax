import type { ComponentType } from "react";
import { BarChart3, BriefcaseBusiness, LayoutDashboard, MoonStar, SunMedium, Users } from "lucide-react";
import { useMemo, useState } from "react";
import logoUrl from "../resources/dataxbi-logo.png";
import { OverviewPage } from "@/components/pages/overview-page";
import { RegionsPage } from "@/components/pages/regions-page";
import { PortfolioPage } from "@/components/pages/portfolio-page";
import { ClientsPage } from "@/components/pages/clients-page";
import { useThemeContext } from "@/hooks/theme.context";
import { cn } from "@/lib/utils";

type PageId = "overview" | "regions" | "portfolio" | "clients";

const pages: Array<{
    id: PageId;
    label: string;
    description: string;
    icon: ComponentType<{ className?: string }>;
}> = [
    {
        id: "overview",
        label: "Overview",
        description: "Estado del negocio",
        icon: LayoutDashboard,
    },
    {
        id: "regions",
        label: "Regiones",
        description: "Lectura territorial",
        icon: BarChart3,
    },
    {
        id: "portfolio",
        label: "Portfolio",
        description: "Mix y rentabilidad",
        icon: BriefcaseBusiness,
    },
    {
        id: "clients",
        label: "Clientes",
        description: "Base comercial",
        icon: Users,
    },
];

function App() {
    const [activePage, setActivePage] = useState<PageId>("overview");
    const { isDark, toggleTheme } = useThemeContext();

    const activeContent = useMemo(() => {
        switch (activePage) {
            case "regions":
                return <RegionsPage />;
            case "portfolio":
                return <PortfolioPage />;
            case "clients":
                return <ClientsPage />;
            case "overview":
            default:
                return <OverviewPage />;
        }
    }, [activePage]);

    return (
        <div className="min-h-full bg-background text-foreground">
            <div className="mx-auto grid min-h-full max-w-[1560px] gap-l px-l py-l xl:grid-cols-[280px_minmax(0,1fr)]">
                <aside className="rounded-[32px] border border-border bg-card/95 p-xl shadow-[0_18px_60px_rgba(7,17,31,0.08)] backdrop-blur-sm xl:sticky xl:top-l xl:h-[calc(100vh-24px)]">
                    <div className="rounded-[28px] border border-primary/20 bg-[radial-gradient(circle_at_top_left,rgba(10,184,166,0.22),transparent_44%),radial-gradient(circle_at_bottom_right,rgba(28,46,112,0.26),transparent_48%)] p-l">
                        <img src={logoUrl} alt="Dataxbi" className="h-12 w-auto object-contain" />
                        <p className="mt-l text-[length:var(--text-200)] uppercase tracking-[0.24em] text-primary">
                            Sales cockpit
                        </p>
                        <h1 className="mt-s font-heading text-[length:var(--text-hero-800)] leading-hero-800 text-foreground">
                            Ventas
                        </h1>
                        <p className="mt-m text-[length:var(--text-300)] leading-300 text-muted-foreground">
                            Shell ejecutivo multipágina para dirección, regiones, portfolio comercial y clientes.
                        </p>
                    </div>

                    <nav className="mt-xl space-y-s" aria-label="Navegación principal">
                        {pages.map((page) => {
                            const Icon = page.icon;
                            const isActive = activePage === page.id;

                            return (
                                <button
                                    key={page.id}
                                    type="button"
                                    onClick={() => setActivePage(page.id)}
                                    className={cn(
                                        "flex w-full items-center gap-m rounded-3xl border px-l py-m text-left transition-all",
                                        isActive
                                            ? "border-primary/35 bg-primary/[0.08] text-foreground"
                                            : "border-transparent bg-background/50 text-muted-foreground hover:border-border hover:bg-muted/60 hover:text-foreground",
                                    )}
                                >
                                    <span className={cn("inline-flex rounded-2xl p-s", isActive ? "bg-primary/12 text-primary" : "bg-muted text-muted-foreground")}>
                                        <Icon className="icon-size-300" />
                                    </span>
                                    <span className="min-w-0">
                                        <span className="block font-semibold">{page.label}</span>
                                        <span className="block text-[length:var(--text-200)] text-muted-foreground">{page.description}</span>
                                    </span>
                                </button>
                            );
                        })}
                    </nav>

                    <div className="mt-xl rounded-3xl border border-border bg-background/70 p-l">
                        <p className="text-[length:var(--text-200)] uppercase tracking-[0.24em] text-primary">Criterios clave</p>
                        <ul className="mt-m space-y-s text-[length:var(--text-200)] leading-200 text-muted-foreground">
                            <li>Datos reales del modelo semántico publicado.</li>
                            <li>Formato local es-ES y navegación persistente.</li>
                            <li>Branding Dataxbi consistente en light y dark mode.</li>
                        </ul>
                    </div>

                    <button
                        type="button"
                        onClick={toggleTheme}
                        className="mt-xl inline-flex items-center gap-s rounded-full border border-border bg-background px-l py-s text-[length:var(--text-200)] font-semibold text-foreground transition hover:border-primary/40 hover:text-primary"
                    >
                        {isDark ? <SunMedium className="icon-size-200" /> : <MoonStar className="icon-size-200" />}
                        {isDark ? "Modo claro" : "Modo oscuro"}
                    </button>
                </aside>

                <main className="rounded-[32px] border border-border bg-card/80 p-xl shadow-[0_18px_60px_rgba(7,17,31,0.08)] backdrop-blur-sm">
                    {activeContent}
                </main>
            </div>
        </div>
    );
}

export default App;
