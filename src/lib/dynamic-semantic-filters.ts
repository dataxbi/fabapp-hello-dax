export type DynamicFilterKind = "text" | "date" | "number";

export interface DynamicFilterDefinition {
    id: string;
    table: string;
    column: string;
    label: string;
    dataType: string;
    dataCategory?: string | null;
    formatString?: string | null;
    sortByColumn?: string | null;
    filterKind: DynamicFilterKind;
}

export interface DynamicTextFilterValue {
    kind: "text";
    value: string;
}

export interface DynamicDateFilterValue {
    kind: "date";
    start?: string;
    end?: string;
}

export interface DynamicNumberFilterValue {
    kind: "number";
    min?: number;
    max?: number;
}

export type DynamicFilterValue =
    | DynamicTextFilterValue
    | DynamicDateFilterValue
    | DynamicNumberFilterValue;

export interface DynamicSemanticFilter {
    id: string;
    table: string;
    column: string;
    label: string;
    filterKind: DynamicFilterKind;
    value: DynamicFilterValue;
}

function escapeDaxString(value: string) {
    return value.replace(/"/g, "\"\"");
}

function escapeDaxTableName(value: string) {
    return value.replace(/'/g, "''");
}

function escapeDaxColumnName(value: string) {
    return value.replace(/]/g, "]]");
}

export function buildDaxColumnReference(table: string, column: string) {
    return `'${escapeDaxTableName(table)}'[${escapeDaxColumnName(column)}]`;
}

function buildDaxDateLiteral(value: string) {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (!match) {
        return null;
    }

    const [, year, month, day] = match;
    return `DATE(${Number(year)}, ${Number(month)}, ${Number(day)})`;
}

export function buildDynamicFilterExpression(filter: DynamicSemanticFilter) {
    const ref = buildDaxColumnReference(filter.table, filter.column);

    if (filter.filterKind === "text" && filter.value.kind === "text" && filter.value.value) {
        return `KEEPFILTERS(TREATAS({ "${escapeDaxString(filter.value.value)}" }, ${ref}))`;
    }

    if (filter.filterKind === "date" && filter.value.kind === "date") {
        const predicates: string[] = [];
        const start = filter.value.start ? buildDaxDateLiteral(filter.value.start) : null;
        const end = filter.value.end ? buildDaxDateLiteral(filter.value.end) : null;

        if (start) {
            predicates.push(`${ref} >= ${start}`);
        }

        if (end) {
            predicates.push(`${ref} <= ${end}`);
        }

        if (predicates.length > 0) {
            return `KEEPFILTERS(FILTER(ALL(${ref}), ${predicates.join(" && ")}))`;
        }
    }

    if (filter.filterKind === "number" && filter.value.kind === "number") {
        const predicates: string[] = [];

        if (typeof filter.value.min === "number" && Number.isFinite(filter.value.min)) {
            predicates.push(`${ref} >= ${filter.value.min}`);
        }

        if (typeof filter.value.max === "number" && Number.isFinite(filter.value.max)) {
            predicates.push(`${ref} <= ${filter.value.max}`);
        }

        if (predicates.length > 0) {
            return `KEEPFILTERS(FILTER(ALL(${ref}), ${predicates.join(" && ")}))`;
        }
    }

    return null;
}

export function applyDynamicSemanticFilters(query: string, filters?: DynamicSemanticFilter[]) {
    const expressions = (filters ?? [])
        .map((filter) => buildDynamicFilterExpression(filter))
        .filter((expression): expression is string => Boolean(expression));

    if (expressions.length === 0) {
        return query;
    }

    const match = query.match(/([\s\S]*?EVALUATE\s*)([\s\S]*?)(\s*ORDER BY[\s\S]*)?$/i);

    if (!match) {
        return query;
    }

    const [, beforeEvaluate, evaluateBody, orderBy = ""] = match;
    const trimmedBody = evaluateBody.trim();

    return `${beforeEvaluate}CALCULATETABLE(
  ${trimmedBody},
  ${expressions.join(",\n  ")}
)${orderBy}`;
}
