import * as React from "react";
import { AuthSession } from "@/lib/auth";
import {
  BOUNDARY_YEARS,
  SPATIAL_LEVELS,
  SpatialGeneratedValues,
  describeResult,
  generateSpatialMetadata,
  resultToValues,
} from "@/services/SpatialMetadataService";
import { MessageBox } from "@/components/contribute/MessageBox";
import { inputClassName } from "@/components/contribute/fields";

type GenerateSpatialMetadataProps = {
  session: AuthSession | null;
  disabled?: boolean;
  onEnsureSubmissionId: () => Promise<string>;
  onGenerated: (values: SpatialGeneratedValues) => void;
};

export function GenerateSpatialMetadata({
  session,
  disabled = false,
  onEnsureSubmissionId,
  onGenerated,
}: GenerateSpatialMetadataProps): JSX.Element {
  const [file, setFile] = React.useState<File | null>(null);
  const [boundaryYear, setBoundaryYear] = React.useState(BOUNDARY_YEARS[0]);
  const [spatialLevel, setSpatialLevel] = React.useState("County");
  const [geoIdColumn, setGeoIdColumn] = React.useState("GEOID");
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [elapsed, setElapsed] = React.useState(0);
  const [error, setError] = React.useState("");
  const [summary, setSummary] = React.useState<string[]>([]);

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
        { submissionId, file, boundaryYear, spatialLevel, geoIdColumn: geoIdColumn.trim() },
        session,
        setElapsed,
      );
      onGenerated(resultToValues(result));
      setSummary(describeResult(result));
    } catch (generateError) {
      setError(
        generateError instanceof Error
          ? generateError.message
          : "Geospatial metadata could not be generated.",
      );
    } finally {
      setIsGenerating(false);
    }
  }, [boundaryYear, file, geoIdColumn, isGenerating, onEnsureSubmissionId, onGenerated, session, spatialLevel]);

  return (
    <section className="mb-8 rounded-md border border-lightgray bg-[#fbfbfd] p-6">
      <h2 className="mb-2 text-xl font-bold text-almostblack">Generate Geospatial Metadata</h2>
      <p className="mb-6 max-w-3xl text-base leading-7 text-almostblack">
        Upload your data CSV first. We derive the geometry, bounding box, centroid, spatial
        coverage, and geographic IDs from it and fill them into the form below, so you do not have
        to enter them by hand.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-base font-bold text-almostblack">Data File (CSV)</span>
          <input
            type="file"
            accept=".csv"
            disabled={disabled || isGenerating}
            className="block w-full text-base text-almostblack file:mr-4 file:h-12 file:cursor-pointer file:rounded-md file:border file:border-frenchviolet file:bg-white file:px-6 file:text-base file:font-bold file:text-frenchviolet"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
          />
          <span className="mt-2 block text-sm leading-5 text-darkgray">
            Only CSV files are supported right now.
          </span>
        </label>

        <label className="block">
          <span className="mb-2 block text-base font-bold text-almostblack">Geographic ID Column</span>
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
            {BOUNDARY_YEARS.map((year) => (
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
            {SPATIAL_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button
          type="button"
          className="h-12 rounded-md border-none bg-frenchviolet px-6 text-base font-bold text-white disabled:opacity-60"
          disabled={disabled || isGenerating || !file}
          onClick={() => void generate()}
        >
          {isGenerating ? "Generating..." : "Generate Geospatial Metadata"}
        </button>
        {!file && !isGenerating && (
          <span className="text-base text-darkgray">Choose a CSV file to enable generation.</span>
        )}
      </div>

      {isGenerating && (
        <MessageBox variant="loading" className="mt-6">
          Generating geospatial metadata. This can take several minutes for large files
          {elapsed > 0 ? ` (${elapsed}s elapsed)` : ""}. You can leave this tab open while it runs.
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
