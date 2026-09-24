import * as React from "react";
import { DatasetSubmissionValues } from "@/services/SubmissionService";
import { SubmissionForm } from "@/components/contribute/SubmissionForm";
import { ReadOnlyProvider } from "@/components/contribute/fields";
import { ExamplePanel } from "@/components/contribute/ExamplePanel";
import {
  CITATION_FIELD,
  FIELD_DEFS,
  FieldName,
  LOCATION_STEP_INDEX,
  REVIEW_STEP_INDEX,
  STEPS,
  Step,
  allRequiredErrors,
  buildDraftCitation,
  isStepComplete,
  missingOnlyGeneratedFields,
  stepErrors,
  stepFields,
} from "@/components/contribute/submissionSteps";

function canJumpTo(index: number, activeIndex: number, values: DatasetSubmissionValues): boolean {
  if (index <= activeIndex) {
    return true;
  }
  return STEPS.slice(0, index).every((step) => isStepComplete(values, step));
}

function reviewFieldAnchorId(name: FieldName): string {
  return `review-field-${name}`;
}

function StepIndicator({
  activeIndex,
  values,
  visited,
  onJump,
  reviewFields,
}: {
  activeIndex: number;
  values: DatasetSubmissionValues;
  visited: Record<number, boolean>;
  onJump: (index: number) => void;
  reviewFields?: FieldName[];
}): JSX.Element {
  return (
    <ol className="m-0 flex list-none flex-wrap gap-2 p-0 md:flex-col md:gap-1" aria-label="Submission steps">
      {STEPS.map((step, index) => {
        const isActive = index === activeIndex;
        const isDone = !isActive && index < REVIEW_STEP_INDEX && visited[index] && isStepComplete(values, step);
        const enabled = canJumpTo(index, activeIndex, values);
        const tone = isActive
          ? "border-frenchviolet bg-frenchviolet text-white"
          : isDone
            ? "border-[#bfe3cd] bg-[#f2fff6] text-[#23623a]"
            : enabled
              ? "border-lightgray bg-white text-almostblack"
              : "border-lightgray bg-white text-darkgray";
        const badge = isActive
          ? "bg-white text-frenchviolet"
          : isDone
            ? "bg-[#23623a] text-white"
            : "bg-lightviolet text-frenchviolet";
        return (
          <li key={step.id}>
            <button
              type="button"
              disabled={!enabled}
              aria-current={isActive ? "step" : undefined}
              title={enabled ? undefined : "Finish the earlier steps first"}
              className={`inline-flex h-10 w-full items-center gap-3 rounded-md border px-3 text-left text-sm font-bold ${tone} disabled:cursor-not-allowed disabled:opacity-60`}
              onClick={() => enabled && onJump(index)}
            >
              <span className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm ${badge}`}>
                {isDone ? "✓" : index + 1}
              </span>
              {step.shortLabel}
            </button>
            {isActive && reviewFields && reviewFields.length > 0 && (
              <ul className="m-0 mt-2 hidden list-none border-l-2 border-lightviolet pl-3 md:grid md:gap-1">
                {reviewFields.map((name) => (
                  <li key={name}>
                    <a
                      href={`#${reviewFieldAnchorId(name)}`}
                      className="block truncate py-0.5 text-sm text-darkgray no-underline hover:text-frenchviolet"
                    >
                      {FIELD_DEFS[name].label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function displayValue(value: string): string {
  return value.trim() ? value : "";
}

const LONG_VALUE_CHARS = 240;

function CollapsibleValue({ value }: { value: string }): JSX.Element {
  const [open, setOpen] = React.useState(false);
  if (value.length <= LONG_VALUE_CHARS) {
    return <span className="whitespace-pre-line break-words">{value}</span>;
  }
  return (
    <span className="block">
      <span className="block whitespace-pre-line break-words">
        {open ? value : `${value.slice(0, LONG_VALUE_CHARS).trimEnd()}…`}
      </span>
      <button
        type="button"
        className="mt-1 font-bold text-frenchviolet"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        {open ? "Show less" : `Show all (${value.length.toLocaleString()} characters)`}
      </button>
    </span>
  );
}

function ValueRow({
  name,
  values,
  editable,
}: {
  name: FieldName;
  values: DatasetSubmissionValues;
  editable: boolean;
}): JSX.Element {
  const def = FIELD_DEFS[name];
  const value = displayValue(values[name]);
  const missing = editable && !value && def.required;
  return (
    <div id={reviewFieldAnchorId(name)} className="grid scroll-mt-28 gap-1 md:grid-cols-[12rem_1fr]">
      <dt className="text-sm font-bold uppercase text-darkgray">{def.label}</dt>
      <dd
        className={`m-0 break-words text-base ${
          missing ? "font-bold text-[#a6232f]" : value ? "text-almostblack" : "text-darkgray"
        }`}
      >
        {value ? (
          <CollapsibleValue value={value} />
        ) : missing ? (
          "Missing — required"
        ) : def.kind === "generated" ? (
          "Not available for this dataset"
        ) : (
          "Not provided"
        )}
      </dd>
    </div>
  );
}

export function ReviewSummary({
  values,
  onEdit,
}: {
  values: DatasetSubmissionValues;
  onEdit?: (stepIndex: number) => void;
}): JSX.Element {
  return (
    <div className="grid gap-6">
      {STEPS.slice(0, REVIEW_STEP_INDEX).map((step, index) => {
        const names: FieldName[] = [...stepFields(step), ...(step.generatedRows?.flat() || [])];
        return (
          <section key={step.id} className="rounded-md border border-lightgray bg-white p-6">
            <div className="mb-4 flex items-start justify-between gap-4">
              <h3 className="m-0 text-l font-bold text-almostblack">{step.title}</h3>
              {onEdit && (
                <button
                  type="button"
                  className="shrink-0 font-bold text-frenchviolet"
                  onClick={() => onEdit(index)}
                >
                  Edit
                </button>
              )}
            </div>
            <dl className="m-0 grid gap-3">
              {names.map((name) => (
                <ValueRow key={name} name={name} values={values} editable={Boolean(onEdit)} />
              ))}
            </dl>
          </section>
        );
      })}

      {!onEdit && stepFields(STEPS[REVIEW_STEP_INDEX]).length > 0 && (
        <section className="rounded-md border border-lightgray bg-white p-6">
          <h3 className="m-0 mb-4 text-l font-bold text-almostblack">How to cite this dataset</h3>
          <dl className="m-0 grid gap-3">
            {stepFields(STEPS[REVIEW_STEP_INDEX]).map((name) => (
              <ValueRow key={name} name={name} values={values} editable={false} />
            ))}
          </dl>
        </section>
      )}
    </div>
  );
}

function reviewNavFields(): FieldName[] {
  const main = STEPS.slice(0, REVIEW_STEP_INDEX).flatMap((step) => [
    ...stepFields(step),
    ...(step.generatedRows?.flat() || []),
  ]);
  return [...main, CITATION_FIELD];
}

type SubmissionWizardProps = {
  values: DatasetSubmissionValues;
  isSaving: boolean;
  isRemoving?: boolean;
  submitLabel: string;
  initialStep?: number;
  onChange: (values: DatasetSubmissionValues) => void;
  onFieldBlur?: () => void;
  onStepChange?: (index: number) => void;
  onSaveDraft: () => void;
  onSubmit: () => void;
  onRemove?: () => void;
  onClear?: () => void;
  autosaveLabel?: string;
  uploadSlot?: React.ReactNode;
  readOnly?: boolean;
};

export function SubmissionWizard({
  values,
  isSaving,
  isRemoving = false,
  submitLabel,
  initialStep = 0,
  onChange,
  onFieldBlur,
  onStepChange,
  onSaveDraft,
  onSubmit,
  onRemove,
  onClear,
  autosaveLabel,
  uploadSlot,
  readOnly = false,
}: SubmissionWizardProps): JSX.Element {
  const [activeIndex, setActiveIndex] = React.useState(
    Math.min(Math.max(initialStep, 0), REVIEW_STEP_INDEX),
  );
  const [attempted, setAttempted] = React.useState<Record<number, boolean>>({});
  const [visited, setVisited] = React.useState<Record<number, boolean>>(() => {
    const seen: Record<number, boolean> = {};
    for (let i = 0; i <= Math.min(Math.max(initialStep, 0), REVIEW_STEP_INDEX); i += 1) {
      seen[i] = true;
    }
    return seen;
  });
  const topRef = React.useRef<HTMLDivElement>(null);

  const step: Step = STEPS[activeIndex];
  const isReview = activeIndex === REVIEW_STEP_INDEX;
  const busy = isSaving || isRemoving;

  const citationSeeded = React.useRef(false);
  React.useEffect(() => {
    if (!isReview || readOnly || citationSeeded.current) {
      return;
    }
    citationSeeded.current = true;
    if (!values.preferredCitation.trim()) {
      const drafted = buildDraftCitation(values);
      if (drafted) {
        onChange({ ...values, preferredCitation: drafted });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReview, readOnly]);

  const goTo = React.useCallback(
    (index: number) => {
      const next = Math.min(Math.max(index, 0), REVIEW_STEP_INDEX);
      if (next === activeIndex) {
        return;
      }
      onFieldBlur?.();
      setActiveIndex(next);
      setVisited((prev) => ({ ...prev, [next]: true }));
      onStepChange?.(next);
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [activeIndex, onFieldBlur, onStepChange],
  );

  const currentErrors = attempted[activeIndex] ? stepErrors(values, step) : {};
  const reviewErrors = isReview && attempted[activeIndex] ? allRequiredErrors(values) : {};

  const continueStep = () => {
    setAttempted((prev) => ({ ...prev, [activeIndex]: true }));
    if (!isStepComplete(values, step)) {
      return;
    }
    goTo(activeIndex + 1);
  };

  const submit = () => {
    setAttempted((prev) => ({ ...prev, [activeIndex]: true }));
    if (Object.keys(allRequiredErrors(values)).length > 0) {
      return;
    }
    onSubmit();
  };

  if (readOnly) {
    return (
      <ReadOnlyProvider value>
        <ReviewSummary values={values} />
      </ReadOnlyProvider>
    );
  }

  const missingOnReview = Object.entries(reviewErrors);
  const allComplete = STEPS.slice(0, REVIEW_STEP_INDEX).every((s) => isStepComplete(values, s));

  return (
    <div
      ref={topRef}
      className="scroll-mt-28 md:grid md:grid-cols-[13rem_minmax(0,1fr)] md:gap-8 lg:grid-cols-[13rem_minmax(0,1fr)_17rem]"
    >
      <aside className="mb-6 md:sticky md:top-28 md:mb-0 md:self-start">
        <StepIndicator
          activeIndex={activeIndex}
          values={values}
          visited={visited}
          onJump={goTo}
          reviewFields={isReview ? reviewNavFields() : undefined}
        />
        {!isReview && allComplete && (
          <button
            type="button"
            className="mt-3 hidden w-full rounded-md border border-frenchviolet bg-white px-3 py-2 text-sm font-bold text-frenchviolet md:block"
            onClick={() => goTo(REVIEW_STEP_INDEX)}
          >
            Skip to review
          </button>
        )}
      </aside>

      <div className="min-w-0">
        <div className="mb-6">
          <p className="m-0 text-sm font-bold uppercase text-frenchviolet">
            Step {activeIndex + 1} of {STEPS.length}
          </p>
          <h2 className="mb-2 mt-1 text-2xl font-bold text-almostblack">{step.title}</h2>
          <p className="m-0 max-w-3xl text-base leading-7 text-darkgray">{step.intro}</p>
        </div>

        <form
          className="grid gap-6"
          onSubmit={(event) => {
            event.preventDefault();
            if (isReview) submit();
            else continueStep();
          }}
        >
          {isReview ? (
            <>
              {missingOnReview.length > 0 && (
                <div className="rounded-md border border-[#f1c5c5] bg-[#fff6f6] p-4 text-base text-almostblack" role="alert">
                  {missingOnlyGeneratedFields(reviewErrors) ? (
                    <>
                      <strong>No geometry yet.</strong> Upload a data file on the Location step and
                      we will work out the geography for you.{" "}
                      <button
                        type="button"
                        className="font-bold text-frenchviolet underline"
                        onClick={() => goTo(LOCATION_STEP_INDEX)}
                      >
                        Go to Location
                      </button>
                    </>
                  ) : (
                    <>
                      <strong>A few required fields are still empty.</strong> Use the Edit links to fill them in.
                    </>
                  )}
                </div>
              )}

              <ReviewSummary values={values} onEdit={goTo} />

              <section id={reviewFieldAnchorId(CITATION_FIELD)} className="scroll-mt-28 rounded-md border border-lightgray bg-white p-6">
                <h3 className="m-0 mb-1 text-l font-bold text-almostblack">How to cite this dataset</h3>
                <p className="mb-6 mt-0 text-sm leading-5 text-darkgray">
                  We drafted this from your answers. Edit it if the source has its own preferred
                  wording; a reviewer confirms it either way.
                </p>
                <SubmissionForm
                  values={values}
                  step={{ ...step, rows: [[CITATION_FIELD]], uploadSlot: false }}
                  onChange={onChange}
                  onFieldBlur={onFieldBlur}
                  errors={reviewErrors}
                />
              </section>
            </>
          ) : (
            <SubmissionForm
              values={values}
              step={step}
              onChange={onChange}
              onFieldBlur={onFieldBlur}
              errors={currentErrors}
              uploadSlot={uploadSlot}
            />
          )}

          <div className="sticky bottom-0 mt-2 flex flex-wrap items-center gap-3 rounded-md border border-lightgray bg-white px-4 py-3 shadow-[0_-8px_24px_rgba(0,0,0,0.06)]">
            {activeIndex > 0 && (
              <button
                type="button"
                className="h-12 rounded-md border border-lightgray bg-white px-6 text-base font-bold text-almostblack disabled:opacity-60"
                disabled={busy}
                onClick={() => goTo(activeIndex - 1)}
              >
                Back
              </button>
            )}
            <button
              type="submit"
              className="h-12 rounded-md border-none bg-frenchviolet px-6 text-base font-bold text-white disabled:opacity-60"
              disabled={busy}
            >
              {isReview ? (isSaving ? "Submitting..." : submitLabel) : "Continue"}
            </button>
            <button
              type="button"
              className="h-12 rounded-md border border-frenchviolet bg-white px-6 text-base font-bold text-frenchviolet disabled:opacity-60"
              disabled={busy}
              onClick={onSaveDraft}
            >
              {isSaving ? "Saving..." : "Save Draft"}
            </button>
            {onRemove && (
              <button
                type="button"
                className="h-12 rounded-md border border-[#c83f49] bg-white px-6 text-base font-bold text-[#a6232f] disabled:opacity-60"
                disabled={busy}
                onClick={onRemove}
              >
                {isRemoving ? "Removing..." : "Remove"}
              </button>
            )}
            {onClear && (
              <button
                type="button"
                className="h-12 rounded-md border border-lightgray bg-white px-6 text-base font-bold text-almostblack disabled:opacity-60"
                disabled={busy}
                onClick={onClear}
              >
                Clear
              </button>
            )}
            {autosaveLabel && (
              <span className="ml-auto text-sm text-darkgray" aria-live="polite">
                {autosaveLabel}
              </span>
            )}
          </div>
        </form>
      </div>
      {!isReview && (
        <aside className="hidden lg:sticky lg:top-28 lg:block lg:self-start">
          <ExamplePanel step={step} />
        </aside>
      )}
    </div>
  );
}
