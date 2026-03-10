"use client";
import * as React from "react";
import { Grid, Tooltip } from "@mui/material";
import tailwindConfig from "../../../../tailwind.config";
import resolveConfig from "tailwindcss/resolveConfig";
import IconText from "../iconText";
import { SolrObject } from "meta/interface/SolrObject";
import IconMatch from "../helper/IconMatch";
import { setShowDetailPanel } from "@/store/slices/uiSlice";
import { setPreviewLyrs } from "@/store/slices/mapSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { getScoreExplanation } from "../helper/FilterByScore";
import { getAllScoresSelector } from "@/store/selectors/SearchSelector";
import { EventType } from "@/lib/event";
import { usePlausible } from "next-plausible";

interface Props {
  resultItem: SolrObject;
}
const fullConfig = resolveConfig(tailwindConfig);

const resultCardStyle: React.CSSProperties = {
  color: `${fullConfig.theme.colors["almostblack"]}`,
  fontFamily: `${fullConfig.theme.fontFamily["sans"]}`,
  fontWeight: 400,
  fontSize: "0.875rem",
  paddingBottom: "0.5rem",
};

const tooltipSx = {
  backgroundColor: `${fullConfig.theme.colors["white"]} !important`,
  color: `${fullConfig.theme.colors["almostblack"]}`,
  fontFamily: `${fullConfig.theme.fontFamily["sans"]} !important`,
  maxWidth: 540,
  fontSize: "0.875rem",
  border: `1px solid ${fullConfig.theme.colors["strongorange"]}`,
  borderRadius: "10px",
  padding: "1rem",
  boxShadow: "none",
  "& b, & strong": {
    fontWeight: 700,
  },
  "& em": {
    fontStyle: "normal",
    fontWeight: 700,
  },
};

const tooltipPopperSx = {
  [`&[data-popper-placement*="right"] .MuiTooltip-tooltip`]: {
    marginLeft: "0.75rem !important",
  },
  [`&[data-popper-placement*="left"] .MuiTooltip-tooltip`]: {
    marginRight: "0.75rem !important",
  },
  [`&[data-popper-placement*="right"] .MuiTooltip-arrow::before`]: {
    borderWidth: "11px 13px 11px 0",
    borderColor: `transparent ${fullConfig.theme.colors["strongorange"]} transparent transparent`,
  },
  [`&[data-popper-placement*="left"] .MuiTooltip-arrow::before`]: {
    borderWidth: "11px 0 11px 13px",
    borderColor: `transparent transparent transparent ${fullConfig.theme.colors["strongorange"]}`,
  },
  [`&[data-popper-placement*="top"] .MuiTooltip-arrow::before`]: {
    borderWidth: "0 11px 13px 11px",
    borderColor: `transparent transparent ${fullConfig.theme.colors["strongorange"]} transparent`,
  },
  [`&[data-popper-placement*="bottom"] .MuiTooltip-arrow::before`]: {
    borderWidth: "13px 11px 0 11px",
    borderColor: `${fullConfig.theme.colors["strongorange"]} transparent transparent transparent`,
  },
};

const tooltipArrowSx = {
  color: "transparent",
  width: "13px",
  height: "22px",
  "&::before": {
    content: '""',
    width: 0,
    height: 0,
    transform: "none",
    backgroundColor: "transparent",
    borderStyle: "solid",
  },
};

const tooltipHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: "0.75rem",
  paddingBottom: "0.875rem",
  borderBottom: `1px solid ${fullConfig.theme.colors["strongorange"]}`,
  marginBottom: "0.875rem",
};

const tooltipTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "1.05rem",
  lineHeight: 1.25,
  fontWeight: 400,
  color: fullConfig.theme.colors["almostblack"],
};

const tooltipSubtitleStyle: React.CSSProperties = {
  margin: "0.625rem 0 0",
  fontSize: "0.95rem",
  lineHeight: 1.3,
  color: fullConfig.theme.colors["almostblack"],
};

const highlightsListStyle: React.CSSProperties = {
  listStyleType: "decimal",
  paddingLeft: "1.75rem",
  margin: 0,
  display: "grid",
  gap: "0.625rem",
};

