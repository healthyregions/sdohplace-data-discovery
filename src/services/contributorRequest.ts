import { AuthSession } from "@/lib/auth";

export const SUPPORT_EMAIL = "heroplab23@gmail.com";

const SUPPORT_HINT = `If this keeps happening, please email ${SUPPORT_EMAIL} with a screenshot of this message.`;

export function explainRequestError(status: number, code: string): string {
  const known: Record<string, string> = {
    not_found: "We could not find this submission. It may have been removed.",
    not_owned:
      "This submission is not available under your account. If you submitted it with a different sign-in, please sign out and try again.",
    unauthorized: "Your session is not valid for this action. Please sign out and sign back in.",
    "Bearer token expired": "Your session has expired. Please sign out and sign back in.",
    "Contributor role required": "Your account does not yet have contributor access.",
    spatial_not_configured:
      "Geospatial generation is not configured on the server yet. Please contact the team.",
    unsupported_file_type: "Upload a .csv file.",
    invalid_s3_key: "That upload does not belong to this submission. Please upload the file again.",
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

export async function contributorRequest<T>(
  basePath: string,
  path: string,
  session: AuthSession | null,
  init: RequestInit = {},
): Promise<T> {
  if (!session?.accessToken) {
    throw new Error("You need to sign in before using contributor submissions.");
  }
  const response = await fetch(`${basePath}${path}`, {
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
