import { AuthSession } from "@/lib/auth";
import { DatasetSubmissionValues } from "@/services/SubmissionService";
import { contributorRequest } from "@/services/contributorRequest";

const BASE_PATH = "/api/contributor-spatial";
const FAST_POLL_MS = 3000;
const SLOW_POLL_MS = 10000;
const FAST_POLL_WINDOW_MS = 30000;
const POLL_TIMEOUT_MS = 600000;

export const BOUNDARY_YEARS = ["2018", "2010"];

export const SPATIAL_LEVELS = [
  "State",
  "County",
  "Census Tract",
  "Census Block Group",
  "Zip Code Tabulation Area (ZCTA)",
];

export const DEFAULT_ACCEPT = ".csv,.zip,.geojson,.gpkg";
export const MAX_UPLOAD_BYTES = 500 * 1024 * 1024;
export const LARGE_UPLOAD_BYTES = 100 * 1024 * 1024;

export type SpatialOptions = {
  spatial_levels: string[];
  boundary_years: string[];
  upload_kinds: string[];
  upload_extensions: Record<string, string[]>;
  accept: string;
  max_upload_bytes: number;
  large_upload_bytes: number;
};

export const FALLBACK_OPTIONS: SpatialOptions = {
  spatial_levels: SPATIAL_LEVELS,
  boundary_years: BOUNDARY_YEARS,
  upload_kinds: ["csv", "geo"],
  upload_extensions: { csv: [".csv"], geo: [".zip", ".geojson", ".gpkg"] },
  accept: DEFAULT_ACCEPT,
  max_upload_bytes: MAX_UPLOAD_BYTES,
  large_upload_bytes: LARGE_UPLOAD_BYTES,
};

export function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }
  if (bytes >= 1024 * 1024) {
    return `${Math.round(bytes / (1024 * 1024))} MB`;
  }
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export async function fetchSpatialOptions(
  session: AuthSession | null,
): Promise<SpatialOptions> {
  try {
    const options = await contributorRequest<SpatialOptions>(BASE_PATH, "/options", session);
    return { ...FALLBACK_OPTIONS, ...options };
  } catch {
    return FALLBACK_OPTIONS;
  }
}

export function uploadKindForFile(filename: string, options: SpatialOptions): string | null {
  const lowered = filename.toLowerCase();
  for (const [kind, extensions] of Object.entries(options.upload_extensions || {})) {
    if (extensions.some((extension) => lowered.endsWith(extension))) {
      return kind;
    }
  }
  return null;
}

export type SpatialJobInput = {
  submissionId: string;
  file: File;
  boundaryYear: string;
  spatialLevel: string;
  geoIdColumn: string;
  uploadKind?: string | null;
};

export type SpatialResult = {
  geometry: string;
  bounding_box: string;
  centroid: string;
  spatial_coverage: string[];
  highlight_ids: string[];
  diagnostics: {
    match_rate?: number | string;
    warnings?: string[];
  };
};

export type SpatialStatus =
  | { status: "pending" }
  | { status: "ready"; result: SpatialResult }
  | { status: "failed"; error_code?: string; message?: string };

export type SpatialGeneratedValues = Pick<
  DatasetSubmissionValues,
  "geometry" | "boundingBox" | "centroid" | "highlightIds" | "spatialCoverage"
>;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function pollDelay(elapsedMs: number): number {
  return elapsedMs < FAST_POLL_WINDOW_MS ? FAST_POLL_MS : SLOW_POLL_MS;
}

export function resultToValues(result: SpatialResult): SpatialGeneratedValues {
  return {
    geometry: result.geometry || "",
    boundingBox: result.bounding_box || "",
    centroid: result.centroid || "",
    spatialCoverage: (result.spatial_coverage || []).join("\n"),
    highlightIds: (result.highlight_ids || []).join("\n"),
  };
}

export function describeResult(result: SpatialResult): string[] {
  const lines: string[] = [];
  const coverage = result.spatial_coverage || [];
  const highlights = result.highlight_ids || [];
  if (coverage.length > 0) {
    lines.push(`Spatial coverage: ${coverage.slice(0, 3).join(", ")}${coverage.length > 3 ? `, and ${coverage.length - 3} more` : ""}`);
  }
  if (highlights.length > 0) {
    lines.push(`Matched ${highlights.length} geographic ${highlights.length === 1 ? "area" : "areas"}`);
  }
  const matchRate = result.diagnostics?.match_rate;
  if (matchRate !== undefined && matchRate !== "") {
    lines.push(`Match rate: ${matchRate}`);
  }
  for (const warning of result.diagnostics?.warnings || []) {
    lines.push(`Warning: ${warning}`);
  }
  return lines;
}