const highlightItemStyle: React.CSSProperties = {
  marginBottom: 0,
  color: `${fullConfig.theme.colors["almostblack"]}`,
  lineHeight: "1.5",
  fontSize: "0.95rem",
};

const mapPreviewControlStyle: React.CSSProperties = {
  padding: 0,
  cursor: "pointer",
  borderRadius: 0,
  transition: "none",
  width: "fit-content",
};

const metadataRowStyle: React.CSSProperties = {
  color: `${fullConfig.theme.colors["almostblack"]}`,
  fontFamily: `${fullConfig.theme.fontFamily["sans"]}`,
  fontWeight: 400,
  fontSize: "0.875rem",
  paddingBottom: 0,
};

const metadataLabelStyle: React.CSSProperties = {
  fontWeight: 500,
};

interface HighlightsTooltipProps {
  q?: string;
  spellcheck?: string;
  highlights?: string[];
  score?: number;
  avgScore?: number;
  maxScore?: number;
}

const stripHtml = (value: string): string =>
  value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const getMatchLabel = (text: string): string => {
  const normalizedText = text.toLowerCase();
  if (normalizedText.includes("good match")) return "Good match";
  if (normalizedText.includes("broad match")) return "Broad match";
  if (normalizedText.includes("synonym match")) return "Synonym match";
  const [prefix] = text.split(":");
  return (prefix || "Match").trim();
};

const getTooltipBodyLabel = (matchLabel: string): string => {
  if (matchLabel === "Broad match") {
    return "May contain some information:";
  }
  if (matchLabel === "Synonym match") {
    return "May contain some information:";
  }
  return "May contain useful information:";
};

const getIndicatorColors = (matchLabel: string): string[] => {
  const activeColor = fullConfig.theme.colors["strongorange"];
  const inactiveColor = fullConfig.theme.colors["strongbisque"];
  if (matchLabel === "Broad match") {
    return [activeColor, activeColor, inactiveColor];
  }
  if (matchLabel === "Synonym match") {
    return [activeColor, inactiveColor, inactiveColor];
  }
  return [activeColor, activeColor, activeColor];
};

const MatchIndicator = ({ matchLabel }: { matchLabel: string }) => {
  const colors = getIndicatorColors(matchLabel);
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "flex-end",
        gap: "0.25rem",
        marginTop: "0.125rem",
      }}
      aria-hidden="true"
    >
      <span
        style={{
          width: "0.5rem",
          height: "0.875rem",
          backgroundColor: colors[0],
        }}
      />
      <span
        style={{
          width: "0.5rem",
          height: "1.3rem",
          backgroundColor: colors[1],
        }}
      />
      <span
        style={{
          width: "0.5rem",
          height: "1.75rem",
          backgroundColor: colors[2],
        }}
      />
    </span>
  );
};

const renderThemesWithIcons = (themes: string[]) =>
  themes.map((theme, index) => (
    <React.Fragment key={`${theme}-${index}`}>
      <span
        style={{
          color: fullConfig.theme.colors["strongorange"],
          display: "inline-flex",
          alignItems: "center",
          fontSize: "1rem",
          verticalAlign: "text-bottom",
          marginRight: "0.18rem",
        }}
      >
        {IconMatch(theme)}
      </span>
      <span>{theme}</span>
      {index < themes.length - 1 ? ", " : ""}
    </React.Fragment>
  ));

