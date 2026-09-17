import * as React from "react";
import { AuthSession } from "@/lib/auth";
import {
  FALLBACK_OPTIONS,
  SpatialGeneratedValues,
  SpatialOptions,
  describeResult,
  fetchSpatialOptions,
  formatBytes,
  generateSpatialMetadata,
  resultToValues,
  uploadKindForFile,
} from "@/services/SpatialMetadataService";
import { MessageBox } from "@/components/contribute/MessageBox";
import { inputClassName } from "@/components/contribute/fields";

type GenerateSpatialMetadataProps = {
  session: AuthSession | null;
  disabled?: boolean;
  onEnsureSubmissionId: () => Promise<string>;
  onGenerated: (values: SpatialGeneratedValues) => void;
  onProgress?: (elapsedSeconds: number) => void;
  onFinished?: (outcome: { ok: boolean; message: string; details?: string[] }) => void;
};

export function GenerateSpatialMetadata({
  session,
  disabled = false,
  onEnsureSubmissionId,
  onGenerated,
  onProgress,
  onFinished,
}: GenerateSpatialMetadataProps): JSX.Element {
  const [options, setOptions] = React.useState<SpatialOptions>(FALLBACK_OPTIONS);
  const [file, setFile] = React.useState<File | null>(null);
  const [boundaryYear, setBoundaryYear] = React.useState(FALLBACK_OPTIONS.boundary_years[0]);
  const [spatialLevel, setSpatialLevel] = React.useState("County");
  const [geoIdColumn, setGeoIdColumn] = React.useState("GEOID");
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [elapsed, setElapsed] = React.useState(0);
  const [error, setError] = React.useState("");
  const [summary, setSummary] = React.useState<string[]>([]);
  const sessionRef = React.useRef(session);

  sessionRef.current = session;
  
  React.useEffect(() => {
    let cancelled = false;
    void fetchSpatialOptions(sessionRef.current).then((loaded) => {
      if (!cancelled) setOptions(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const uploadKind = file ? uploadKindForFile(file.name, options) : null;
  const needsJoinFields = uploadKind === "csv";
  const isTooLarge = Boolean(file && file.size > options.max_upload_bytes);
  const isLarge = Boolean(
    file && !isTooLarge && file.size > options.large_upload_bytes,
  );

  const generate = React.useCallback(async () => {
    if (!file || isGenerating) {
      return;
    }
    setError("");
    setSummary([]);
    setElapsed(0);
    setIsGenerating(true);
    try {
      const submissionId = await onEnsureSubmissionId();
      const result = await generateSpatialMetadata(
        {
          submissionId,
          file,
          boundaryYear,
          spatialLevel,
          geoIdColumn: geoIdColumn.trim(),
          uploadKind,
        },
        () => sessionRef.current,
        (seconds) => {
          setElapsed(seconds);
          onProgress?.(seconds);
        },
      );
      const details = describeResult(result);
      onGenerated(resultToValues(result));
      setSummary(details);
      onFinished?.({
        ok: true,
        message: "Geospatial metadata generated and filled into the form below.",
        details,
      });
    } catch (generateError) {
      const message =
        generateError instanceof Error
          ? generateError.message
          : "Geospatial metadata could not be generated.";
      setError(message);
      onFinished?.({ ok: false, message });
    } finally {
      setIsGenerating(false);
    }
  }, [
    boundaryYear,
    file,
    geoIdColumn,
    isGenerating,
    onEnsureSubmissionId,
    onFinished,
    onGenerated,
    onProgress,
    spatialLevel,
    uploadKind,
  ]);

  return (
    <section className="mb-8 rounded-md border border-lightgray bg-[#fbfbfd] p-6">
      <h2 className="mb-2 text-xl font-bold text-almostblack">Generate Geospatial Metadata</h2>
      <p className="mb-4 max-w-3xl text-base leading-7 text-almostblack">
        Upload your data file first. We derive the geometry, bounding box, centroid, spatial
        coverage, and geographic IDs from it and fill them into the form below, so you do not have
        to enter them by hand.
      </p>
      <ul className="mb-6 grid max-w-3xl gap-1 pl-5 text-base leading-7 text-darkgray">
        <li>
          Accepted: a CSV data table, or a spatial file &mdash; a zipped shapefile, GeoJSON
          (named .geojson), or GeoPackage.
        </li>
        <li>Up to {formatBytes(options.max_upload_bytes)} per file.</li>
        <li>
          Most files finish in under a minute. Large ones can take several minutes, and we stop
          waiting after 10.
        </li>
        <li>You can close the progress window and keep editing while it runs.</li>
      </ul>

      <div className="grid gap-6 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-base font-bold text-almostblack">Data File</span>
          <input
            type="file"
            accept={options.accept}
            disabled={disabled || isGenerating}
            className="block w-full text-base text-almostblack file:mr-4 file:h-12 file:cursor-pointer file:rounded-md file:border file:border-frenchviolet file:bg-white file:px-6 file:text-base file:font-bold file:text-frenchviolet"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
          />
          <span className="mt-2 block text-sm leading-5 text-darkgray">
            For a shapefile, put the .shp, .shx, .dbf and .prj files together in one .zip.
          </span>
          {file && (
            <span className="mt-2 block text-sm leading-5 text-darkgray">
              {file.name} &middot; {formatBytes(file.size)}
            </span>
          )}
        </label>

        {needsJoinFields && (
          <>
            <label className="block">
              <span className="mb-2 block text-base font-bold text-almostblack">
                Geographic ID Column
              </span>
              <input
                className={inputClassName}
                value={geoIdColumn}
                disabled={disabled || isGenerating}
                placeholder="Auto-detected if blank"
                onChange={(event) => setGeoIdColumn(event.target.value)}
              />
              <span className="mt-2 block text-sm leading-5 text-darkgray">
                The column holding the FIPS or GEOID value for each row.
              </span>
            </label>

            <label className="block">
              <span className="mb-2 block text-base font-bold text-almostblack">Boundary Year</span>
              <select
                className={inputClassName}
                value={boundaryYear}
                disabled={disabled || isGenerating}
                onChange={(event) => setBoundaryYear(event.target.value)}
              >
                {options.boundary_years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-base font-bold text-almostblack">Spatial Level</span>
              <select
                className={inputClassName}
                value={spatialLevel}
                disabled={disabled || isGenerating}
                onChange={(event) => setSpatialLevel(event.target.value)}
              >
                {options.spatial_levels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}
        {file && !uploadKind && (
          <p className="m-0 self-center text-base text-[#a6232f]">
            That file type is not supported. Upload a CSV, zipped shapefile, GeoJSON (.geojson), or
            GeoPackage.
          </p>
        )}
        {isTooLarge && (
          <p className="m-0 self-center text-base text-[#a6232f]">
            That file is {formatBytes(file?.size || 0)}, over the{" "}
            {formatBytes(options.max_upload_bytes)} limit. Try removing columns or features you do
            not need, or email us and we can load it for you.
          </p>
        )}
        {uploadKind === "geo" && (
          <p className="m-0 self-center text-base leading-7 text-darkgray">
            This file already carries its own geometry, so no boundary year or spatial level is
            needed.
          </p>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button
          type="button"
          className="h-12 rounded-md border-none bg-frenchviolet px-6 text-base font-bold text-white disabled:opacity-60"
          disabled={disabled || isGenerating || !file || !uploadKind || isTooLarge}
          onClick={() => void generate()}
        >
          {isGenerating ? "Generating..." : "Generate Geospatial Metadata"}
        </button>
        {!file && !isGenerating && (
          <span className="text-base text-darkgray">Choose a data file to enable generation.</span>
        )}
        {isLarge && !isGenerating && (
          <span className="text-base text-darkgray">
            This is a large file, so the upload and processing may take several minutes.
          </span>
        )}
      </div>

      {isGenerating && (
        <MessageBox variant="loading" className="mt-6">
          Generating geospatial metadata{elapsed > 0 ? ` (${elapsed}s elapsed)` : ""}. Most files
          finish in under a minute; large ones can take several. You can keep editing the form
          below while this runs, and we will fill in the geospatial fields when it finishes.
        </MessageBox>
      )}
      {error && (
        <MessageBox variant="error" className="mt-6">
          {error}
        </MessageBox>
      )}
      {summary.length > 0 && !isGenerating && (
        <MessageBox variant="success" className="mt-6">
          <strong>Geospatial metadata generated and filled into the form below.</strong>
          <ul className="mb-0 mt-2 pl-5">
            {summary.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </MessageBox>
      )}
    </section>
  );
}
