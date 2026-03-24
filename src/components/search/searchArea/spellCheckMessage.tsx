import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchSearchAndRelatedResults } from "@/store/slices/searchSlice";
import { RootState, store } from "@/store";
import tailwindConfig from "../../../../tailwind.config";
import resolveConfig from "tailwindcss/resolveConfig";

const fullConfig = resolveConfig(tailwindConfig);

interface SpellCheckMessageProps {
  isMobile?: boolean;
}

const SpellCheckMessage = ({
  isMobile = false,
}: SpellCheckMessageProps) => {
  const dispatch = useDispatch<typeof store.dispatch>();
  const {
    originalQuery,
    usedQuery,
    usedSpellCheck,
    filterQueries,
    schema,
    sort
  } = useSelector((state: RootState) => state.search);
  if (!usedSpellCheck) return null;
  const handleOriginalSearch = () => {
    // When searching with original term, explicitly bypass spell check
    dispatch(
      fetchSearchAndRelatedResults({
        query: originalQuery,
        filterQueries,
        schema,
        sortBy: sort.sortBy,
        sortOrder: sort.sortOrder,
        bypassSpellCheck: true,
      })
    );
  };

  return (
    <div
      style={{
        marginTop: isMobile ? "0.875rem" : "1rem",
        paddingLeft: isMobile ? "0.75rem" : "1.5rem",
        paddingRight: isMobile ? "0.75rem" : "1.5rem",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "baseline",
        gap: "0.25rem",
        color: fullConfig.theme.colors["almostblack"],
        fontFamily: fullConfig.theme.fontFamily["sans"],
        fontSize: isMobile ? "0.95rem" : "1rem",
        lineHeight: 1.5,
      }}
    >
      <span>
        Showing results for <i>&quot;{usedQuery}&quot;</i>.
      </span>
      <button
        type="button"
        onClick={handleOriginalSearch}
        style={{
          border: "none",
          background: "transparent",
          padding: 0,
          color: fullConfig.theme.colors["frenchviolet"],
          fontFamily: fullConfig.theme.fontFamily["sans"],
          fontSize: "inherit",
          cursor: "pointer",
        }}
      >
        Search <i>&quot;{originalQuery}&quot;</i> instead?
      </button>
    </div>
  );
};

export default SpellCheckMessage;