const HighlightsTooltip = ({
  q,
  spellcheck,
  highlights,
  score,
  avgScore,
  maxScore,
}: HighlightsTooltipProps) => {
  const currentQuery = useSelector((state: RootState) => state.search.query);
  const safeHighlights = Array.isArray(highlights) ? highlights : [];
  const filteredHighlights = safeHighlights.filter(
    (highlight) => highlight && highlight.trim() !== ""
  );
  const scoreExplanation = React.useMemo(() => {
    try {
      return getScoreExplanation(
        q || "",
        spellcheck,
        currentQuery || "",
        score || 0,
        avgScore || 0,
        maxScore || 0
      );
    } catch (error) {
      console.error("Error generating score explanation:", error);
      return "This item matches your search.";
    }
  }, [q, spellcheck, currentQuery, score, avgScore, maxScore]);
  const explanationText = stripHtml(scoreExplanation || "");
  const matchLabel = getMatchLabel(explanationText);
  const tooltipBodyLabel = getTooltipBodyLabel(matchLabel);
  const activeTerm = React.useMemo(() => {
    if (!q || q === "*") return currentQuery || "";
    return q.split("~")[0].replace(/"/g, "").replace(/,/g, " ").trim();
  }, [q, currentQuery]);

  return (
    <div>
      <div style={tooltipHeaderStyle}>
        <MatchIndicator matchLabel={matchLabel} />
        <div>
          <p style={tooltipTitleStyle}>
            {matchLabel}
            {activeTerm ? (
              <>
                {" "}
                for <i>&ldquo;{activeTerm}&rdquo;</i>
              </>
            ) : null}
          </p>
          <p style={tooltipSubtitleStyle}>{tooltipBodyLabel}</p>
        </div>
      </div>
      {filteredHighlights.length > 0 && (
        <ol style={highlightsListStyle}>
          {filteredHighlights.map((highlight, index) => (
            <li key={index} style={highlightItemStyle}>
              ...
              <span dangerouslySetInnerHTML={{ __html: highlight }} />
              ...
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};
const ResultCard = (props: Props): JSX.Element => {
  const dispatch = useDispatch();
  const plausible = usePlausible();
  const { showDetailPanel } = useSelector((state: RootState) => state.ui);
  const previewLyrs = useSelector((state: RootState) => state.map.previewLyrs);
  const { maxScore, avgScore } = useSelector(getAllScoresSelector);
  const isAiSearch = useSelector((state: RootState) => state.search.aiSearch);
  const effectiveAvgScore = isAiSearch && props.resultItem.termAvgScore !== undefined
    ? props.resultItem.termAvgScore
    : avgScore;

  const itemId = props.resultItem?.id;
  const itemTitle = props.resultItem?.title || "Untitled";
  const itemPublisher = props.resultItem?.meta?.publisher?.[0] || "Unknown";
  const itemSubject = props.resultItem?.meta?.subject?.[0] || "";
  const hasHighlightIds = props.resultItem?.meta?.highlight_ids?.length > 0;
  const itemTopics = React.useMemo(() => {
    const keywords = props.resultItem?.meta?.keyword || [];
    return Array.from(
      new Set(keywords.filter((topic) => Boolean(topic && topic.trim())))
    );
  }, [props.resultItem?.meta?.keyword]);
  const itemThemes = React.useMemo(() => {
    const subjects = props.resultItem?.meta?.subject || [];
    return Array.from(
      new Set(subjects.filter((theme) => Boolean(theme && theme.trim())))
    );
  }, [props.resultItem?.meta?.subject]);
  const isSelected = showDetailPanel === itemId;

  const isInMapPreview = React.useMemo(() => {
    if (!itemId) return false;
    return previewLyrs.some((p) => p.lyrId === itemId);
  }, [previewLyrs, itemId]);

  const safeTrackEvent = (eventName, props) => {
    try {
      if (process.env.NODE_ENV !== 'development') {
        plausible(eventName, props);
      }
    } catch (error) {
      console.error("Analytics error:", error);
    }
  };

  const handleMapPreviewToggle = React.useCallback(
    (event) => {
      event.preventDefault();
      event.stopPropagation();

      if (!itemId || !hasHighlightIds) return;
      if (isInMapPreview) {
          dispatch(
              setPreviewLyrs(
                  previewLyrs.filter((item) => item.lyrId != itemId)
                )
            );
        } else {
          dispatch(setShowDetailPanel(false))
        dispatch(
          setPreviewLyrs([
            {
              lyrId: itemId,
              filterIds: props.resultItem.meta.highlight_ids,
            },
          ])
        );
        safeTrackEvent(EventType.ClickedMapPreview, {
          props: {
            resourceId: itemId,
          },
        });
      }
    },
    [dispatch, isInMapPreview, previewLyrs, plausible, itemId, hasHighlightIds, props.resultItem?.meta?.highlight_ids]
  );

  const handleShowDetails = React.useCallback(
    (event) => {
      if (!itemId) return;
      if (isSelected) {
        dispatch(setShowDetailPanel(""));
        setTimeout(() => dispatch(setShowDetailPanel(itemId)), 0);
      } else {
        dispatch(setShowDetailPanel(itemId));
      }
      safeTrackEvent(EventType.ClickedItemDetails, {
        props: {
          resourceId: itemId,
        },
      });
    },
    [dispatch, plausible, itemId, isSelected]
  );

  if (!props.resultItem || !itemId || !itemTitle) {
    return null;
  }

  const cardContent = props.resultItem && (
    <div
      className={`container mx-auto p-3 bg-lightbisque shadow-none ${isSelected ? "" : "hover:shadow-xl"} rounded aspect-ratio`}
      onClick={handleShowDetails}
      style={{
        cursor: "pointer",
        border: isSelected
          ? `1px solid ${fullConfig.theme.colors["strongorange"]}`
          : "1px solid transparent",
        background: isSelected
          ? `${fullConfig.theme.colors["lightbisque"]}`
          : undefined,
        boxShadow: isSelected ? "none" : undefined,
        transition: "box-shadow 180ms ease, border-color 180ms ease",
      }}
    >
      <div className="block sm:hidden relative px-2 pt-8">
        <div
          style={{
            position: "absolute",
            left: "0.5rem",
            top: "-2.25rem",
            width: "3.5rem",
            height: "3.5rem",
            borderRadius: "9999px",
            border: `2px solid ${fullConfig.theme.colors["strongorange"]}`,
            backgroundColor: fullConfig.theme.colors["white"],
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: fullConfig.theme.colors["strongorange"],
            fontSize: "1.35rem",
            zIndex: 1,
          }}
        >
          {IconMatch(itemSubject, "filled")}
        </div>
        <div
          className="truncate"
          style={{
            ...resultCardStyle,
            fontSize: "1.1rem",
            lineHeight: 1.2,
            fontWeight: 500,
            paddingBottom: "0.25rem",
          }}
        >
          {itemTitle}
        </div>
        <div className="truncate" style={{ ...resultCardStyle, paddingBottom: "0.875rem" }}>
          by {itemPublisher}
        </div>
        <div className="truncate" style={{ ...metadataRowStyle, paddingBottom: "0.375rem" }}>
          <span style={metadataLabelStyle}>Topics:</span> {itemTopics.join(", ")}
        </div>
        <div className="truncate" style={{ ...metadataRowStyle, paddingBottom: "0.5rem" }}>
          <span style={metadataLabelStyle}>Themes:</span>{" "}
          {itemThemes.length > 0 ? renderThemesWithIcons(itemThemes) : ""}
        </div>
        <div style={{ height: "0.875rem" }} />
        <div className="truncate" style={{ ...metadataRowStyle, paddingBottom: "0.375rem" }}>
          <span style={metadataLabelStyle}>Year:</span>{" "}
          {props.resultItem.index_year?.length > 1
            ? `${Math.min(
                ...props.resultItem.index_year.map((y) => Number(y))
              )} - ${Math.max(
                ...props.resultItem.index_year.map((y) => Number(y))
              )}`
            : props.resultItem.index_year}
        </div>
        <div className="truncate" style={metadataRowStyle}>
          <span style={metadataLabelStyle}>Geo level:</span>{" "}
          {props.resultItem.meta.spatial_resolution
            ? props.resultItem.meta.spatial_resolution.join(", ")
            : ""}
        </div>
        <div className="mt-5 flex items-center gap-10">
          <button
            type="button"
            onClick={handleShowDetails}
            style={{
              color: fullConfig.theme.colors["frenchviolet"],
              fontWeight: 700,
            }}
          >
            Details <span className="ml-1">&#8594;</span>
          </button>
          <button
            type="button"
            onClick={handleMapPreviewToggle}
            disabled={!hasHighlightIds}
            style={{
              ...mapPreviewControlStyle,
              color: hasHighlightIds
                ? fullConfig.theme.colors["frenchviolet"]
                : fullConfig.theme.colors["darkgray"],
              opacity: hasHighlightIds ? 1 : 0.5,
            }}
            title={
              !hasHighlightIds
                ? "No geographic areas have been defined for this dataset"
                : "Preview the geographic areas that this dataset covers"
            }
          >
            {isInMapPreview ? "Remove coverage" : "Show coverage"}
          </button>
        </div>
      </div>
      <div className="hidden sm:block px-2">
        <Grid container spacing={0}>
          <Grid size={{ xs: 12, sm: 10 }} className="items-start">
            <IconText
              roundBackground={true}
              svgIcon={IconMatch(itemSubject, "filled")}
              label={itemTitle}
              labelClass={`text-l font-medium ${fullConfig.theme.fontFamily["sans"]}`}
              labelColor={fullConfig.theme.colors["almostblack"]}
            />
          </Grid>
          <Grid
            size={{ xs: 12, sm: 2 }}
            className="mt-1 sm:mt-0 flex justify-start sm:justify-end font-bold"
          >
            <button
              type="button"
              onClick={handleShowDetails}
              style={{ color: fullConfig.theme.colors["frenchviolet"] }}
            >
              Details <span className="ml-1">&#8594;</span>
            </button>
          </Grid>
          <Grid size={{ xs: 12, sm: 10 }} className="items-start">
            <div
              className="truncate ml-12"
              style={{ ...resultCardStyle, marginTop: "-0.5rem" }}
            >
              by {itemPublisher}
            </div>
          </Grid>
          <Grid
            size={{ xs: 12, sm: 2 }}
            className="mt-1 sm:mt-[-0.5rem] flex justify-start sm:justify-end"
          >
            <div
              onClick={handleMapPreviewToggle}
              style={{
                ...mapPreviewControlStyle,
                cursor: hasHighlightIds ? "pointer" : "default",
                opacity: hasHighlightIds ? 1 : 0.5,
              }}
              title={
                !hasHighlightIds
                  ? "No geographic areas have been defined for this dataset"
                  : "Preview the geographic areas that this dataset covers"
              }
            >
              <div
                style={{
                  color: hasHighlightIds
                    ? fullConfig.theme.colors["frenchviolet"]
                    : fullConfig.theme.colors["darkgray"],
                  fontFamily: `${fullConfig.theme.fontFamily["sans"]}`,
                  fontSize: "0.875rem",
                }}
              >
                {isInMapPreview ? "Remove coverage" : "Show coverage"}
              </div>
            </div>
          </Grid>
        </Grid>
        <Grid
          spacing={2}
          container
          className="flex flex-col sm:flex-row mt-1"
        >
          <Grid size={{ xs: 12, sm: 8 }} sx={{ mt: "1em", pt: "0 !important" }}>
            <div className="truncate" style={resultCardStyle}>
              Topics: {itemTopics.join(", ")}
            </div>
            <div className="truncate" style={resultCardStyle}>
              Themes: {itemThemes.length > 0 ? renderThemesWithIcons(itemThemes) : ""}
            </div>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }} sx={{ mt: "1em", pt: "0 !important" }}>
            <div className="truncate" style={resultCardStyle}>
              Year:{" "}
              {props.resultItem.index_year?.length > 1
                ? `${Math.min(
                    ...props.resultItem.index_year.map((y) => Number(y))
                  )} - ${Math.max(
                    ...props.resultItem.index_year.map((y) => Number(y))
                  )}`
                : props.resultItem.index_year}
            </div>
            <div className="truncate" style={resultCardStyle}>
              Geo level:{" "}
              {props.resultItem.meta.spatial_resolution
                ? props.resultItem.meta.spatial_resolution.join(", ")
                : ""}
            </div>
          </Grid>
        </Grid>
      </div>
    </div>
  );
  return props.resultItem ? (
    (props.resultItem.highlights && props.resultItem.highlights.length > 0) ||
    (props.resultItem.q && !props.resultItem.q.includes("*")) ? (
      <Tooltip
        title={
          <HighlightsTooltip
            q={props.resultItem.q}
            spellcheck={props.resultItem.spellcheck}
            highlights={props.resultItem.highlights || []}
            score={props.resultItem.score}
            avgScore={effectiveAvgScore}
            maxScore={maxScore}
          />
        }
        slotProps={{
          popper: { sx: tooltipPopperSx },
          tooltip: { sx: tooltipSx },
          arrow: { sx: tooltipArrowSx },
        }}
        placement="right"
        arrow
      >
        {cardContent}
      </Tooltip>
    ) : (
      cardContent
    )
  ) : (
    <></>
  );
};

export default ResultCard;
