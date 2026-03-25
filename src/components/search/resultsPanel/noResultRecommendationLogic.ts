export type NoResultScenario =
  | "query_and_filters"
  | "filters_only"
  | "query_only"
  | "unknown";

export const detectNoResultScenario = (
  hasQuery: boolean,
  hasActiveFilters: boolean
): NoResultScenario => {
  if (hasQuery && hasActiveFilters) return "query_and_filters";
  if (!hasQuery && hasActiveFilters) return "filters_only";
  if (hasQuery && !hasActiveFilters) return "query_only";
  return "unknown";
};

// #51: Instead of recommend all themes in the 'No Result' case, give different messages and recommendations based on the scenario 
// if there are no results due to filters, recommend removing filters
// if due to query, recommend broadening keywords
// if both, recommend both actions
export const getNoResultMessage = (scenario: NoResultScenario): string => {
  switch (scenario) {
    case "query_and_filters":
      return "Your keyword and filters may be too narrow. Try removing some filters or broadening your search.";
    case "filters_only":
      return "Current filters are too restrictive. Try removing one or more filters.";
    case "query_only":
      return "No exact keyword match found. Try broadening your search terms.";
    default:
      return "No matching results found.";
  }
};

export const shouldFetchFallbackThemes = (
  scenario: NoResultScenario
): boolean => scenario === "query_only";
