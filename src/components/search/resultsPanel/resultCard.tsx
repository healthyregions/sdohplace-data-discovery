"use client";
import * as React from "react";
import { Grid, Typography } from "@mui/material";
import tailwindConfig from "../../../../tailwind.config";
import resolveConfig from "tailwindcss/resolveConfig";
import IconText from "../iconText";
import { SolrObject } from "meta/interface/SolrObject";
import IconMatch from "../helper/IconMatch";
import { setShowDetailPanel } from "@/store/slices/uiSlice";
import { setPreviewLyrs } from "@/store/slices/mapSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { Tooltip } from "@mui/material";
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
  backgroundColor: "white !important",
  color: `${fullConfig.theme.colors["almostblack"]}`,
  maxWidth: 500,
  fontSize: "0.875rem",
  border: `1px solid ${fullConfig.theme.colors["strongorange"]}`,
  borderRadius: "4px",
  padding: "8px",
  boxShadow: "0px 4px 4px 0px lightgray",
  "& .MuiTooltip-arrow": {
    color: fullConfig.theme.colors["strongorange"],
  },
};

const scoreExplainStyle: React.CSSProperties = {
  marginBottom: "8px",
  fontSize: "0.8rem",
  color: fullConfig.theme.colors["frenchviolet"],
};

const highlightsListStyle: React.CSSProperties = {
  listStyleType: "decimal",
  paddingLeft: "20px",
  margin: 0,
};

const highlightItemSx = {
  marginBottom: "8px",
  color: `${fullConfig.theme.colors["almostblack"]}`,
  lineHeight: "1.4",
  "& strong": {
    color: fullConfig.theme.colors["strongorange"],
    fontWeight: 600,
  },
  "&:last-child": {
    marginBottom: 0,
  },
};

const mapPreviewControlStyle: React.CSSProperties = {
  padding: 0,
  cursor: "pointer",
  borderRadius: 0,
  transition: "none",
  width: "fit-content",
};

const HighlightsTooltip = ({
  q,
  spellcheck,
  highlights,
  score,
  avgScore,
  maxScore,
}) => {
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

  return filteredHighlights.length > 0 ? (
    <div>
      <div
        style={{
          ...scoreExplainStyle,
          paddingBottom: 8,
          borderBottom: `1px solid ${fullConfig.theme.colors["strongorange"]}`,
        }}
      >
        {scoreExplanation && (
          <span dangerouslySetInnerHTML={{ __html: scoreExplanation }} />
        )}
        <p style={{ paddingTop: 4 }}>Information in this result includes:</p>
      </div>
      <ol style={highlightsListStyle}>
        {filteredHighlights.map((highlight, index) => (
          <li key={index} style={{
            marginBottom: "8px",
            color: `${fullConfig.theme.colors["almostblack"]}`,
            lineHeight: "1.4",
          }}>
            ...
            <span dangerouslySetInnerHTML={{ __html: highlight }} />
            ...
          </li>
        ))}
      </ol>
    </div>
  ) : (
    <div>
      <div style={scoreExplainStyle}>
        {scoreExplanation && (
          <span dangerouslySetInnerHTML={{ __html: scoreExplanation }} />
        )}
      </div>
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
      dispatch(setShowDetailPanel(itemId));
      safeTrackEvent(EventType.ClickedItemDetails, {
        props: {
          resourceId: itemId,
        },
      });
    },
    [dispatch, plausible, itemId]
  );

  if (!props.resultItem || !itemId || !itemTitle) {
    return null;
  }

  const cardContent = props.resultItem && (
    <div
      className={`container mx-auto p-3 bg-lightbisque shadow-none rounded aspect-ratio`}
      onClick={handleShowDetails}
      style={{
        cursor: "pointer",
        border:
          showDetailPanel === itemId
            ? `1px solid ${fullConfig.theme.colors["strongorange"]}`
            : `1px solid white`,
        background:
          showDetailPanel === itemId
            ? `${fullConfig.theme.colors["lightbisque"]}`
            : undefined,
        boxShadow:
          showDetailPanel === itemId
            ? "0px 4px 4px 0px lightgray"
            : undefined,
      }}
    >
      <div className="px-2">
        <Grid container spacing={0}>
          <Grid size={{ xs: 12, sm: 10 }} className="items-start">
            <IconText
              roundBackground={true}
              svgIcon={IconMatch(itemSubject)}
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
              by{" "}
              {itemPublisher}
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
                  color: `${
                    hasHighlightIds ? fullConfig.theme.colors["frenchviolet"] : fullConfig.theme.colors["darkgray"]
                  }`,
                  fontFamily: `${fullConfig.theme.fontFamily["sans"]}`,
                  fontSize: "0.875rem",
                }}
              >
                {isInMapPreview ? "Remove coverage" : "Show coverage"}
              </div>
            </div>
          </Grid>
        </Grid>
      </div>
      <Grid
        spacing={2}
        container
        className="flex flex-col sm:flex-row px-2 mt-1"
      >
        <Grid size={{ xs: 12, sm: 8 }} sx={{ mt: "1em", pt: "0 !important" }}>
          <div className="truncate" style={resultCardStyle}>
            Keywords:{" "}
            {props.resultItem.meta.keyword
              ? props.resultItem.meta.keyword.join(", ")
              : ""}
          </div>
          <div className="truncate" style={resultCardStyle}>
            Creator:{" "}
            {props.resultItem.creator
              ? props.resultItem.creator.join(", ")
              : ""}
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
            Spatial Res:{" "}
            {props.resultItem.meta.spatial_resolution
              ? props.resultItem.meta.spatial_resolution.join(", ")
              : ""}
          </div>
        </Grid>
      </Grid>
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
        slotProps={{ tooltip: { sx: tooltipSx } }}
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
