import { AuthSession } from "@/lib/auth";
import {
  SUPPORT_EMAIL,
  contributorRequest as sharedContributorRequest,
  explainRequestError,
} from "@/services/contributorRequest";
import { allRequiredErrors } from "@/components/contribute/submissionSteps";

export type DatasetSubmissionValues = {
  title: string;
  description: string;
  creator: string;
  publisher: string;
  subject: string;
  keywords: string;
  temporalCoverage: string;
  spatialCoverage: string;
  spatialResolution: string;
  accessRights: string;
  preferredCitation: string;
  dataUrl: string;
  documentationUrl: string;
  dataVariables: string;
  methodsVariables: string;
  dataUsageNotes: string;
  geometry: string;
  boundingBox: string;
  centroid: string;
  highlightIds: string;
};

export type SubmissionResponse = {
  id?: string;
  submission_id?: string;
  status?: string;
  updated_at?: string;
  submitted_at?: string;
  review_notes?: string;
  payload_json?: Record<string, unknown>;
  payload?: Record<string, unknown>;
  record?: Record<string, unknown>;
  data?: Record<string, unknown>;
};

export type ContributorSubmission = SubmissionResponse & {
  id: string;
  submitter_email?: string;
  submitter_name?: string;
  submitter_username?: string;
  submitter_id?: string;
};

function listFromText(value: string): string[] {
  return value
    .split(/\n|\|/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function referencesFromValues(values: DatasetSubmissionValues): Record<string, unknown> {
  const references: Record<string, unknown> = {};
  if (values.dataUrl.trim()) {
    references["http://schema.org/downloadUrl-NEW"] = [
      {
        label: "Data",
        url: values.dataUrl.trim(),
      },
    ];
  }
  if (values.documentationUrl.trim()) {
    references["http://schema.org/url"] = values.documentationUrl.trim();
  }
  return references;
}

function textFromList(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).join("\n");
  }
  if (typeof value === "string") {
    return value;
  }
  return "";
}

function firstFromList(value: unknown): string {
  if (Array.isArray(value)) {
    return value.length > 0 ? String(value[0]) : "";
  }
  if (typeof value === "string") {
    return value;
  }
  return "";
}

function referencesToValues(references: unknown): Pick<DatasetSubmissionValues, "dataUrl" | "documentationUrl"> {
  if (!references || typeof references !== "object" || Array.isArray(references)) {
    return { dataUrl: "", documentationUrl: "" };
  }
  const referenceMap = references as Record<string, unknown>;
  const download = referenceMap["http://schema.org/downloadUrl-NEW"];
  const documentation = referenceMap["http://schema.org/url"];
  let dataUrl = "";
  if (Array.isArray(download) && download.length > 0) {
    const firstDownload = download[0];
    if (firstDownload && typeof firstDownload === "object" && "url" in firstDownload) {
      dataUrl = String((firstDownload as { url?: unknown }).url || "");
    }
  }
  return {
    dataUrl,
    documentationUrl: typeof documentation === "string" ? documentation : "",
  };
}

export function buildSubmissionPayload(values: DatasetSubmissionValues): Record<string, unknown> {
  return {
    title: values.title.trim(),
    description: listFromText(values.description),
    creator: listFromText(values.creator),
    publisher: listFromText(values.publisher),
    resource_class: ["Datasets"],
    subject: values.subject ? [values.subject] : [],
    keyword: listFromText(values.keywords),
    temporal_coverage: listFromText(values.temporalCoverage),
    spatial_coverage: listFromText(values.spatialCoverage),
    spatial_resolution: values.spatialResolution ? [values.spatialResolution] : [],
    access_rights: values.accessRights,
    preferred_citation: values.preferredCitation.trim(),
    contrubution_source: "contributor",
    references: referencesFromValues(values),
    data_variables: listFromText(values.dataVariables),
    methods_variables: listFromText(values.methodsVariables),
    data_usage_notes: values.dataUsageNotes.trim(),
    geometry: values.geometry.trim(),
    bounding_box: values.boundingBox.trim(),
    centroid: values.centroid.trim(),
    highlight_ids: listFromText(values.highlightIds),
  };
}