export type SessionGetter = () => AuthSession | null;

function isExpiredSessionError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : "";
  return message.includes("session has expired") || message.includes("not valid for this action");
}

async function withFreshSession<T>(
  getSession: SessionGetter,
  run: (session: AuthSession | null) => Promise<T>,
): Promise<T> {
  try {
    return await run(getSession());
  } catch (error) {
    if (!isExpiredSessionError(error)) {
      throw error;
    }
    await delay(1500);
    return run(getSession());
  }
}

async function requestUploadUrl(
  submissionId: string,
  file: File,
  getSession: SessionGetter,
): Promise<{ upload_url: string; s3_key: string; content_type: string; upload_kind: string }> {
  return withFreshSession(getSession, (session) =>
    contributorRequest(BASE_PATH, "/upload-url", session, {
      method: "POST",
      body: JSON.stringify({
        submission_id: submissionId,
        filename: file.name,
        file_size: file.size,
      }),
    }),
  );
}

async function uploadToS3(uploadUrl: string, file: File, contentType: string): Promise<void> {
  let response: Response;
  try {
    response = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": contentType || "text/csv" },
      body: file,
    });
  } catch {
    throw new Error(
      `Your ${formatBytes(file.size)} file could not be uploaded. This usually means the ` +
        "connection dropped part way. Check your connection and try Generate again, or email " +
        "heroplab23@gmail.com if it keeps happening.",
    );
  }
  if (response.status === 403) {
    throw new Error(
      `The upload window for your ${formatBytes(file.size)} file ran out before it finished. ` +
        "Click Generate again to start a fresh upload, ideally on a faster connection.",
    );
  }
  if (!response.ok) {
    throw new Error(
      `Your ${formatBytes(file.size)} file could not be uploaded (error ${response.status}). ` +
        "Try Generate again, or email heroplab23@gmail.com if it keeps happening.",
    );
  }
}

async function startPipeline(
  input: SpatialJobInput,
  s3Key: string,
  uploadKind: string,
  getSession: SessionGetter,
): Promise<void> {
  const body: Record<string, unknown> = {
    submission_id: input.submissionId,
    s3_key: s3Key,
    upload_kind: uploadKind,
  };
  if (uploadKind === "csv") {
    body.boundary_year = input.boundaryYear;
    body.spatial_level = input.spatialLevel;
    body.geo_id_column = input.geoIdColumn;
  }
  await withFreshSession(getSession, (session) =>
    contributorRequest(BASE_PATH, "/start", session, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  );
}

async function fetchStatus(
  submissionId: string,
  s3Key: string,
  getSession: SessionGetter,
): Promise<SpatialStatus> {
  const query = `?submission_id=${encodeURIComponent(submissionId)}&key=${encodeURIComponent(s3Key)}`;
  return withFreshSession(getSession, (session) =>
    contributorRequest<SpatialStatus>(BASE_PATH, `/status${query}`, session),
  );
}

export async function generateSpatialMetadata(
  input: SpatialJobInput,
  getSession: SessionGetter,
  onProgress?: (elapsedSeconds: number) => void,
): Promise<SpatialResult> {
  const job = await requestUploadUrl(input.submissionId, input.file, getSession);
  await uploadToS3(job.upload_url, input.file, job.content_type);
  await startPipeline(input, job.s3_key, job.upload_kind || input.uploadKind || "csv", getSession);

  const startedAt = Date.now();
  for (;;) {
    const elapsed = Date.now() - startedAt;
    if (elapsed >= POLL_TIMEOUT_MS) {
      throw new Error(
        "Your file is taking longer than 10 minutes to process, so we stopped waiting. " +
          "Nothing is lost: your upload was saved and it may still finish in the background. " +
          "Wait a few minutes and click Generate again, or email heroplab23@gmail.com if a " +
          "large file never completes.",
      );
    }
    await delay(pollDelay(elapsed));
    onProgress?.(Math.round((Date.now() - startedAt) / 1000));

    const status = await fetchStatus(input.submissionId, job.s3_key, getSession);
    if (status.status === "ready") {
      return status.result;
    }
    if (status.status === "failed") {
      throw new Error(
        status.message
          ? `Generation failed (${status.error_code || "error"}): ${status.message}`
          : `Generation failed (${status.error_code || "error"}). Check that the file matches the boundary year and spatial level you chose.`,
      );
    }
  }
}
