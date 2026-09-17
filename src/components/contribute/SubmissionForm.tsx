import * as React from "react";
import { DatasetSubmissionValues } from "@/services/SubmissionService";
import {
  Field,
  GENERATED_FIELD_INFO,
  GeneratedField,
  ReadOnlyProvider,
  SelectField,
  TextAreaField,
} from "@/components/contribute/fields";
import { FIELD_DEFS, FieldName, Step } from "@/components/contribute/submissionSteps";

export const initialSubmissionValues: DatasetSubmissionValues = {
  title: "",
  description: "",
  creator: "",
  publisher: "",
  subject: "Health and Healthcare",
  keywords: "",
  temporalCoverage: "",
  spatialCoverage: "United States",
  spatialResolution: "County",
  accessRights: "Public",
  preferredCitation: "",
  dataUrl: "",
  documentationUrl: "",
  dataVariables: "",
  methodsVariables: "",
  dataUsageNotes: "",
  geometry: "",
  boundingBox: "",
  centroid: "",
  highlightIds: "",
};

type SubmissionFormProps = {
  values: DatasetSubmissionValues;
  step: Step;
  onChange: (values: DatasetSubmissionValues) => void;
  onFieldBlur?: () => void;
  errors?: Partial<Record<FieldName, string>>;
  uploadSlot?: React.ReactNode;
  readOnly?: boolean;
};

function FieldError({ message }: { message?: string }): JSX.Element | null {
  if (!message) return null;
  return (
    <span className="mt-2 block text-sm font-bold leading-5 text-[#a6232f]" role="alert">
      {message}
    </span>
  );
}

function UploadSection({
  slot,
  hasGenerated,
}: {
  slot: React.ReactNode;
  hasGenerated: boolean;
}): JSX.Element {
  const [showUploader, setShowUploader] = React.useState(!hasGenerated);
  const wasGenerated = React.useRef(hasGenerated);
  React.useEffect(() => {
    if (hasGenerated && !wasGenerated.current) {
      setShowUploader(false);
    }
    wasGenerated.current = hasGenerated;
  }, [hasGenerated]);
  if (hasGenerated && !showUploader) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[#bfe3cd] bg-[#f2fff6] px-4 py-3">
        <p className="m-0 text-base text-[#23623a]">
          <span className="mr-2 font-bold">✓</span>
          Geospatial fields are filled in from your upload. They are shown below.
        </p>
        <button
          type="button"
          className="shrink-0 font-bold text-frenchviolet"
          onClick={() => setShowUploader(true)}
        >
          Upload a different file
        </button>
      </div>
    );
  }
  return (
    <div>
      {hasGenerated && (
        <div className="mb-3 flex items-center justify-between gap-3 rounded-md border border-[#e5b849] bg-[#fff8df] px-4 py-2 text-sm text-almostblack">
          <span>Uploading a new file will replace the geospatial fields below.</span>
          <button
            type="button"
            className="shrink-0 font-bold text-frenchviolet"
            onClick={() => setShowUploader(false)}
          >
            Keep current results
          </button>
        </div>
      )}
      {slot}
    </div>
  );
}

export function SubmissionForm({
  values,
  step,
  onChange,
  onFieldBlur,
  errors = {},
  uploadSlot,
  readOnly = false,
}: SubmissionFormProps): JSX.Element {
  const updateValue = React.useCallback(
    (name: FieldName, value: string) => {
      onChange({ ...values, [name]: value });
    },
    [onChange, values],
  );

  const generatedNames = step.generatedRows?.flat() || [];
  const hasGenerated = generatedNames.some((name) => values[name].trim());
  const renderField = (name: FieldName): JSX.Element => {
    const def = FIELD_DEFS[name];
    const common = {
      key: name,
      label: def.label,
      name,
      value: values[name],
      required: def.required,
      hint: def.hint,
      example: def.example,
      onChange: updateValue,
      onBlur: onFieldBlur,
    };
    let control: JSX.Element;
    if (def.kind === "generated") {
      control = (
        <GeneratedField
          key={name}
          label={def.label}
          value={values[name]}
          info={GENERATED_FIELD_INFO}
          multiline={def.multiline}
        />
      );
    } else if (def.kind === "select") {
      control = <SelectField {...common} options={def.options || []} />;
    } else if (def.kind === "textarea") {
      control = <TextAreaField {...common} compact={def.compact} />;
    } else {
      control = <Field {...common} />;
    }
    return (
      <div key={name}>
        {control}
        <FieldError message={errors[name]} />
      </div>
    );
  };

  const renderRows = (rows: FieldName[][]): JSX.Element[] =>
    rows.map((row) => (
      <div key={row.join("+")} className={row.length > 1 ? "grid gap-6 md:grid-cols-2" : "grid gap-6"}>
        {row.map(renderField)}
      </div>
    ));
  return (
    <ReadOnlyProvider value={readOnly}>
      <div className="grid gap-6">
        {step.uploadSlot && uploadSlot && (
          <UploadSection slot={uploadSlot} hasGenerated={hasGenerated} />
        )}
        {renderRows(step.rows)}
        {step.generatedRows && step.generatedRows.length > 0 && (
          <section className="rounded-md border border-lightgray bg-[#fbfbfd] p-6">
            <h3 className="mb-1 text-l font-bold text-almostblack">Filled in from your upload</h3>
            {hasGenerated ? (
              <>
                <p className="mb-6 text-sm leading-5 text-darkgray">
                  These come from the file you uploaded. A reviewer checks them before anything is
                  published.
                </p>
                <div className="grid gap-6">{renderRows(step.generatedRows)}</div>
              </>
            ) : (
              <p className="m-0 text-sm leading-5 text-darkgray">
                Nothing generated yet. Upload a file above and the geometry, bounding box, centroid,
                and geographic IDs will appear here. <strong className="text-almostblack">Geometry is
                required before you can submit.</strong> Geographic IDs may not apply to every dataset.
              </p>
            )}
          </section>
        )}
      </div>
    </ReadOnlyProvider>
  );
}