export function payloadToSubmissionValues(payload: Record<string, unknown> | undefined): DatasetSubmissionValues {
  const references = referencesToValues(payload?.references);
  return {
    title: typeof payload?.title === "string" ? payload.title : firstFromList(payload?.title),
    description: textFromList(payload?.description),
    creator: textFromList(payload?.creator),
    publisher: textFromList(payload?.publisher),
    subject: firstFromList(payload?.subject) || "Health and Healthcare",
    keywords: textFromList(payload?.keyword),
    temporalCoverage: textFromList(payload?.temporal_coverage),
    spatialCoverage: textFromList(payload?.spatial_coverage) || "United States",
    spatialResolution: firstFromList(payload?.spatial_resolution) || "County",
    accessRights: typeof payload?.access_rights === "string" ? payload.access_rights : "Public",
    preferredCitation: typeof payload?.preferred_citation === "string" ? payload.preferred_citation : "",
    dataUrl: references.dataUrl,
    documentationUrl: references.documentationUrl,
    dataVariables: textFromList(payload?.data_variables),
    methodsVariables: textFromList(payload?.methods_variables),
    dataUsageNotes: typeof payload?.data_usage_notes === "string" ? payload.data_usage_notes : "",
    geometry: typeof payload?.geometry === "string" ? payload.geometry : "",
    boundingBox: typeof payload?.bounding_box === "string" ? payload.bounding_box : "",
    centroid: typeof payload?.centroid === "string" ? payload.centroid : "",
    highlightIds: textFromList(payload?.highlight_ids),
  };
}

export function validateSubmissionValues(values: DatasetSubmissionValues): string[] {
  return Object.values(allRequiredErrors(values));
}

function submitterFromSession(session: AuthSession | null): Record<string, string> {
  const email = session?.user.email || "";
  const name = session?.user.name || session?.user.preferredUsername || email || "";
  const username = session?.user.preferredUsername || "";
  const userId = session?.user.sub || "";

  return {
    submitter_email: email,
    submitter_name: name,
    submitter_username: username,
    submitter_id: userId,
  };
}

function payloadFromSubmission(submission: SubmissionResponse): Record<string, unknown> {
  return submission.payload_json || submission.payload || submission.record || submission.data || {};
}

export { SUPPORT_EMAIL, explainRequestError };

function contributorRequest<T>(
  path: string,
  session: AuthSession | null,
  init: RequestInit = {},
): Promise<T> {
  return sharedContributorRequest<T>("/api/contributor-submissions", path, session, init);
}

function submissionBody(
  values: DatasetSubmissionValues,
  status: "draft" | "submitted",
  session: AuthSession | null,
) {
  return JSON.stringify({
    status,
    ...submitterFromSession(session),
    payload_json: buildSubmissionPayload(values),
    source: "sdohplace-data-discovery",
  });
}

export async function listContributorSubmissions(session: AuthSession | null): Promise<ContributorSubmission[]> {
  const response = await contributorRequest<{ items: ContributorSubmission[] }>("", session);
  return response.items || [];
}

export async function getContributorSubmission(
  submissionId: string,
  session: AuthSession | null,
): Promise<ContributorSubmission> {
  return contributorRequest<ContributorSubmission>(`/${encodeURIComponent(submissionId)}`, session);
}

export async function saveContributorSubmission(
  values: DatasetSubmissionValues,
  session: AuthSession | null,
  options: { submissionId?: string; status: "draft" | "submitted" },
): Promise<ContributorSubmission> {
  const path = options.submissionId ? `/${encodeURIComponent(options.submissionId)}` : "";
  return contributorRequest<ContributorSubmission>(path, session, {
    method: options.submissionId ? "PATCH" : "POST",
    body: submissionBody(values, options.status, session),
  });
}

export async function deleteContributorSubmission(
  submissionId: string,
  session: AuthSession | null,
): Promise<void> {
  await contributorRequest<Record<string, never>>(`/${encodeURIComponent(submissionId)}`, session, {
    method: "DELETE",
  });
}

export function valuesFromSubmission(submission: SubmissionResponse): DatasetSubmissionValues {
  return payloadToSubmissionValues(payloadFromSubmission(submission));
}
