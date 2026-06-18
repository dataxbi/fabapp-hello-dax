import type { ColumnMetadataMap } from "@/lib/to-data-table";
import { buildDaxColumnReference, type DynamicFilterDefinition, type DynamicFilterKind } from "@/lib/dynamic-semantic-filters";

const connection = "salesModel";

const metadataQuery = `EVALUATE
SELECTCOLUMNS(
  FILTER(INFO.VIEW.COLUMNS(), NOT [IsHidden]),
  "Table", [Table],
  "Column", [Name],
  "DataType", [DataType],
  "DataCategory", [DataCategory],
  "SummarizeBy", [SummarizeBy],
  "FormatString", [FormatString],
  "SortByColumn", [SortByColumn]
)
ORDER BY [Table], [Column]`;

export const metadataColumnMetadata: ColumnMetadataMap = {
    "[Table]": { name: "Table", displayName: "Table" },
    "[Column]": { name: "Column", displayName: "Column" },
    "[DataType]": { name: "DataType", displayName: "Data Type" },
    "[DataCategory]": { name: "DataCategory", displayName: "Data Category" },
    "[SummarizeBy]": { name: "SummarizeBy", displayName: "Summarize By" },
    "[FormatString]": { name: "FormatString", displayName: "Format String" },
    "[SortByColumn]": { name: "SortByColumn", displayName: "Sort By Column" },
};

interface MetadataRow {
    Table?: string;
    Column?: string;
    DataType?: string;
    DataCategory?: string | null;
    SummarizeBy?: string | null;
    FormatString?: string | null;
    SortByColumn?: string | null;
}

function escapeDaxString(value: string) {
    return value.replace(/"/g, "\"\"");
}

function getFilterKind(dataType?: string): DynamicFilterKind | null {
    if (dataType === "Text") {
        return "text";
    }

    if (dataType === "Date" || dataType === "DateTime") {
        return "date";
    }

    if (dataType === "Integer" || dataType === "Double" || dataType === "Decimal" || dataType === "Currency") {
        return "number";
    }

    return null;
}

function isLikelyTechnicalColumn(row: MetadataRow) {
    const column = row.Column?.toLowerCase() ?? "";
    return (
        column === "id" ||
        column.endsWith(" id") ||
        column.endsWith(" key") ||
        column.endsWith(" code") ||
        column.includes("sort")
    );
}

export function toDynamicFilterDefinitions(rows: MetadataRow[]) {
    return rows.flatMap((row): DynamicFilterDefinition[] => {
        const table = row.Table?.trim();
        const column = row.Column?.trim();
        const dataType = row.DataType?.trim();
        const filterKind = getFilterKind(dataType);

        if (!table || !column || !dataType || !filterKind || isLikelyTechnicalColumn(row)) {
            return [];
        }

        return [
            {
                id: `${table}.${column}`,
                table,
                column,
                label: column,
                dataType,
                dataCategory: row.DataCategory ?? null,
                formatString: row.FormatString ?? null,
                sortByColumn: row.SortByColumn ?? null,
                filterKind,
            },
        ];
    });
}

export function overviewDynamicFilterCatalog() {
    return {
        connection,
        query: metadataQuery,
        columnMetadata: metadataColumnMetadata,
    };
}

export const valueColumnMetadata: ColumnMetadataMap = {
    "[Value]": { name: "Value", displayName: "Value" },
};

export function overviewDynamicTextFilterValues(definition: DynamicFilterDefinition, search?: string) {
    const ref = buildDaxColumnReference(definition.table, definition.column);
    const trimmedSearch = search?.trim();
    const searchFilter =
        trimmedSearch && trimmedSearch.length > 0
            ? `FILTER(__DistinctValues, CONTAINSSTRING(LOWER(${ref} & ""), LOWER("${escapeDaxString(trimmedSearch)}")))`
            : "__DistinctValues";

    const query = `DEFINE
  VAR __DistinctValues =
    FILTER(
      VALUES(${ref}),
      NOT ISBLANK(${ref})
    )
  VAR __FilteredValues = ${searchFilter}
EVALUATE
TOPN(
  100,
  SELECTCOLUMNS(
    __FilteredValues,
    "Value", ${ref}
  ),
  [Value], ASC
)`;

    return {
        connection,
        query,
        columnMetadata: valueColumnMetadata,
    };
}

export const statsColumnMetadata: ColumnMetadataMap = {
    "[MinValue]": { name: "MinValue", displayName: "Min Value" },
    "[MaxValue]": { name: "MaxValue", displayName: "Max Value" },
};

export function overviewDynamicRangeStats(definition: DynamicFilterDefinition) {
    const ref = buildDaxColumnReference(definition.table, definition.column);

    const query =
        definition.filterKind === "date"
            ? `EVALUATE
ROW(
  "MinValue", FORMAT(MIN(${ref}), "yyyy-mm-dd"),
  "MaxValue", FORMAT(MAX(${ref}), "yyyy-mm-dd")
)`
            : `EVALUATE
ROW(
  "MinValue", MIN(${ref}),
  "MaxValue", MAX(${ref})
)`;

    return {
        connection,
        query,
        columnMetadata: statsColumnMetadata,
    };
}
