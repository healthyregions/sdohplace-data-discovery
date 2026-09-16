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

export type SpatialJobInput = {
  submissionId: string;
  file: File;
  boundaryYear: string;
  spatialLevel: string;
  geoIdColumn: string;
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

async function requestUploadUrl(
  submissionId: string,
  filename: string,
  session: AuthSession | null,
): Promise<{ upload_url: string; s3_key: string; content_type: string }> {
  return contributorRequest(BASE_PATH, "/upload-url", session, {
    method: "POST",
    body: JSON.stringify({ submission_id: submissionId, filename }),
  });
}

async function uploadToS3(uploadUrl: string, file: File, contentType: string): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType || "text/csv" },
    body: file,
  });
  if (!response.ok) {
    throw new Error(
      "The file could not be uploaded. Check your connection and try again, or email heroplab23@gmail.com if it keeps failing.",
    );
  }
}

async function startPipeline(input: SpatialJobInput, s3Key: string, session: AuthSession | null): Promise<void> {
  await contributorRequest(BASE_PATH, "/start", session, {
    method: "POST",
    body: JSON.stringify({
      submission_id: input.submissionId,
      s3_key: s3Key,
      boundary_year: input.boundaryYear,
      spatial_level: input.spatialLevel,
      geo_id_column: input.geoIdColumn,
    }),
  });
}

async function fetchStatus(
  submissionId: string,
  s3Key: string,
  session: AuthSession | null,
): Promise<SpatialStatus> {
  const query = `?submission_id=${encodeURIComponent(submissionId)}&key=${encodeURIComponent(s3Key)}`;
  return contributorRequest<SpatialStatus>(BASE_PATH, `/status${query}`, session);
}

export async function generateSpatialMetadata(
  input: SpatialJobInput,
  session: AuthSession | null,
  onProgress?: (elapsedSeconds: number) => void,
): Promise<SpatialResult> {
  const job = await requestUploadUrl(input.submissionId, input.file.name, session);
  await uploadToS3(job.upload_url, input.file, job.content_type);
  await startPipeline(input, job.s3_key, session);

  const startedAt = Date.now();
  for (;;) {
    const elapsed = Date.now() - startedAt;
    if (elapsed >= POLL_TIMEOUT_MS) {
      throw new Error(
        "Generation is still running after 10 minutes. Your upload was saved, so try Generate again in a few minutes.",
      );
    }
    await delay(pollDelay(elapsed));
    onProgress?.(Math.round((Date.now() - startedAt) / 1000));

    const status = await fetchStatus(input.submissionId, job.s3_key, session);
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
