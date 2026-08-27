import { AuthSession } from "@/lib/auth";

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
  };
}

export function validateSubmissionValues(values: DatasetSubmissionValues): string[] {
  const errors: string[] = [];
  if (!values.title.trim()) {
    errors.push("Dataset title is required.");
  }
  if (!values.description.trim()) {
    errors.push("Description is required.");
  }
  if (!values.creator.trim()) {
    errors.push("Creator is required.");
  }
  if (!values.publisher.trim()) {
    errors.push("Publisher is required.");
  }
  if (!values.subject) {
    errors.push("Subject is required.");
  }
  if (!values.keywords.trim()) {
    errors.push("At least one keyword is required.");
  }
  if (!values.spatialResolution) {
    errors.push("Spatial resolution is required.");
  }
  if (!values.accessRights) {
    errors.push("Access rights is required.");
  }
  if (!values.preferredCitation.trim()) {
    errors.push("Preferred citation is required.");
  }
  return errors;
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

export const SUPPORT_EMAIL = "heroplab23@gmail.com";

const SUPPORT_HINT =
  `If this keeps happening, please email ${SUPPORT_EMAIL} with a screenshot of this message.`;

function explainRequestError(status: number, code: string): string {
  const known: Record<string, string> = {
    not_found:
      "We could not find this submission. It may have been removed.",
    not_owned:
      "This submission is not available under your account. If you submitted it with a different sign-in, please sign out and try again.",
    unauthorized:
      "Your session is not valid for this action. Please sign out and sign back in.",
    "Bearer token expired":
      "Your session has expired. Please sign out and sign back in.",
    "Contributor role required":
      "Your account does not yet have contributor access.",
  };

  if (known[code]) {
    return `${known[code]} ${SUPPORT_HINT}`;
  }

  if (status === 401 || status === 403) {
    return `Your session is not valid for this action. Please sign out and sign back in. ${SUPPORT_HINT}`;
  }
  if (status === 404) {
    return `We could not find this submission. It may have been removed. ${SUPPORT_HINT}`;
  }
  if (status === 409) {
    return `${code || "This submission can no longer be changed."} ${SUPPORT_HINT}`;
  }
  if (status >= 500) {
    return `The submission service is temporarily unavailable. Please try again in a few minutes. ${SUPPORT_HINT}`;
  }
  return `${code || `Something went wrong (error ${status}).`} ${SUPPORT_HINT}`;
}

async function contributorRequest<T>(
  path: string,
  session: AuthSession | null,
  init: RequestInit = {},
): Promise<T> {
  if (!session?.accessToken) {
    throw new Error("You need to sign in before using contributor submissions.");
  }

  const response = await fetch(`/api/contributor-submissions${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.accessToken}`,
      ...(init.headers || {}),
    },
  });

  if (!response.ok) {
    const details = await response.text();
    let code = "";
    try {
      const parsed = JSON.parse(details);
      code = parsed.error || parsed.message || "";
    } catch (e) {
      if (e instanceof SyntaxError === false) throw e;
    }
    throw new Error(explainRequestError(response.status, code));
  }

  const text = await response.text();
  return text ? JSON.parse(text) : ({} as T);
}

function submissionBody(values: DatasetSubmissionValues, status: "draft" | "submitted", session: AuthSession | null) {
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
