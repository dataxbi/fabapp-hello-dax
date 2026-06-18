import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Check, ChevronsUpDown, Filter, Search, SlidersHorizontal, X } from "lucide-react";
import { convertDataTableToRows } from "@microsoft/fabric-visuals-core";
import type { QueryTable } from "@microsoft/fabric-app-data";
import {
    type DynamicFilterDefinition,
    type DynamicSemanticFilter,
    type DynamicDateFilterValue,
    type DynamicNumberFilterValue,
    type DynamicTextFilterValue,
} from "@/lib/dynamic-semantic-filters";
import { useSemanticModelQuery } from "@/hooks/use-semantic-model-query";
import { toDataTable } from "@/lib/to-data-table";
import { cn } from "@/lib/utils";
import {
    metadataColumnMetadata,
    overviewDynamicFilterCatalog,
    overviewDynamicRangeStats,
    overviewDynamicTextFilterValues,
    statsColumnMetadata,
    toDynamicFilterDefinitions,
    valueColumnMetadata,
} from "@/queries/overview/dynamic-filters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface OverviewDynamicFilterPanelProps {
    activeFilters: Record<string, DynamicSemanticFilter>;
    onUpsertFilter: (filter: DynamicSemanticFilter) => void;
    onRemoveFilter: (filterId: string) => void;
    onClearAll: () => void;
}

function parseRows<T extends Record<string, unknown>>(table: QueryTable, columnMetadata: typeof metadataColumnMetadata) {
    return convertDataTableToRows(toDataTable(table, columnMetadata)) as T[];
}

function parseValueRows(table: QueryTable) {
    return convertDataTableToRows(toDataTable(table, valueColumnMetadata)) as Array<{ Value?: string }>;
}

function parseStatsRows(table: QueryTable) {
    return convertDataTableToRows(toDataTable(table, statsColumnMetadata)) as Array<{
        MinValue?: string | number | null;
        MaxValue?: string | number | null;
    }>;
}

function groupDefinitions(definitions: DynamicFilterDefinition[]) {
    return definitions.reduce<Record<string, DynamicFilterDefinition[]>>((acc, definition) => {
        acc[definition.table] ??= [];
        acc[definition.table].push(definition);
        return acc;
    }, {});
}

