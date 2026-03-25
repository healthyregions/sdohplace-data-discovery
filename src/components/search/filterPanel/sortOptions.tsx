import { AppDispatch, RootState } from "@/store";
import { setSort } from "@/store/slices/searchSlice";
import { Box } from "@mui/material";
import { KeyboardEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import tailwindConfig from "../../../../tailwind.config";
import resolveConfig from "tailwindcss/resolveConfig";

const fullConfig = resolveConfig(tailwindConfig);

const SortControl = ({
  label,
  active,
  disabled,
  onClick,
  showDivider,
}: {
  label: string;
  active: boolean;
  disabled: boolean;
  onClick: () => void;
  showDivider?: boolean;
}) => {
  // Similar to ButtonWithIcon but without the icon and with an optional divider on the right side.
  // Also has keyboard accessibility for Enter and Space keys.
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <Box
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-pressed={active}
      aria-disabled={disabled}
      onClick={() => {
        if (!disabled) onClick();
      }}
      onKeyDown={handleKeyDown}
      sx={{
        flex: 1,
        position: "relative",
        textAlign: "center",
        py: "0.75rem",
        px: "0.875rem",
        fontSize: "0.875rem",
        lineHeight: 1.2,
        color: fullConfig.theme.colors["frenchviolet"],
        fontWeight: active ? 700 : 500,
        backgroundColor: "transparent",
        cursor: disabled ? "default" : "pointer",
        userSelect: "none",
        border: "0",
        outline: "none",
      }}
    >
      {label}
      {showDivider && (
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            right: 0,
            top: "0.45rem",
            bottom: "0.45rem",
            width: "1px",
            background: fullConfig.theme.colors["lightgray"],
          }}
        />
      )}
    </Box>
  );
};

export const SortOptions = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { sort, isSearching, initializing } = useSelector(
    (state: RootState) => state.search
  );
  const isDisabled = isSearching || initializing;

  const handleRecommended = () => {
    if (isDisabled) return;
    dispatch(setSort({ field: null, direction: null }));
  };

  const handleSort = (field: string, direction: string) => {
    if (isDisabled) return;
    dispatch(setSort({ field, direction }));
  };

  const isRecommendedActive =
    (!sort.sortBy && !sort.sortOrder) ||
    (sort.sortBy === "score" && sort.sortOrder === "desc");
  const isRecentActive = sort.sortBy === "index_year" && sort.sortOrder === "desc";
  const isOldestActive = sort.sortBy === "index_year" && sort.sortOrder === "asc";

  return (
    <Box display="flex" alignItems="center" className="mt-2">
      <Box
        sx={{
          border: `1px solid ${fullConfig.theme.colors["lightviolet"]}`,
          borderRadius: "0.375rem",
          overflow: "hidden",
          width: "100%",
          background: fullConfig.theme.colors["lightviolet"],
        }}
      >
        <Box
          sx={{
            display: "flex",
            width: "100%",
            gap: 0,
            backgroundColor: fullConfig.theme.colors["lightviolet"],
          }}
        >
          <SortControl
            label="Recommended"
            active={isRecommendedActive}
            disabled={isDisabled}
            onClick={handleRecommended}
            showDivider
          />
          <SortControl
            label="Recent first"
            active={isRecentActive}
            disabled={isDisabled}
            onClick={() => handleSort("index_year", "desc")}
            showDivider
          />
          <SortControl
            label="Oldest first"
            active={isOldestActive}
            disabled={isDisabled}
            onClick={() => handleSort("index_year", "asc")}
          />
        </Box>
      </Box>
    </Box>
  );
};
