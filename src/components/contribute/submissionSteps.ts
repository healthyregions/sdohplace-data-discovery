import { DatasetSubmissionValues } from "@/services/SubmissionService";

export type FieldName = keyof DatasetSubmissionValues;

export type FieldKind = "text" | "textarea" | "select" | "generated";

export type FieldDef = {
  label: string;
  kind: FieldKind;
  required?: boolean;
  hint?: string;
  example?: string;
  options?: string[];
  multiline?: boolean;
  compact?: boolean;
};

export const subjectOptions = [
  "Demographics",
  "Economic Stability",
  "Employment",
  "Education",
  "Food Environment",
  "Health and Healthcare",
  "Housing",
  "Natural Environment",
  "Neighborhood and Built Environment",
  "Physical Activity and Lifestyle",
  "Safety",
  "Social and Community Context",
  "Transportation and Infrastructure",
  "Greenspaces",
  "Composite Index",
];

export const spatialResolutionOptions = [
  "City",
  "County",
  "State",
  "Census Tract",
  "Census Block",
  "Census Block Group",
  "Zip Code Tabulation Area (ZCTA)",
  "Other",
];

export const FIELD_DEFS: Record<FieldName, FieldDef> = {
  title: {
    label: "Dataset Title",
    kind: "text",
    required: true,
    hint: "The full, official name of the dataset, as it appears in the original source.",
    example: "Crimes by County (NaNDA)",
  },
  description: {
    label: "Description",
    kind: "textarea",
    required: true,
    hint: "A plain-language summary of what the dataset contains, how it was produced, and what it can be used for. One paragraph is plenty.",
    example:
      "County-level totals for 2002–2014 for eight types of crime, compiled from the Uniform Crime Reporting Program at NACJD/ICPSR.",
  },
  subject: {
    label: "Subject",
    kind: "select",
    required: true,
    hint: "The SDOH topic that best describes this dataset.",
    example: "Safety, for a dataset about county-level crime",
    options: subjectOptions,
  },
  keywords: {
    label: "Keywords",
    kind: "textarea",
    compact: true,
    required: true,
    hint: "Terms people might search for. One per line.",
    example: "Crime\nFBI\nViolent crime statistics",
  },
  creator: {
    label: "Creator",
    kind: "textarea",
    compact: true,
    required: true,
    hint: "Who made the dataset: the people or organization that collected or produced it. One per line.",
    example: "Philippa Clarke\nRobert Melendez",
  },
  publisher: {
    label: "Publisher",
    kind: "textarea",
    compact: true,
    required: true,
    hint: "Who makes it available: the organization that hosts or distributes it. Often the same as the creator; if so, repeat it.",
    example: "University of Michigan. Institute for Social Research",
  },
  accessRights: {
    label: "Access Rights",
    kind: "select",
    required: true,
    hint: "Public if anyone can download it. Restricted if it needs registration, a data-use agreement, or institutional access.",
    example: "Public",
    options: ["Public", "Restricted"],
  },
  spatialResolution: {
    label: "Spatial Resolution",
    kind: "select",
    required: true,
    hint: "The smallest geographic unit each row describes.",
    example: "County, if each row is one U.S. county",
    options: spatialResolutionOptions,
  },
  spatialCoverage: {
    label: "Spatial Coverage",
    kind: "textarea",
    compact: true,
    hint: "The area the dataset covers. Use the broadest level that fits. One per line.",
    example: "United States",
  },
  temporalCoverage: {
    label: "Temporal Coverage",
    kind: "text",
    hint: "The years the data describe. Use a dash for a range.",
    example: "2002-2014",
  },
  boundingBox: { label: "Bounding Box", kind: "generated" },
  centroid: { label: "Centroid", kind: "generated" },
  highlightIds: { label: "Geographic IDs", kind: "generated", multiline: true },
  geometry: { label: "Geometry", kind: "generated", required: true, multiline: true },
  preferredCitation: {
    label: "Preferred Citation",
    kind: "text",
    hint: "How people should cite this dataset. We drafted this from your answers; edit it to match the source's own citation if it has one.",
    example: "Clarke, P., Melendez, R., & Chenoweth, M. (2019). Crimes by County, 2002-2014. ICPSR.",
  },
  dataUrl: {
    label: "Data URL",
    kind: "text",
    required: true,
    hint: "Where people can download or request the data. A DOI, landing page, or direct file link all work.",
    example: "https://doi.org/10.3886/E115006V1",
  },
  documentationUrl: {
    label: "Documentation URL",
    kind: "text",
    hint: "A link to a codebook, landing page, or documentation.",
    example: "https://doi.org/10.3886/ICPSR38649.v1",
  },
  dataVariables: {
    label: "Data Variables",
    kind: "textarea",
    compact: true,
    required: true,
    hint: "The main columns or measures in the dataset. One per line.",
    example: "Total violent crimes\nTotal property crimes\nCounty FIPS code",
  },
  methodsVariables: {
    label: "Methods Variables",
    kind: "textarea",
    compact: true,
    required: true,
    hint: "The units of analysis or dimensions the data are organized by. One per line.",
    example: "Murder\nRobbery\nCounty\nYear",
  },
  dataUsageNotes: {
    label: "Data Usage Notes",
    kind: "textarea",
    required: true,
    hint: "Caveats or guidance for anyone using this dataset.",
    example: "Reporting practices differ across counties, so compare with care.",
  },
};

