import * as React from "react";
import { DatasetSubmissionValues } from "@/services/SubmissionService";

const ReadOnlyContext = React.createContext(false);

function useReadOnly(): boolean {
  return React.useContext(ReadOnlyContext);
}

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
};

const subjectOptions = [
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

const spatialResolutionOptions = [
  "City",
  "County",
  "State",
  "Census Tract",
  "Census Block",
  "Census Block Group",
  "Zip Code Tabulation Area (ZCTA)",
  "Other",
];

type FieldProps = {
  label: string;
  name: keyof DatasetSubmissionValues;
  value: string;
  required?: boolean;
  hint?: string;
  example?: string;
  onChange: (name: keyof DatasetSubmissionValues, value: string) => void;
};

function FieldHint({ hint, example }: { hint?: string; example?: string }) {
  if (!hint && !example) return null;
  return (
    <div className="mt-2 space-y-1">
      {hint && <span className="block text-sm leading-5 text-darkgray">{hint}</span>}
      {example && (
        <span className="block text-sm leading-5 text-darkgray">
          <span className="font-semibold">Example:</span> {example}
        </span>
      )}
    </div>
  );
}

function FieldLabel({ label, required }: { label: string; required: boolean }) {
  return (
    <span className="mb-2 block text-base font-bold text-almostblack">
      {label}
      {required && <span className="text-frenchviolet"> *</span>}
    </span>
  );
}

function Field({ label, name, value, required = false, hint, example, onChange }: FieldProps): JSX.Element {
  const readOnly = useReadOnly();
  return (
    <label className="block">
      <FieldLabel label={label} required={required} />
      <input
        className="h-12 w-full rounded-md border border-lightgray bg-white px-4 text-base text-almostblack disabled:bg-[#f5f5f7] disabled:text-[#55555f]"
        name={name}
        value={value}
        required={required}
        disabled={readOnly}
        onChange={(event) => onChange(name, event.target.value)}
      />
      <FieldHint hint={hint} example={example} />
    </label>
  );
}

function TextAreaField({ label, name, value, required = false, hint, example, onChange }: FieldProps): JSX.Element {
  const readOnly = useReadOnly();
  return (
    <label className="block">
      <FieldLabel label={label} required={required} />
      <textarea
        className="min-h-[7rem] w-full rounded-md border border-lightgray bg-white px-4 py-3 text-base leading-6 text-almostblack disabled:bg-[#f5f5f7] disabled:text-[#55555f]"
        name={name}
        value={value}
        required={required}
        disabled={readOnly}
        onChange={(event) => onChange(name, event.target.value)}
      />
      <FieldHint hint={hint} example={example} />
    </label>
  );
}

type SelectFieldProps = FieldProps & {
  options: string[];
};

function SelectField({ label, name, value, required = false, hint, example, options, onChange }: SelectFieldProps): JSX.Element {
  const readOnly = useReadOnly();
  return (
    <label className="block">
      <FieldLabel label={label} required={required} />
      <select
        className="h-12 w-full rounded-md border border-lightgray bg-white px-4 text-base text-almostblack disabled:bg-[#f5f5f7] disabled:text-[#55555f]"
        name={name}
        value={value}
        required={required}
        disabled={readOnly}
        onChange={(event) => onChange(name, event.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <FieldHint hint={hint} example={example} />
    </label>
  );
}

type SubmissionFormProps = {
  values: DatasetSubmissionValues;
  isSaving: boolean;
  isRemoving?: boolean;
  submitLabel: string;
  onChange: (values: DatasetSubmissionValues) => void;
  onRemove?: () => void;
  onSaveDraft: () => void;
  onSubmit: () => void;
  onClear?: () => void;
  readOnly?: boolean;
};

export function SubmissionForm({
  values,
  isSaving,
  isRemoving = false,
  submitLabel,
  onChange,
  onRemove,
  onSaveDraft,
  onSubmit,
  onClear,
  readOnly = false,
}: SubmissionFormProps): JSX.Element {
  const updateValue = React.useCallback(
    (name: keyof DatasetSubmissionValues, value: string) => {
      onChange({
        ...values,
        [name]: value,
      });
    },
    [onChange, values],
  );

  return (
    <ReadOnlyContext.Provider value={readOnly}>
    <form
      className="grid gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        if (readOnly) return;
        onSubmit();
      }}
    >
      <Field
        label="Dataset Title"
        name="title"
        value={values.title}
        required
        hint="The full, official name of the dataset. Use the name as it appears in the original source."
        example="Crimes by County (NaNDA)"
        onChange={updateValue}
      />
      <TextAreaField
        label="Description"
        name="description"
        value={values.description}
        required
        hint="A plain-language summary of what the dataset contains, how it was produced, and what it can be used for. Use a new line for each paragraph or distinct description value."
        example="This dataset contains county-level totals for the years 2002–2014 for eight types of crime (murder, rape, robbery, aggravated assault, burglary, larceny, motor vehicle theft, and arson). Data were compiled from the Uniform Crime Reporting Program Data Series at NACJD/ICPSR."
        onChange={updateValue}
      />
      <div className="grid gap-6 md:grid-cols-2">
        <TextAreaField
          label="Creator"
          name="creator"
          value={values.creator}
          required
          hint="The person(s) or organization(s) primarily responsible for creating the dataset. Use a new line for multiple creators."
          example={"Philippa Clarke\nRobert Melendez\nMegan Chenoweth"}
          onChange={updateValue}
        />
        <TextAreaField
          label="Publisher"
          name="publisher"
          value={values.publisher}
          required
          hint="The organization that published or made the dataset officially available. This may differ from the creator. Use a new line for multiple publishers."
          example="University of Michigan. Institute for Social Research"
          onChange={updateValue}
        />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <SelectField
          label="Subject"
          name="subject"
          value={values.subject}
          required
          hint="The primary SDOH topic category that best describes this dataset's content."
          example="Safety — for a dataset about county-level crime statistics"
          options={subjectOptions}
          onChange={updateValue}
        />
        <TextAreaField
          label="Keywords"
          name="keywords"
          value={values.keywords}
          required
          hint="Specific terms that help users discover this dataset through search. Use a new line for each keyword."
          example={"Crime\nFBI\nViolent crime statistics\nUniform Crime Reports\nBurglary\nArson"}
          onChange={updateValue}
        />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <TextAreaField
          label="Spatial Coverage"
          name="spatialCoverage"
          value={values.spatialCoverage}
          hint="The geographic area(s) covered by this dataset. Use a new line for multiple areas. Use the broadest applicable level (country, state, county, city)."
          example="United States"
          onChange={updateValue}
        />
        <SelectField
          label="Spatial Resolution"
          name="spatialResolution"
          value={values.spatialResolution}
          required
          hint="The finest geographic unit at which data are reported. This is a custom SDOH & Place field beyond the standard Aardvark schema."
          example="County — if each row in the dataset represents one U.S. county"
          options={spatialResolutionOptions}
          onChange={updateValue}
        />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Field
          label="Temporal Coverage"
          name="temporalCoverage"
          value={values.temporalCoverage}
          hint="The time period(s) that the data describe. Use a dash for ranges and a new line for multiple periods."
          example="2002-2014"
          onChange={updateValue}
        />
        <SelectField
          label="Access Rights"
          name="accessRights"
          value={values.accessRights}
          required
          hint="Whether the dataset is freely available to everyone or requires registration, a data-use agreement, or institutional access."
          example="Public — if anyone can download the data without restriction"
          options={["Public", "Restricted"]}
          onChange={updateValue}
        />
      </div>
      <Field
        label="Preferred Citation"
        name="preferredCitation"
        value={values.preferredCitation}
        required
        hint="The full citation string that users of this dataset should include in publications. Follow the format used by the original data provider when available."
        example="Clarke, Philippa, Melendez, Robert, and Chenoweth, Megan. National Neighborhood Data Archive (NaNDA): Crimes by County, United States, 2002-2014. Ann Arbor, MI: Inter-university Consortium for Political and Social Research [distributor], 2019-12-02. https://doi.org/10.3886/E115006V1"
        onChange={updateValue}
      />
      <div className="grid gap-6 md:grid-cols-2">
        <Field
          label="Data URL"
          name="dataUrl"
          value={values.dataUrl}
          hint="A direct link to the dataset download page or file. This maps to the Aardvark 'References' download URL field."
          example="https://doi.org/10.3886/E115006V1"
          onChange={updateValue}
        />
        <Field
          label="Documentation URL"
          name="documentationUrl"
          value={values.documentationUrl}
          hint="A link to a landing page, codebook, or documentation describing the dataset. This maps to the Aardvark 'References' web URL field."
          example="https://doi.org/10.3886/ICPSR38649.v1"
          onChange={updateValue}
        />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <TextAreaField
          label="Data Variables"
          name="dataVariables"
          value={values.dataVariables}
          hint="The specific columns or measures included in the dataset. Use a new line for each variable. This is a custom SDOH & Place field."
          example={"Total violent crimes reported (murder + rape + robbery + aggravated assault)\nTotal property crimes reported (burglary, larceny, and motor vehicle theft)\nFive-digit FIPS county code\nYear that the offenses occurred"}
          onChange={updateValue}
        />
        <TextAreaField
          label="Methods Variables"
          name="methodsVariables"
          value={values.methodsVariables}
          hint="The methodological variables, units of analysis, or analytical dimensions used to produce or organize the data. Use a new line for each variable. This is a custom SDOH & Place field."
          example={"Murder\nRape\nRobbery\nAggravated Assault\nCounty\nYears"}
          onChange={updateValue}
        />
      </div>
      <TextAreaField
        label="Data Usage Notes"
        name="dataUsageNotes"
        value={values.dataUsageNotes}
        hint="Any caveats, limitations, or guidance users should know before working with this dataset — for example, known data quality issues, ethical considerations, or recommended use cases."
        example="Crime data should be interpreted carefully to avoid reinforcing biases or misrepresenting communities. Differences in local crime reporting practices and law enforcement policies may affect data consistency across counties."
        onChange={updateValue}
      />
      {!readOnly && (
      <div className="flex flex-wrap gap-4 border-t border-lightgray pt-6">
        {onRemove && (
          <button
            type="button"
            className="h-12 rounded-md border border-[#c83f49] bg-white px-6 text-base font-bold text-[#a6232f] disabled:opacity-60"
            disabled={isSaving || isRemoving}
            onClick={onRemove}
          >
            {isRemoving ? "Removing..." : "Remove"}
          </button>
        )}
        <button
          type="button"
          className="h-12 rounded-md border border-frenchviolet bg-white px-6 text-base font-bold text-frenchviolet disabled:opacity-60"
          disabled={isSaving || isRemoving}
          onClick={onSaveDraft}
        >
          Save Draft
        </button>
        <button
          type="submit"
          className="h-12 rounded-md border-none bg-frenchviolet px-6 text-base font-bold text-white disabled:opacity-60"
          disabled={isSaving || isRemoving}
        >
          {isSaving ? "Saving..." : submitLabel}
        </button>
        {onClear && (
          <button
            type="button"
            className="h-12 rounded-md border border-lightgray bg-white px-6 text-base font-bold text-almostblack"
            disabled={isSaving || isRemoving}
            onClick={onClear}
          >
            Clear
          </button>
        )}
      </div>
      )}
    </form>
    </ReadOnlyContext.Provider>
  );
}
