import * as React from "react";
import { statusClass, statusLabel } from "@/components/contribute/submissionDisplay";

export function SubmissionStatusBadge({ status }: { status?: string }): JSX.Element {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-sm font-bold ${statusClass(status)}`}>
      {statusLabel(status)}
    </span>
  );
}
