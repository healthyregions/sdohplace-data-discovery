export const parseSolrQuery = (query: string): string => {
  return query
    .split(/\s*,\s*/)
    .map((term) => term.trim())
    .filter((term) => term.length > 0)
    .map((term) => (term.includes(" ") ? `"${term}"` : term))
    .join(" ");
};

export const ParseReferenceLink = (
  value: any
): {
  homepageUrl?: string;
  downloadUrl?: string;
  dataDictionaryUrl?: string;
  archiveUrl?: string;
} => {
  if (!value) {
    return {};
  }
  // Handle JSON string, an array of strings, an array of objects, or an object cases to extract the relevant URLs from the metadata
  let parsedValue: any = {};
  try {
    if (typeof value === "string") {
      parsedValue = JSON.parse(value);
    } else if (Array.isArray(value) && value.length > 0) {
      if (typeof value[0] === "string") {
        parsedValue = JSON.parse(value[0]);
      } else if (typeof value[0] === "object" && value[0] !== null) {
        parsedValue = value[0];
      }
    } else if (typeof value === "object") {
      parsedValue = value;
    }
  } catch (error) {
    console.error("Failed to parse reference links:", error);
    return {};
  }
  const first = (v: unknown): string | undefined => {
    if (Array.isArray(v)) return v[0] ? String(v[0]) : undefined;
    return v ? String(v) : undefined;
  };
  const links = {
    homepageUrl: first(parsedValue["http://schema.org/url"]),
    downloadUrl: first(parsedValue["http://schema.org/downloadUrl"]),
    dataDictionaryUrl: first(parsedValue["http://lccn.loc.gov/sh85035852"]),
    archiveUrl: first(parsedValue["archive-url"]),
  };
  return links;
};
