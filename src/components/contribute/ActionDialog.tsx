import * as React from "react";
import Dialog from "@mui/material/Dialog";

export type ActionDialogState = {
  open: boolean;
  title: string;
  status: "running" | "success" | "error";
  message: string;
  details?: string[];
};

export const closedActionDialog: ActionDialogState = {
  open: false,
  title: "",
  status: "running",
  message: "",
};

const statusAccent: Record<ActionDialogState["status"], string> = {
  running: "border-lightgray bg-white text-almostblack",
  success: "border-[#bfe3cd] bg-[#f2fff6] text-[#23623a]",
  error: "border-[#f1c5c5] bg-[#fff6f6] text-almostblack",
};

export function ActionDialog({
  state,
  onClose,
}: {
  state: ActionDialogState;
  onClose: () => void;
}): JSX.Element {
  return (
    <Dialog
      open={state.open}
      onClose={onClose}
      aria-labelledby="action-dialog-title"
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: "0.375rem" } }}
    >
      <div className="p-6">
        <h2 id="action-dialog-title" className="mb-4 text-xl font-bold text-almostblack">
          {state.title}
        </h2>
        <div className={`rounded-md border p-4 text-base ${statusAccent[state.status]}`}>
          <p className="m-0">{state.message}</p>
          {state.details && state.details.length > 0 && (
            <ul className="mb-0 mt-2 pl-5">
              {state.details.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
          )}
        </div>
        {state.status === "running" && (
          <p className="mb-0 mt-4 text-sm leading-5 text-darkgray">
            You can close this and keep working. The task continues in the background and the form
            updates when it finishes.
          </p>
        )}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            className="h-12 rounded-md border border-lightgray bg-white px-6 text-base font-bold text-almostblack"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </Dialog>
  );
}
