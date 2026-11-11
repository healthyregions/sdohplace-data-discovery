import * as React from "react";
import tailwindConfig from "../../../../tailwind.config";
import resolveConfig from "tailwindcss/resolveConfig";
import CheckIcon from "@mui/icons-material/Check";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { IconButton } from "@mui/material";

const fullConfig = resolveConfig(tailwindConfig);
const COPIED_MS = 5000;

/**
 * Copies text and reports `copied` for 5 seconds, so panels can show "Copied to clipboard:".
 * Changing `resetKey` (e.g. a different resource, or the panel closing) clears the copied state.
 */
export const useCopyToClipboard = (resetKey?: unknown) => {
  const [copied, setCopied] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout>>();

  React.useEffect(() => {
    setCopied(false);
    clearTimeout(timer.current);
  }, [resetKey]);
  React.useEffect(() => () => clearTimeout(timer.current), []);

  const copy = (text: string) => {
    navigator.clipboard
      ?.writeText(text)
      .then(() => {
        setCopied(true);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setCopied(false), COPIED_MS);
      })
      .catch((err) => console.error("Failed to copy to clipboard:", err));
  };
  return { copied, copy };
};

interface Props {
  copied: boolean;
  onClick: () => void;
  label: string;
}

/**
 * Round copy button: white with a violet outline by default, orange with a check once copied.
 * Hover looks the same as rest (only the cursor changes), so the button always shows its state.
 */
const CopyButton = ({ copied, onClick, label }: Props): JSX.Element => {
  const colors = fullConfig.theme.colors;
  // !important: Tailwind's base reset (button[type='button'] { background-color: transparent })
  // is as specific as MUI's class and loads later, so it would otherwise win
  const background = `${copied ? colors["strongorange"] : "white"} !important`;
  return (
    <IconButton
      aria-label={copied ? `${label} copied` : `Copy ${label.toLowerCase()}`}
      onClick={onClick}
      disableRipple
      sx={{
        flex: "none",
        width: "2.5rem",
        height: "2.5rem",
        cursor: "pointer",
        border: `1px solid ${copied ? colors["strongorange"] : colors["frenchviolet"]}`,
        backgroundColor: background,
        color: copied ? "white" : colors["frenchviolet"],
        "&:hover": { backgroundColor: background },
      }}
    >
      {copied ? <CheckIcon /> : <ContentCopyIcon fontSize="small" />}
    </IconButton>
  );
};

export default CopyButton;
