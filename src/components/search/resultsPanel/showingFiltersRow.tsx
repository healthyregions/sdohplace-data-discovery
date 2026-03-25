import React from "react";
import { Box } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import tailwindConfig from "../../../../tailwind.config";
import resolveConfig from "tailwindcss/resolveConfig";

const fullConfig = resolveConfig(tailwindConfig);

export interface ShowingChip {
  id: string;
  label: string;
  icon: React.ReactNode;
  onRemove: () => void;
}

interface Props {
  chips: ShowingChip[];
  onClearAll: () => void;
}

const ShowingFiltersRow = ({ chips, onClearAll }: Props): JSX.Element | null => {
  if (!chips.length) return null;

  return (
    <Box className="sm:ml-[1.1em] mb-3">
      <div
        className="flex flex-wrap items-center gap-2"
        style={{ fontSize: "0.875rem" }}
      >
        <span
          style={{
            color: fullConfig.theme.colors["almostblack"],
            fontFamily: fullConfig.theme.fontFamily["sans"],
            fontSize: "0.875rem",
          }}
        >
          Showing:
        </span>
        {chips.map((chip) => (
          <div
            key={chip.id}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: ".5em",
              padding: ".35em .6em",
              borderRadius: "8px",
              border: `1px solid ${fullConfig.theme.colors["strongorange"]}`,
              background: "white",
              fontFamily: fullConfig.theme.fontFamily["sans"],
              color: fullConfig.theme.colors["almostblack"],
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                color: fullConfig.theme.colors["strongorange"],
              }}
            >
              {chip.icon}
            </span>
            <span>{chip.label}</span>
            <button
              type="button"
              onClick={chip.onRemove}
              className="inline-flex items-center justify-center p-1 rounded-full"
              aria-label={`Remove ${chip.label}`}
            >
              <CloseIcon
                sx={{
                  width: "20px",
                  height: "20px",
                  color: "#AAAAAA",
                }}
              />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={onClearAll}
          style={{
            border: "none",
            background: "transparent",
            color: fullConfig.theme.colors["frenchviolet"],
            fontFamily: fullConfig.theme.fontFamily["sans"],
            fontWeight: 700,
            cursor: "pointer",
            padding: ".2em .4em",
            fontSize: "0.875rem",
          }}
        >
          Clear all
        </button>
      </div>
    </Box>
  );
};

export default ShowingFiltersRow;
