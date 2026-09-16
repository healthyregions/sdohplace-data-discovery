import * as React from "react";

export function HelpLink({ className = "" }: { className?: string }): JSX.Element {
  return (
    <a
      className={`inline-flex h-12 items-center rounded-md border border-lightgray bg-white px-6 text-base font-bold text-almostblack no-underline ${className}`}
      href="/contribute/help"
      target="_blank"
      rel="noopener noreferrer"
    >
      Help
    </a>
  );
}

export function ContributeBanner(): JSX.Element | null {
  const [closed, setClosed] = React.useState(false);
  if (closed) {
    return null;
  }
  return (
    <div className="mb-6 rounded-md border border-lightgray bg-lightviolet p-4">
      <div className="flex items-start justify-between gap-4">
        <p className="m-0 text-base font-bold leading-7 text-almostblack">How your work is saved</p>
        <button
          type="button"
          aria-label="Close this reminder"
          className="-mr-1 -mt-1 shrink-0 rounded-md px-3 py-1 text-xl font-bold leading-none text-darkgray"
          onClick={() => setClosed(true)}
        >
          &times;
        </button>
      </div>
      <ul className="mb-0 mt-2 grid gap-1 pl-5 text-base leading-7 text-almostblack">
        <li>
          Your draft is saved when you finish a field and click or tab away from it, and again every
          20 minutes.
        </li>
        <li>
          Nothing is stored in this browser. If you close this tab before moving off a field, that
          last edit is not kept, so use <strong>Save Draft</strong> before you leave.
        </li>
        <li>
          Uploading a CSV fills the geospatial fields for you and saves them straight away. It can
          take a few minutes.
        </li>
      </ul>
      <a
        className="mt-2 inline-block font-bold text-frenchviolet underline"
        href="/contribute/help"
        target="_blank"
        rel="noopener noreferrer"
      >
        How this works
      </a>
    </div>
  );
}
