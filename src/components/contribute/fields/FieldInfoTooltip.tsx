import * as React from "react";
import Tooltip from "@mui/material/Tooltip";

export const GENERATED_FIELD_INFO =
  "We automatically calculate this based on your uploaded data. If you have questions on this, please email heroplab23@gmail.com.";

export function FieldInfoTooltip({ text }: { text: string }): JSX.Element {
  return (
    <Tooltip title={text} arrow enterTouchDelay={0} leaveTouchDelay={6000}>
      <button
        type="button"
        aria-label={text}
        className="ml-2 inline-flex h-5 w-5 cursor-help items-center justify-center rounded-full border border-lightgray bg-white text-sm font-bold leading-none text-darkgray"
        onClick={(event) => event.preventDefault()}
      >
        i
      </button>
    </Tooltip>
  );
}
