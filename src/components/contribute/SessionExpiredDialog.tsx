import * as React from "react";
import Dialog from "@mui/material/Dialog";

export function SessionExpiredDialog({
  open,
  onSignIn,
}: {
  open: boolean;
  onSignIn: () => void;
}): JSX.Element {
  return (
    <Dialog
      open={open}
      aria-labelledby="session-expired-title"
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: "0.375rem" } }}
    >
      <div className="p-6">
        <h2 id="session-expired-title" className="mb-4 text-xl font-bold text-almostblack">
          Your Sign-In Expired
        </h2>
        <div className="rounded-md border border-[#e5b849] bg-[#fff8df] p-4 text-base text-almostblack">
          <p className="m-0">
            You have been signed out after a period of inactivity. Your work on this page is still
            here and has not been lost.
          </p>
        </div>
        <p className="mb-0 mt-4 text-sm leading-5 text-darkgray">
          Sign in again to keep saving. Your latest changes are restored automatically when you come
          back.
        </p>
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            className="h-12 rounded-md border-none bg-frenchviolet px-6 text-base font-bold text-white"
            onClick={onSignIn}
          >
            Sign In Again
          </button>
        </div>
      </div>
    </Dialog>
  );
}
