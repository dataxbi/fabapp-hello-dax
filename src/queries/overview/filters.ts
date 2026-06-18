import { applyDynamicSemanticFilters, type DynamicSemanticFilter } from "@/lib/dynamic-semantic-filters";

export interface OverviewFilters {
    yearMonth?: string;
    region?: string;
    salesChannel?: string;
    category?: string;
    dynamic?: DynamicSemanticFilter[];
}

function escapeDaxString(value: string) {
    return value.replace(/"/g, "\"\"");
}

function buildFilterExpressions(filters?: OverviewFilters) {
    if (!filters) {
        return [];
    }

    const expressions: string[] = [];

    if (filters.yearMonth) {
        expressions.push(`KEEPFILTERS(TREATAS({ "${escapeDaxString(filters.yearMonth)}" }, 'Fecha'[Year Month]))`);
    }

    if (filters.region) {
        expressions.push(`KEEPFILTERS(TREATAS({ "${escapeDaxString(filters.region)}" }, 'Region'[Region]))`);
    }

    if (filters.salesChannel) {
        expressions.push(`KEEPFILTERS(TREATAS({ "${escapeDaxString(filters.salesChannel)}" }, 'Canal'[Sales Channel]))`);
    }

    if (filters.category) {
        expressions.push(`KEEPFILTERS(TREATAS({ "${escapeDaxString(filters.category)}" }, 'Producto'[Category]))`);
    }

    return expressions;
}

export function applyOverviewFilters(query: string, filters?: OverviewFilters) {
    const expressions = buildFilterExpressions(filters);
    const staticQuery =
        expressions.length === 0
            ? query
            : (() => {
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
              })();

    return applyDynamicSemanticFilters(staticQuery, filters?.dynamic);
}