export type Step = {
  id: string;
  title: string;
  shortLabel: string;
  intro: string;
  rows: FieldName[][];
  uploadSlot?: boolean;
  generatedRows?: FieldName[][];
};

export const STEPS: Step[] = [
  {
    id: "describe",
    title: "Tell us about the dataset",
    shortLabel: "Describe",
    intro: "Start with the basics. A title and a short description are enough to save a draft.",
    rows: [["title"], ["description"], ["subject", "keywords"]],
  },
  {
    id: "attribution",
    title: "Who made it and where to get it",
    shortLabel: "Attribution",
    intro: "This is what lets people credit the source and find the data.",
    rows: [["creator", "publisher"], ["dataUrl", "documentationUrl"], ["accessRights"]],
  },
  {
    id: "location",
    title: "Where and when",
    shortLabel: "Location",
    intro:
      "Upload your data file and we will work out the geography for you. Then confirm the resolution and time period.",
    uploadSlot: true,
    rows: [["spatialResolution", "spatialCoverage"], ["temporalCoverage"]],
    generatedRows: [["boundingBox", "centroid"], ["highlightIds", "geometry"]],
  },
  {
    id: "contents",
    title: "What is in the data",
    shortLabel: "Contents",
    intro:
      "Tell people what they will find inside the file, and anything they should know before using it.",
    rows: [["dataVariables", "methodsVariables"], ["dataUsageNotes"]],
  },
  {
    id: "review",
    title: "Review and submit",
    shortLabel: "Review",
    intro: "Check everything over, confirm the citation, and submit.",
    rows: [["preferredCitation"]],
  },
];

export const CITATION_FIELD: FieldName = "preferredCitation";

export const REVIEW_STEP_INDEX = STEPS.length - 1;

export function stepFields(step: Step): FieldName[] {
  return step.rows.flat();
}

export function stepRequiredFields(step: Step): FieldName[] {
  return stepFields(step).filter((name) => FIELD_DEFS[name].required);
}

export function fieldErrors(values: DatasetSubmissionValues, names: FieldName[]): Partial<Record<FieldName, string>> {
  const errors: Partial<Record<FieldName, string>> = {};
  for (const name of names) {
    const def = FIELD_DEFS[name];
    if (def.required && !String(values[name] || "").trim()) {
      errors[name] = `${def.label} is required.`;
    }
  }
  return errors;
}

export function stepErrors(values: DatasetSubmissionValues, step: Step): Partial<Record<FieldName, string>> {
  return fieldErrors(values, stepFields(step));
}

export function isStepComplete(values: DatasetSubmissionValues, step: Step): boolean {
  return Object.keys(stepErrors(values, step)).length === 0;
}

export function firstIncompleteStep(values: DatasetSubmissionValues): number {
  const index = STEPS.findIndex((step, i) => i < REVIEW_STEP_INDEX && !isStepComplete(values, step));
  return index === -1 ? REVIEW_STEP_INDEX : index;
}

export const GENERATED_FIELDS: FieldName[] = STEPS.flatMap((step) => step.generatedRows?.flat() || []);

export const LOCATION_STEP_INDEX = STEPS.findIndex((step) => step.uploadSlot);

export function allRequiredErrors(values: DatasetSubmissionValues): Partial<Record<FieldName, string>> {
  return fieldErrors(values, [...STEPS.flatMap(stepFields), ...GENERATED_FIELDS]);
}

export function missingOnlyGeneratedFields(errors: Partial<Record<FieldName, string>>): boolean {
  const missing = Object.keys(errors) as FieldName[];
  return missing.length > 0 && missing.every((name) => GENERATED_FIELDS.includes(name));
}

function firstLine(value: string): string {
  return value.split(/\n|\|/).map((s) => s.trim()).filter(Boolean)[0] || "";
}

function yearFrom(value: string): string {
  const years = value.match(/\b(19|20)\d{2}\b/g);
  if (!years || years.length === 0) {
    return "n.d.";
  }
  const first = years[0];
  const last = years[years.length - 1];
  return first === last ? first : `${first}-${last}`;
}

export function buildDraftCitation(values: DatasetSubmissionValues): string {
  const creator = firstLine(values.creator);
  const publisher = firstLine(values.publisher);
  const title = values.title.trim();
  const year = yearFrom(values.temporalCoverage);
  if (!title) {
    return "";
  }
  const parts = [creator && `${creator}.`, `(${year}).`, `${title}.`, publisher && `${publisher}.`];
  return parts.filter(Boolean).join(" ");
}