function TextFilterControl({
    definition,
    activeFilter,
    onUpsertFilter,
    onRemoveFilter,
}: {
    definition: DynamicFilterDefinition;
    activeFilter?: DynamicSemanticFilter;
    onUpsertFilter: (filter: DynamicSemanticFilter) => void;
    onRemoveFilter: (filterId: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const deferredSearch = useDeferredValue(search);
    const currentValue = activeFilter?.value.kind === "text" ? activeFilter.value.value : undefined;
    const visual = overviewDynamicTextFilterValues(definition, deferredSearch);
    const { data, isLoading } = useSemanticModelQuery({
        connection: open ? visual.connection : "",
        query: open ? visual.query : "",
    });

    const options = useMemo(() => {
        if (data?.status !== "success") {
            return [];
        }

        return parseValueRows(data.table)
            .map((row) => row.Value)
            .filter((value): value is string => typeof value === "string");
    }, [data]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between rounded-3xl text-left">
                    <span className="truncate">{currentValue ?? definition.label}</span>
                    <ChevronsUpDown className="icon-size-200 text-muted-foreground" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[360px] p-0">
                <Command shouldFilter={false}>
                    <CommandInput placeholder={`Buscar ${definition.label.toLowerCase()}`} value={search} onValueChange={setSearch} />
                    <CommandList>
                        {isLoading ? <div className="px-m py-l text-[length:var(--text-200)] text-muted-foreground">Cargando opciones…</div> : null}
                        <CommandEmpty>No se han encontrado valores.</CommandEmpty>
                        <CommandGroup>
                            {currentValue ? (
                                <CommandItem
                                    value="__clear__"
                                    onSelect={() => {
                                        onRemoveFilter(definition.id);
                                        setOpen(false);
                                    }}
                                >
                                    <X className="icon-size-200 text-muted-foreground" />
                                    Limpiar filtro
                                </CommandItem>
                            ) : null}
                            {options.map((option) => (
                                <CommandItem
                                    key={option}
                                    value={option}
                                    onSelect={() => {
                                        const value: DynamicTextFilterValue = {
                                            kind: "text",
                                            value: option,
                                        };
                                        onUpsertFilter({
                                            id: definition.id,
                                            table: definition.table,
                                            column: definition.column,
                                            label: definition.label,
                                            filterKind: definition.filterKind,
                                            value,
                                        });
                                        setOpen(false);
                                    }}
                                >
                                    <Check className={cn("icon-size-200", option === currentValue ? "opacity-100 text-primary" : "opacity-0")} />
                                    <span className="truncate">{option}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

function RangeFilterControl({
    definition,
    activeFilter,
    onUpsertFilter,
    onRemoveFilter,
}: {
    definition: DynamicFilterDefinition;
    activeFilter?: DynamicSemanticFilter;
    onUpsertFilter: (filter: DynamicSemanticFilter) => void;
    onRemoveFilter: (filterId: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");
    const visual = overviewDynamicRangeStats(definition);
    const { data, isLoading, error } = useSemanticModelQuery({
        connection: open ? visual.connection : "",
        query: open ? visual.query : "",
    });

    useEffect(() => {
        if (activeFilter?.value.kind === "date") {
            setStart(activeFilter.value.start ?? "");
            setEnd(activeFilter.value.end ?? "");
            return;
        }

        if (activeFilter?.value.kind === "number") {
            setStart(activeFilter.value.min != null ? String(activeFilter.value.min) : "");
            setEnd(activeFilter.value.max != null ? String(activeFilter.value.max) : "");
            return;
        }

        setStart("");
        setEnd("");
    }, [activeFilter]);

    const stats = useMemo(() => {
        if (data?.status !== "success") {
            return { min: undefined, max: undefined };
        }

        const [row] = parseStatsRows(data.table);
        return {
            min: row?.MinValue ?? undefined,
            max: row?.MaxValue ?? undefined,
        };
    }, [data]);

    const applyFilter = () => {
        if (definition.filterKind === "date") {
            const value: DynamicDateFilterValue = {
                kind: "date",
                start: start || undefined,
                end: end || undefined,
            };

            if (!value.start && !value.end) {
                onRemoveFilter(definition.id);
            } else {
                onUpsertFilter({
                    id: definition.id,
                    table: definition.table,
                    column: definition.column,
                    label: definition.label,
                    filterKind: definition.filterKind,
                    value,
                });
            }
        }

        if (definition.filterKind === "number") {
            const min = start ? Number(start) : undefined;
            const max = end ? Number(end) : undefined;
            const value: DynamicNumberFilterValue = {
                kind: "number",
                min: Number.isFinite(min) ? min : undefined,
                max: Number.isFinite(max) ? max : undefined,
            };

            if (value.min == null && value.max == null) {
                onRemoveFilter(definition.id);
            } else {
                onUpsertFilter({
                    id: definition.id,
                    table: definition.table,
                    column: definition.column,
                    label: definition.label,
                    filterKind: definition.filterKind,
                    value,
                });
            }
        }

        setOpen(false);
    };

    const summary =
        definition.filterKind === "date"
            ? [start || "inicio", end || "fin"].join(" → ")
            : [start || "mín", end || "máx"].join(" → ");

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between rounded-3xl text-left">
                    <span className="truncate">{activeFilter ? summary : definition.label}</span>
                    <ChevronsUpDown className="icon-size-200 text-muted-foreground" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="space-y-m">
                <div>
                    <p className="font-semibold text-foreground">{definition.label}</p>
                    <p className="text-[length:var(--text-200)] text-muted-foreground">
                        {isLoading
                            ? "Calculando rango disponible…"
                            : `Disponible: ${stats.min ?? "—"} a ${stats.max ?? "—"}`}
                    </p>
                </div>
                {error ? (
                    <div className="rounded-2xl border border-destructive/30 bg-destructive/8 p-m text-[length:var(--text-200)] text-destructive">
                        {error.message}
                    </div>
                ) : null}
                <div className="grid gap-s md:grid-cols-2">
                    <Input
                        type={definition.filterKind === "date" ? "date" : "number"}
                        value={start}
                        onChange={(event) => setStart(event.target.value)}
                        placeholder={definition.filterKind === "date" ? "Desde" : "Mínimo"}
                    />
                    <Input
                        type={definition.filterKind === "date" ? "date" : "number"}
                        value={end}
                        onChange={(event) => setEnd(event.target.value)}
                        placeholder={definition.filterKind === "date" ? "Hasta" : "Máximo"}
                    />
                </div>
                <div className="flex items-center justify-between gap-s">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setStart("");
                            setEnd("");
                            onRemoveFilter(definition.id);
                            setOpen(false);
                        }}
                    >
                        Limpiar
                    </Button>
                    <Button size="sm" onClick={applyFilter}>
                        Aplicar
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}

function DynamicFilterField(props: {
    definition: DynamicFilterDefinition;
    activeFilter?: DynamicSemanticFilter;
    onUpsertFilter: (filter: DynamicSemanticFilter) => void;
    onRemoveFilter: (filterId: string) => void;
}) {
    const { definition } = props;

    if (definition.filterKind === "text") {
        return <TextFilterControl {...props} />;
    }

    return <RangeFilterControl {...props} />;
}

export function OverviewDynamicFilterPanel({
    activeFilters,
    onUpsertFilter,
    onRemoveFilter,
    onClearAll,
}: OverviewDynamicFilterPanelProps) {
    const [sheetSearch, setSheetSearch] = useState("");
    const metadataVisual = overviewDynamicFilterCatalog();
    const { data, isLoading, error } = useSemanticModelQuery({
        connection: metadataVisual.connection,
        query: metadataVisual.query,
    });

    const definitions = useMemo(() => {
        if (data?.status !== "success") {
            return [] as DynamicFilterDefinition[];
        }

        return toDynamicFilterDefinitions(parseRows<Record<string, unknown>>(data.table, metadataColumnMetadata));
    }, [data]);

    const filteredDefinitions = useMemo(() => {
        const term = sheetSearch.trim().toLowerCase();

        if (!term) {
            return definitions;
        }

        return definitions.filter((definition) => {
            const haystack = `${definition.table} ${definition.label} ${definition.dataType}`.toLowerCase();
            return haystack.includes(term);
        });
    }, [definitions, sheetSearch]);

    const groupedDefinitions = useMemo(() => groupDefinitions(filteredDefinitions), [filteredDefinitions]);
    const activeFilterList = useMemo(() => Object.values(activeFilters), [activeFilters]);

    return (
        <div className="rounded-4xl border border-border bg-card/80 p-l shadow-[0_18px_60px_rgba(7,17,31,0.08)]">
            <div className="flex flex-col gap-m lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-xs">
                    <p className="text-[length:var(--text-200)] uppercase tracking-[0.24em] text-primary">Slicers dinámicos</p>
                    <div className="flex flex-wrap items-center gap-s text-[length:var(--text-200)] text-muted-foreground">
                        <span>Descubiertos desde `INFO.VIEW.COLUMNS()` al cargar la página.</span>
                        <span>{definitions.length} filtros elegibles.</span>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-s">
                    {activeFilterList.length > 0 ? (
                        <Button variant="ghost" size="sm" onClick={onClearAll}>
                            <X className="icon-size-200" />
                            Limpiar todo
                        </Button>
                    ) : null}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline">
                                <SlidersHorizontal className="icon-size-200" />
                                Buscar y filtrar
                            </Button>
                        </SheetTrigger>
                        <SheetContent>
                            <SheetHeader>
                                <SheetTitle>Filtros dinámicos del modelo</SheetTitle>
                                <SheetDescription>
                                    Texto con búsqueda sobre opciones, fechas con rango y numéricos con mínimo/máximo.
                                </SheetDescription>
                            </SheetHeader>

                            <div className="mt-l flex min-h-0 flex-1 flex-col gap-l overflow-hidden">
                                <div className="relative">
                                    <Search className="pointer-events-none absolute left-m top-1/2 icon-size-200 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        value={sheetSearch}
                                        onChange={(event) => setSheetSearch(event.target.value)}
                                        placeholder="Buscar filtros por tabla, nombre o tipo"
                                        className="pl-xxl"
                                    />
                                </div>

                                {error || data?.status === "error" ? (
                                    <div className="rounded-3xl border border-destructive/30 bg-destructive/8 p-l text-[length:var(--text-200)] text-destructive">
                                        {(error ?? (data?.status === "error" ? new Error(data.error.message) : undefined))?.message}
                                    </div>
                                ) : null}

                                <div className="min-h-0 flex-1 space-y-l overflow-y-auto pr-xs">
                                    {isLoading ? (
                                        <div className="rounded-3xl border border-border bg-background/60 p-l text-[length:var(--text-200)] text-muted-foreground">
                                            Detectando dimensiones del modelo…
                                        </div>
                                    ) : null}

                                    {Object.entries(groupedDefinitions).map(([table, tableDefinitions]) => (
                                        <section key={table} className="space-y-m rounded-3xl border border-border bg-background/55 p-l">
                                            <div className="flex items-center gap-s">
                                                <Filter className="icon-size-200 text-primary" />
                                                <h4 className="font-semibold text-foreground">{table}</h4>
                                                <Badge variant="outline">{tableDefinitions.length}</Badge>
                                            </div>
                                            <div className="grid gap-s">
                                                {tableDefinitions.map((definition) => (
                                                    <div key={definition.id} className="space-y-xs">
                                                        <div className="flex items-center justify-between gap-s">
                                                            <div>
                                                                <p className="text-[length:var(--text-300)] font-medium text-foreground">{definition.label}</p>
                                                                <p className="text-[length:var(--text-200)] text-muted-foreground">
                                                                    {definition.dataType}
                                                                </p>
                                                            </div>
                                                            {activeFilters[definition.id] ? <Badge>Activo</Badge> : null}
                                                        </div>
                                                        <DynamicFilterField
                                                            definition={definition}
                                                            activeFilter={activeFilters[definition.id]}
                                                            onUpsertFilter={onUpsertFilter}
                                                            onRemoveFilter={onRemoveFilter}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    ))}
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            {activeFilterList.length > 0 ? (
                <div className="mt-l flex flex-wrap items-center gap-s">
                    {activeFilterList.map((filter) => (
                        <Badge key={filter.id} variant="secondary" className="gap-xs">
                            <span className="font-semibold">{filter.label}</span>
                            <span className="text-muted-foreground">
                                {filter.value.kind === "text"
                                    ? filter.value.value
                                    : filter.value.kind === "date"
                                      ? `${filter.value.start ?? "inicio"} → ${filter.value.end ?? "fin"}`
                                      : `${filter.value.min ?? "mín"} → ${filter.value.max ?? "máx"}`}
                            </span>
                            <button
                                type="button"
                                onClick={() => onRemoveFilter(filter.id)}
                                className="rounded-full p-xxs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                                aria-label={`Quitar filtro ${filter.label}`}
                            >
                                <X className="icon-size-100" />
                            </button>
                        </Badge>
                    ))}
                </div>
            ) : null}
        </div>
    );
}
