import * as React from "react";
import { DatasetSubmissionValues } from "@/services/SubmissionService";
import { FieldInfoTooltip } from "./FieldInfoTooltip";

const ReadOnlyContext = React.createContext(false);

export const ReadOnlyProvider = ReadOnlyContext.Provider;

export function useReadOnly(): boolean {
  return React.useContext(ReadOnlyContext);
}

export const inputClassName =
  "h-12 w-full rounded-md border border-lightgray bg-white px-4 text-base text-almostblack disabled:bg-[#f5f5f7] disabled:text-[#55555f]";

export const textAreaClassName =
  "min-h-[7rem] w-full rounded-md border border-lightgray bg-white px-4 py-3 text-base leading-6 text-almostblack placeholder:text-neutralgray disabled:bg-[#f5f5f7] disabled:text-[#55555f]";

export const compactTextAreaClassName = textAreaClassName.replace("min-h-[7rem]", "min-h-[4.5rem]");

export type FieldProps = {
  label: string;
  name: keyof DatasetSubmissionValues;
  value: string;
  required?: boolean;
  hint?: string;
  example?: string;
  info?: string;
  compact?: boolean;
  onChange: (name: keyof DatasetSubmissionValues, value: string) => void;
  onBlur?: () => void;
};

export function FieldHint({ hint, example }: { hint?: string; example?: string }): JSX.Element | null {
  if (!hint && !example) return null;
  return (
    <div className="mt-1.5 space-y-1">
      {hint && <span className="block text-sm leading-5 text-darkgray">{hint}</span>}
      {example && (
        <span className="block text-sm leading-5 text-darkgray">
          <span className="font-semibold">Example:</span> {example}
        </span>
      )}
    </div>
  );
}

function examplePlaceholder(example?: string): string | undefined {
  return example ? `e.g. ${example.split("\n").join(", ")}` : undefined;
}

export function FieldLabel({
  label,
  required = false,
  info,
}: {
  label: string;
  required?: boolean;
  info?: string;
}): JSX.Element {
  return (
    <span className="mb-2 flex items-center text-base font-bold text-almostblack">
      {label}
      {required && <span className="text-frenchviolet">&nbsp;*</span>}
      {info && <FieldInfoTooltip text={info} />}
    </span>
  );
}

export function Field({
  label,
  name,
  value,
  required = false,
  hint,
  example,
  info,
  onChange,
  onBlur,
}: FieldProps): JSX.Element {
  const readOnly = useReadOnly();
  return (
    <label className="block">
      <FieldLabel label={label} required={required} info={info} />
      <input
        className={`${inputClassName} placeholder:text-neutralgray`}
        name={name}
        value={value}
        required={required}
        disabled={readOnly}
        placeholder={examplePlaceholder(example)}
        onChange={(event) => onChange(name, event.target.value)}
        onBlur={onBlur}
      />
      <FieldHint hint={hint} />
    </label>
  );
}

export function TextAreaField({
  label,
  name,
  value,
  required = false,
  hint,
  example,
  info,
  compact = false,
  onChange,
  onBlur,
}: FieldProps): JSX.Element {
  const readOnly = useReadOnly();
  return (
    <label className="block">
      <FieldLabel label={label} required={required} info={info} />
      <textarea
        className={compact ? compactTextAreaClassName : textAreaClassName}
        name={name}
        value={value}
        required={required}
        disabled={readOnly}
        placeholder={example ? `e.g. ${example}` : undefined}
        onChange={(event) => onChange(name, event.target.value)}
        onBlur={onBlur}
      />
      <FieldHint hint={hint} />
    </label>
  );
}

export type SelectFieldProps = FieldProps & {
  options: string[];
};

export function SelectField({
  label,
  name,
  value,
  required = false,
  hint,
  example,
  info,
  options,
  onChange,
  onBlur,
}: SelectFieldProps): JSX.Element {
  const readOnly = useReadOnly();
  return (
    <label className="block">
      <FieldLabel label={label} required={required} info={info} />
      <select
        className={inputClassName}
        name={name}
        value={value}
        required={required}
        disabled={readOnly}
        onChange={(event) => onChange(name, event.target.value)}
        onBlur={onBlur}
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

export function GeneratedField({
  label,
  value,
  info,
  placeholder = "Generated from your uploaded data",
  multiline = false,
}: {
  label: string;
  value: string;
  info: string;
  placeholder?: string;
  multiline?: boolean;
}): JSX.Element {
  const shared =
    "w-full rounded-md border border-lightgray bg-[#f5f5f7] px-4 text-base text-[#55555f]";
  return (
    <label className="block">
      <FieldLabel label={label} info={info} />
      {multiline ? (
        <textarea
          className={`${shared} min-h-[5rem] py-3 leading-6`}
          value={value}
          placeholder={placeholder}
          readOnly
          disabled
        />
      ) : (
        <input className={`${shared} h-12`} value={value} placeholder={placeholder} readOnly disabled />
      )}
    </label>
  );
}

export { FieldInfoTooltip, GENERATED_FIELD_INFO } from "./FieldInfoTooltip";
