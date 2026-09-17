import * as React from "react";
import { EXAMPLE_RECORD } from "@/components/contribute/exampleRecord";
import { FIELD_DEFS, Step, stepFields } from "@/components/contribute/submissionSteps";

export function ExamplePanel({ step }: { step: Step }): JSX.Element | null {
  const names = stepFields(step).filter(
    (name) => FIELD_DEFS[name].kind !== "generated" && EXAMPLE_RECORD.values[name],
  );
  if (names.length === 0) {
    return null;
  }
  return (
    <aside className="rounded-md border border-lightgray bg-[#fbfbfd] p-5" aria-label="Worked example">
      <p className="m-0 text-sm font-bold uppercase text-frenchviolet">A real example</p>
      <p className="mb-4 mt-1 text-sm leading-5 text-darkgray">
        How <strong className="text-almostblack">{EXAMPLE_RECORD.values.title}</strong>, a dataset
        already on the platform, answered this step.
      </p>
      <dl className="m-0 grid gap-4">
        {names.map((name) => (
          <div key={name}>
            <dt className="text-sm font-bold text-almostblack">{FIELD_DEFS[name].label}</dt>
            <dd className="m-0 mt-1 whitespace-pre-line break-words text-sm leading-5 text-darkgray">
              {EXAMPLE_RECORD.values[name]}
            </dd>
          </div>
        ))}
      </dl>
      <a
        className="mt-5 inline-block text-sm font-bold text-frenchviolet underline"
        href={EXAMPLE_RECORD.platformUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        See it on the platform
      </a>
    </aside>
  );
}
