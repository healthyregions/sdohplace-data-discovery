"use client";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch, store } from "@/store";
import tailwindConfig from "../../../../tailwind.config";
import resolveConfig from "tailwindcss/resolveConfig";
import SearchIcon from "@mui/icons-material/Search";
import { setShowFilter } from "@/store/slices/uiSlice";
import { Box, SvgIcon, Fade, Collapse, Alert, Button } from "@mui/material";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import React from "react";
import Image from "next/image";
import ResultCard from "./resultCard";
import ResultListSkeleton from "./resultListSkeleton";
import FilterPanel from "../filterPanel";
import ShowingFiltersRow, { ShowingChip } from "./showingFiltersRow";
import {
  selectSearchState,
  getFilterStatus,
  resetFilters,
} from "@/middleware/filterHelper";
import { EventType } from "@/lib/event";
import { usePlausible } from "next-plausible";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import GrainIcon from "@mui/icons-material/Grain";
import NorthRoundedIcon from "@mui/icons-material/NorthRounded";
import SouthRoundedIcon from "@mui/icons-material/SouthRounded";
import StorageOutlinedIcon from "@mui/icons-material/StorageOutlined";
import IconMatch from "../helper/IconMatch";
import { SearchUIConfig } from "@/components/searchUIConfig";
import IconTag from "../detailPanel/iconTag";
import {
  clearError,
  clearSearch,
  reloadAiSearchFromUrl,
  setAISearch,
  setIndexYear,
  setResource,
  setSort,
  setSpatialResolution,
  setSubject,
} from "@/store/slices/searchSlice";
import { setGeocodeFeature } from "@/store/slices/mapSlice";
import { SearchService } from "@/services/SearchService";
import {
  detectNoResultScenario,
  getNoResultMessage,
  shouldFetchFallbackThemes,
} from "./noResultRecommendationLogic";

interface Props {
  schema: any;
}

const fullConfig = resolveConfig(tailwindConfig);
const resultsPanelStyle: React.CSSProperties = {
  color: `${fullConfig.theme.colors["almostblack"]}`,
  fontFamily: `${fullConfig.theme.fontFamily["sans"]}`,
};

const ResultsPanel = (props: Props): JSX.Element => {
  const dispatch = useDispatch<AppDispatch>();
  const searchState = useSelector(selectSearchState);
  const { hasError, errorMessage, errorType, aiSearch } = useSelector(
    (state: RootState) => state.search
  );
  const filterStatus = useSelector(getFilterStatus) as {
    hasActiveFilters: boolean;
    activeFilters: { [key: string]: boolean };
  };
  const plausible = usePlausible();
  const showFilter = useSelector((state: RootState) => state.ui.showFilter);
  const isLoading = searchState.isSearching || searchState.isSuggesting;
  const hasSearchTerm = React.useMemo(() => {
    const terms = [
      searchState.query,
      searchState.originalQuery,
      searchState.usedQuery,
    ];
    return terms.some(
      (value) =>
        typeof value === "string" && value.trim() !== "" && value !== "*"
    );
  }, [searchState.query, searchState.originalQuery, searchState.usedQuery]);
  const [previousCount, setPreviousCount] = React.useState(
    searchState.results.length
  );
  const [isResetting, setIsResetting] = React.useState(false);
  const [isInitialLoad, setIsInitialLoad] = React.useState(true);
  const [hasTriedUrlReload, setHasTriedUrlReload] = React.useState(false);
  const [, forceUpdate] = React.useState({});
  const [hasSearchBeenInitiated, setHasSearchBeenInitiated] =
    React.useState(false);
  const [showNoResults, setShowNoResults] = React.useState(false);
  const [hasCompletedSearch, setHasCompletedSearch] = React.useState(false);
  const [stableResultsLabel, setStableResultsLabel] = React.useState("");
  const [prevResults, setPrevResults] = React.useState([]);
  const [fallbackThemes, setFallbackThemes] = React.useState<string[]>([]);
  const [isLoadingFallbackThemes, setIsLoadingFallbackThemes] =
    React.useState(false);
  const subjectFilters = useSelector(
    (state: RootState) => state.search.subject
  );
  const resourceFilters = useSelector(
    (state: RootState) => state.search.resource
  );
  const yearFilters = useSelector((state: RootState) => state.search.indexYear);
  const spatialResolutionFilters = useSelector(
    (state: RootState) => state.search.spatialResolution
  );
  const sortConfig = useSelector((state: RootState) => state.search.sort);
  const isAiSearch = useSelector((state: RootState) => state.search.aiSearch);

  const getSortedResults = React.useCallback(
    (directResults, relatedResults) => {
      const allResults = [...directResults, ...relatedResults];

      if (sortConfig.sortBy === "index_year") {
        return allResults.sort((a, b) => {
          const aYears = a.index_year || [];
          const bYears = b.index_year || [];
          if (aYears.length === 0 && bYears.length === 0) return 0;
          if (aYears.length === 0) return 1;
          if (bYears.length === 0) return -1;
          const aYearsNum = aYears
            .map((year) => parseInt(year, 10))
            .filter((y) => !isNaN(y));
          const bYearsNum = bYears
            .map((year) => parseInt(year, 10))
            .filter((y) => !isNaN(y));
          if (aYearsNum.length === 0 && bYearsNum.length === 0) return 0;
          if (aYearsNum.length === 0) return 1;
          if (bYearsNum.length === 0) return -1;
          const aValue =
            sortConfig.sortOrder === "desc"
              ? Math.max(...aYearsNum)
              : Math.min(...aYearsNum);
          const bValue =
            sortConfig.sortOrder === "desc"
              ? Math.max(...bYearsNum)
              : Math.min(...bYearsNum);
          return sortConfig.sortOrder === "desc"
            ? bValue - aValue
            : aValue - bValue;
        });
      }
      return allResults;
    },
    [sortConfig.sortBy, sortConfig.sortOrder]
  );

  const isNonLatinSearch = React.useMemo(() => {
    if (!searchState.query) return false;
    const nonLatinRegex = /[^\u0000-\u007F]/;
    return nonLatinRegex.test(searchState.query);
  }, [searchState.query]);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hasAiSearch =
      params.has("ai_search") && params.get("ai_search") === "true";
    if (!hasTriedUrlReload && !searchState.isSearching) {
      const query = params.get("query");
      if (
        hasAiSearch &&
        query &&
        query.trim() !== "" &&
        searchState.results.length === 0
      ) {
        setHasTriedUrlReload(true);
        if (hasAiSearch) {
          setIsInitialLoad(false);
        }
        setTimeout(() => {
          dispatch(
            reloadAiSearchFromUrl({
              query: query,
              schema: props.schema,
            })
          );
        }, 300);
      } else {
        setHasTriedUrlReload(true);
      }
    }
  }, [
    dispatch,
    hasTriedUrlReload,
    searchState.isSearching,
    searchState.results.length,
    props.schema,
  ]);

  React.useEffect(() => {
    if (searchState.results.length > 0 && !isLoading) {
      setPrevResults(searchState.results);
    }
  }, [searchState.results, isLoading]);

  const uniqueRelatedList = React.useMemo(() => {
    try {
      if (isLoading) {
        return [];
      }

      const relatedResults = Array.isArray(searchState.relatedResults)
        ? searchState.relatedResults
        : [];

      const uniqueResults = relatedResults.filter(
        (v, i, a) => a.findIndex((t) => (t && t.id) === (v && v.id)) === i
      );

      const results = Array.isArray(searchState.results)
        ? searchState.results
        : [];

      const filtered = uniqueResults.filter(
        (v) => v && !results.some((t) => t && t.id === v.id)
      );

      return filtered.filter((item) => item && item.id);
    } catch (error) {
      console.error("Error processing related results:", error);
      return [];
    }
  }, [searchState.relatedResults, searchState.results, isLoading]);

  const handleFilterToggle = () => {
    dispatch(setShowFilter(!showFilter));
  };

  const handleClearFilters = async () => {
    dispatch(setGeocodeFeature(null));
    setIsResetting(true);
    await resetFilters(store);
    setTimeout(() => {
      setIsResetting(false);
      setIsInitialLoad(false);
      setHasCompletedSearch(true);
      setShowNoResults(true);
    }, 500);
  };

  const handleRemoveTheme = React.useCallback(
    (theme: string) => {
      const nextSubjects = (subjectFilters || []).filter(
        (value) => value !== theme
      );
      dispatch(setSubject(nextSubjects));
    },
    [dispatch, subjectFilters]
  );

  const handleClearYearFilter = React.useCallback(() => {
    dispatch(setIndexYear([]));
  }, [dispatch]);

  const handleRemoveResource = React.useCallback(
    (resource: string) => {
      const nextResources = (resourceFilters || []).filter(
        (value) => value !== resource
      );
      dispatch(setResource(nextResources));
    },
    [dispatch, resourceFilters]
  );

  const handleClearSpatialResolution = React.useCallback(() => {
    dispatch(setSpatialResolution([]));
  }, [dispatch]);

  const handleClearSortSelection = React.useCallback(() => {
    dispatch(setSort({ field: null, direction: null }));
  }, [dispatch]);

  const yearFilterLabel = React.useMemo(() => {
    if (!yearFilters || yearFilters.length === 0) return null;
    const numericYears = yearFilters
      .map((year) => Number(year))
      .filter((year) => !Number.isNaN(year));
    if (!numericYears.length) return null;
    const minYear = Math.min(...numericYears);
    const maxYear = Math.max(...numericYears);
    if (minYear === maxYear) return `${minYear}`;
    return `${minYear} - ${maxYear}`;
  }, [yearFilters]);

  const resolutionDisplayMap = React.useMemo(
    () =>
      new Map(
        SearchUIConfig.search.searchBox.spatialResOptions.map((option) => [
          option.value,
          option.display_name,
        ])
      ),
    []
  );

  const sortLabel = React.useMemo(() => {
    if (sortConfig.sortBy !== "index_year") return null;
    if (sortConfig.sortOrder === "desc") return "Recent first";
    if (sortConfig.sortOrder === "asc") return "Oldest first";
    return null;
  }, [sortConfig.sortBy, sortConfig.sortOrder]);

  const showingChips = React.useMemo(() => {
    const chips: ShowingChip[] = [];
    (subjectFilters || []).forEach((subject) => {
      chips.push({
        id: `subject-${subject}`,
        label: subject,
        icon: IconMatch(subject),
        onRemove: () => handleRemoveTheme(subject),
      });
    });
    (resourceFilters || []).forEach((resource) => {
      chips.push({
        id: `resource-${resource}`,
        label: resource,
        icon: <StorageOutlinedIcon />,
        onRemove: () => handleRemoveResource(resource),
      });
    });
    if (yearFilterLabel) {
      chips.push({
        id: "index-year",
        label: yearFilterLabel,
        icon: <CalendarMonthOutlinedIcon />,
        onRemove: handleClearYearFilter,
      });
    }
    if (spatialResolutionFilters && spatialResolutionFilters.length > 0) {
      const spatialResolutionLabel = spatialResolutionFilters
        .map((resolution) => resolutionDisplayMap.get(resolution) || resolution)
        .join(", ");
      chips.push({
        id: "spatial-resolution",
        label: spatialResolutionLabel,
        icon: <GrainIcon />,
        onRemove: handleClearSpatialResolution,
      });
    }
    if (sortLabel) {
      chips.push({
        id: "sort",
        label: sortLabel,
        icon:
          sortConfig.sortOrder === "asc" ? (
            <NorthRoundedIcon />
          ) : (
            <SouthRoundedIcon />
          ),
        onRemove: handleClearSortSelection,
      });
    }
    return chips;
  }, [
    subjectFilters,
    resourceFilters,
    yearFilterLabel,
    spatialResolutionFilters,
    resolutionDisplayMap,
    sortLabel,
    sortConfig.sortOrder,
    handleRemoveTheme,
    handleRemoveResource,
    handleClearYearFilter,
    handleClearSpatialResolution,
    handleClearSortSelection,
  ]);

  const resultsToShow = React.useMemo(() => {
    if (searchState.aiSearch && isLoading && prevResults.length > 0) {
      return prevResults;
    }
    return searchState.results;
  }, [searchState.aiSearch, isLoading, prevResults, searchState.results]);

  const sortedResults = React.useMemo(() => {
    const directResults = resultsToShow;
    const relatedResults = uniqueRelatedList;
    const sortedRes = getSortedResults(directResults, relatedResults);
    if (!isAiSearch || sortConfig.sortBy === "index_year") return sortedRes;

    // AI search with relevance sorting: compute per-term average scores
    const termAvgScores = new Map<string, number>();
    sortedRes.forEach((result) => {
      const term = result.q || "unknown";
      if (!termAvgScores.has(term)) {
        const termResults = sortedRes.filter(
          (r) => (r.q || "unknown") === term
        );
        const termScores = termResults.map((r) => r.score || 0);
        const termAvg =
          termScores.length > 0
            ? termScores.reduce((a, b) => a + b, 0) / termScores.length
            : 0;
        termAvgScores.set(term, termAvg);
      }
    });
    const resultsWithTermAvg = sortedRes.map((result) => {
      const term = result.q || "unknown";
      return {
        ...result,
        termAvgScore: termAvgScores.get(term) || 0,
      };
    });
    return resultsWithTermAvg.sort((a, b) => {
      const aAboveAvg = (a.score || 0) >= a.termAvgScore;
      const bAboveAvg = (b.score || 0) >= b.termAvgScore;
      if (aAboveAvg && !bAboveAvg) return -1;
      if (!aAboveAvg && bAboveAvg) return 1;
      if (a.score && b.score) {
        return b.score - a.score;
      }
      return 0;
    });
  }, [
    resultsToShow,
    uniqueRelatedList,
    getSortedResults,
    isAiSearch,
    sortConfig.sortBy,
  ]);

  const displayCount = React.useMemo(() => {
    if (isResetting || isLoading) {
      return previousCount;
    }
    if (sortedResults && sortedResults.length > 0) {
      return sortedResults.length;
    }
    const relatedCount = isLoading ? 0 : uniqueRelatedList.length;
    const totalCount = searchState.results.length + relatedCount;
    return totalCount;
  }, [
    isLoading,
    isResetting,
    previousCount,
    searchState.results.length,
    uniqueRelatedList.length,
    sortedResults,
  ]);

  React.useEffect(() => {
    if (
      searchState.query &&
      searchState.query !== "" &&
      searchState.query !== "*"
    ) {
      const isForceRefresh = searchState.query.includes(":");
      if (isForceRefresh) {
        setHasCompletedSearch(false);
        setIsInitialLoad(true);
        forceUpdate({});
      }
      setHasSearchBeenInitiated(true);
    }
  }, [searchState.query]);

  React.useEffect(() => {
    if (isLoading) {
      setHasCompletedSearch(false);
      setShowNoResults(false);
      if (!(searchState.aiSearch && prevResults.length > 0)) {
        setIsInitialLoad(true);
      }
    } else if (!isInitialLoad) {
      if (isNonLatinSearch && searchState.aiSearch) {
        setTimeout(() => {
          setHasCompletedSearch(true);
          setShowNoResults(true);
        }, 1000);
      } else {
        setHasCompletedSearch(true);
        setShowNoResults(true);
      }
    }
  }, [
    isLoading,
    isInitialLoad,
    isNonLatinSearch,
    searchState.aiSearch,
    prevResults.length,
  ]);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hasSearchParams = params.has("query") || params.has("ai_search");
    const hasAiSearch =
      params.has("ai_search") && params.get("ai_search") === "true";

    if (hasSearchParams && !hasAiSearch) {
      setIsInitialLoad(true);
    }

    if (!isLoading) {
      if (
        searchState.results.length > 0 ||
        (searchState.relatedResults.length > 0 && !isLoading) ||
        hasCompletedSearch
      ) {
        if (isNonLatinSearch && searchState.aiSearch) {
          setTimeout(() => {
            setIsInitialLoad(false);
          }, 500);
        } else {
          setIsInitialLoad(false);
        }
      } else if (hasSearchBeenInitiated) {
        setTimeout(() => {
          setIsInitialLoad(false);
          setHasCompletedSearch(true);
          setShowNoResults(true);
        }, 500);
      }

      const relatedCount = isLoading ? 0 : uniqueRelatedList.length;
      const totalCount = searchState.results.length + relatedCount;
      setPreviousCount(totalCount);
    } else if (!(searchState.aiSearch && prevResults.length > 0)) {
      setIsInitialLoad(true);
    }
  }, [
    isLoading,
    searchState.results.length,
    searchState.relatedResults.length,
    uniqueRelatedList.length,
    isResetting,
    hasCompletedSearch,
    isNonLatinSearch,
    searchState.aiSearch,
    hasSearchBeenInitiated,
    prevResults.length,
  ]);

  React.useEffect(() => {
    if (isLoading) {
      forceUpdate({});
      if (!(searchState.aiSearch && prevResults.length > 0)) {
        setIsInitialLoad(true);
      }
      setShowNoResults(false);
      if (searchState.aiSearch && !prevResults.length) {
        setPreviousCount(0);
      }
    } else if (
      hasSearchBeenInitiated ||
      (filterStatus && filterStatus.hasActiveFilters)
    ) {
      setTimeout(() => {
        if (
          searchState.results.length === 0 &&
          uniqueRelatedList.length === 0
        ) {
          setIsInitialLoad(false);
          setHasCompletedSearch(true);
          setShowNoResults(true);
        }
      }, 300);
    }
  }, [
    isLoading,
    searchState.aiSearch,
    searchState.results.length,
    uniqueRelatedList.length,
    hasSearchBeenInitiated,
    isNonLatinSearch,
    prevResults.length,
    filterStatus,
  ]);

  const renderLoadingState = () => {
    const skeletonCount = displayCount > 0 ? Math.min(displayCount, 6) : 4;
    return <ResultListSkeleton count={skeletonCount} />;
  };

  const shouldShowResultsCount = React.useMemo(() => {
    return !isLoading && !isResetting && hasCompletedSearch && displayCount > 0;
  }, [isLoading, isResetting, hasCompletedSearch, displayCount]);

  const currentResultsLabel = React.useMemo(() => {
    return hasSearchTerm
      ? `Results (${displayCount})`
      : `All Data Sources (${displayCount})`;
  }, [hasSearchTerm, displayCount]);

  React.useEffect(() => {
    if (shouldShowResultsCount) {
      setStableResultsLabel(currentResultsLabel);
    }
  }, [shouldShowResultsCount, currentResultsLabel]);

  const resultsHeaderLabel = shouldShowResultsCount
    ? currentResultsLabel
    : stableResultsLabel;

  const shouldShowLoading = React.useMemo(() => {
    if (
      filterStatus &&
      filterStatus.hasActiveFilters &&
      !isLoading &&
      !isResetting &&
      searchState.results.length === 0 &&
      uniqueRelatedList.length === 0
    ) {
      return false;
    }

    return isLoading || isResetting || isInitialLoad || !showNoResults;
  }, [
    isLoading,
    isResetting,
    isInitialLoad,
    showNoResults,
    filterStatus,
    searchState.results.length,
    uniqueRelatedList.length,
  ]);

  const noResultScenario = React.useMemo(
    () =>
      detectNoResultScenario(
        hasSearchTerm,
        Boolean(filterStatus?.hasActiveFilters)
      ),
    [hasSearchTerm, filterStatus]
  );

  const noResultMessage = React.useMemo(
    () => getNoResultMessage(noResultScenario),
    [noResultScenario]
  );

  const isNoResultsView = React.useMemo(
    () =>
      !shouldShowLoading &&
      !hasError &&
      sortedResults.length === 0 &&
      displayCount === 0,
    [shouldShowLoading, hasError, sortedResults.length, displayCount]
  );

  React.useEffect(() => {
    if (!isNoResultsView || !shouldFetchFallbackThemes(noResultScenario)) {
      setFallbackThemes([]);
      setIsLoadingFallbackThemes(false);
      return;
    }
    let isCancelled = false;
    setIsLoadingFallbackThemes(true);
    const service = new SearchService(props.schema);
    // #51: if no results is due to query only , fetch some theme recommendations based on the most common themes via a faceted query on the subject field (theme)
    service
      .fetchNoResultThemeRecommendations(3)
      .then((themes) => {
        if (isCancelled) return;
        setFallbackThemes(themes);
      })
      .catch((error) => {
        if (isCancelled) return;
        console.error("Failed to fetch no-result recommendations:", error);
        setFallbackThemes([]);
      })
      .finally(() => {
        if (isCancelled) return;
        setIsLoadingFallbackThemes(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [isNoResultsView, noResultScenario, props.schema]);

  return (
    <div
      className="results-panel"
      style={{ flex: "1 1 auto", overflow: "hidden" }}
    >
      <span style={resultsPanelStyle}>
        <Box>
          <div className="flex items-center justify-between gap-3 mb-[1.5em] sm:ml-[1.1em]">
            <div className="flex min-w-0 flex-1 text-2xl">
              <Fade in={!isResetting} timeout={300}>
                <div className="min-w-0">
                  <Box sx={{ minHeight: "2rem" }}>
                    {resultsHeaderLabel || "\u00A0"}
                  </Box>
                </div>
              </Fade>
            </div>

            <div
              className="inline-flex items-center sm:justify-end flex-none text-l sm:text-base sm:mr-[2.3em] text-frenchviolet cursor-pointer whitespace-nowrap"
              onClick={handleFilterToggle}
            >
              <SvgIcon
                component={FilterAltIcon}
                className="text-frenchviolet mr-1"
              />
              <div>Sort & Filter</div>
            </div>
          </div>
        </Box>

        <Collapse
          className={`relative w-full ${showFilter ? "mb-4" : ""}`}
          in={showFilter}
          timeout={300}
          easing={"linear"}
        >
          <FilterPanel />
        </Collapse>
        <ShowingFiltersRow
          chips={showingChips}
          onClearAll={handleClearFilters}
        />

        <div className="flex flex-col mt-4 sm:mt-0" style={{ height: "100%" }}>
          <Fade in={true} timeout={300}>
            <div>
              {shouldShowLoading ? (
                <div className="transition-opacity duration-500">
                  {renderLoadingState()}
                </div>
              ) : (
                <div className="force-scrollbar transition-opacity duration-500">
                  {sortedResults.length > 0 || displayCount > 0 ? (
                    <Box
                      height="100%"
                      sx={{
                        overflowY: "scroll",
                        paddingRight: "1.25em",
                        maxHeight: "100vh",
                      }}
                    >
                      {sortedResults.map((result) =>
                        result && result.id ? (
                          <div
                            key={result.id}
                            className="mb-[2.5em] first:pt-6 sm:mb-[0.75em] sm:first:pt-0"
                          >
                            <ResultCard resultItem={result} />
                          </div>
                        ) : null
                      )}
                    </Box>
                  ) : hasError ? (
                    <div className="flex flex-col sm:ml-[1.1em] sm:mb-[2.5em]">
                      <Box className="flex flex-col justify-center items-center mb-[1.5em]">
                        <ErrorOutlineIcon
                          className="text-red-500 mb-3"
                          sx={{ fontSize: 48 }}
                        />
                        <div className="text-lg font-medium text-gray-800 mb-2">
                          {errorType === "server"
                            ? "AI Search Service Unavailable"
                            : errorType === "network"
                            ? "Connection Issue"
                            : "Search Error"}
                        </div>
                      </Box>
                      <Alert
                        severity={errorType === "network" ? "warning" : "error"}
                        className="mb-4"
                        sx={{
                          backgroundColor:
                            errorType === "network" ? "#fff3cd" : "#f8d7da",
                          borderColor:
                            errorType === "network" ? "#ffeaa7" : "#f5c6cb",
                          color:
                            errorType === "network" ? "#856404" : "#721c24",
                        }}
                      >
                        <div className="flex flex-col space-y-3">
                          <div className="text-sm">{errorMessage}</div>
                          {aiSearch && (
                            <Box className="flex flex-col sm:flex-row gap-3 mt-3">
                              <Button
                                variant="contained"
                                size="small"
                                startIcon={<SearchIcon />}
                                onClick={() => {
                                  dispatch(setAISearch(false));
                                  dispatch(clearSearch());
                                  if (typeof window !== "undefined") {
                                    const searchParams = new URLSearchParams(
                                      window.location.search
                                    );
                                    searchParams.delete("query");
                                    searchParams.set("ai_search", "false");
                                    const serialized = searchParams.toString();
                                    const newUrl = serialized
                                      ? `${window.location.pathname}?${serialized}`
                                      : window.location.pathname;
                                    window.history.pushState({}, "", newUrl);
                                  }
                                  dispatch(clearError());
                                }}
                                sx={{
                                  backgroundColor: "#2563eb",
                                  "&:hover": { backgroundColor: "#1d4ed8" },
                                  textTransform: "none",
                                  fontWeight: 500,
                                }}
                              >
                                Switch to Keyword Search
                              </Button>
                              <div className="text-xs text-gray-600 self-center">
                                Search for specific terms directly in our
                                database
                              </div>
                            </Box>
                          )}
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => dispatch(clearError())}
                            sx={{
                              alignSelf: "flex-start",
                              textTransform: "none",
                              mt: 1,
                            }}
                          >
                            Dismiss
                          </Button>
                        </div>
                      </Alert>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:ml-[1.1em] sm:mb-[2.5em]">
                      <Box className="flex flex-col justify-center items-center mb-[1.5em]">
                        <Image
                          src="/icons/no_results.svg"
                          alt="No results icon"
                          width={64}
                          height={64}
                          style={{ marginBottom: "0.35rem" }}
                        />
                        <div className="text-s">No results</div>
                        {(() => {
                          try {
                            if (process.env.NODE_ENV !== "development") {
                              plausible(EventType.ReceivedNoSearchResults, {
                                props: {
                                  searchQuery: searchState.query,
                                  searchFilter:
                                    filterStatus?.activeFilters || {},
                                  fullSearchStates:
                                    searchState.query +
                                    " || " +
                                    Object.entries(
                                      filterStatus?.activeFilters || {}
                                    )
                                      .map(([key, value]) => `${key}: ${value}`)
                                      .join(" || "),
                                },
                              });
                            }
                            return null;
                          } catch (error) {
                            console.error("Analytics error:", error);
                            return null;
                          }
                        })()}
                      </Box>
                      <Box className="mb-[0.75em] text-center sm:text-left">
                        <div className="text-s">{noResultMessage}</div>
                      </Box>
                      {(noResultScenario === "query_and_filters" ||
                        noResultScenario === "filters_only") && (
                        <Box className="mb-[0.75em]">
                          <button
                            type="button"
                            onClick={handleClearFilters}
                            style={{
                              border: "none",
                              background: "transparent",
                              color: fullConfig.theme.colors["frenchviolet"],
                              fontFamily: fullConfig.theme.fontFamily["sans"],
                              fontWeight: 800,
                              cursor: "pointer",
                              padding: "0",
                              fontSize: "0.875rem",
                            }}
                          >
                            Clear all filters
                          </button>
                        </Box>
                      )}
                      {noResultScenario === "query_only" && (
                        <>
                          <Box className="mb-[0.75em]">
                            <div className="text-s">Or try these popular themes instead?</div>
                          </Box>
                          {isLoadingFallbackThemes ? (
                            <div className="text-s text-gray-600">
                              Finding suggestions...
                            </div>
                          ) : (
                            <Box className="flex flex-row flex-wrap gap-4">
                              {fallbackThemes.map((theme) => (
                                <IconTag
                                  key={`fallback-theme-${theme}`}
                                  themeOnly={true}
                                  svgIcon={IconMatch(theme)}
                                  label={theme}
                                  labelClass={`text-s font-normal ${fullConfig.theme.fontFamily["sans"]}`}
                                  labelColor={
                                    fullConfig.theme.colors["almostblack"]
                                  }
                                  roundBackground={true}
                                />
                              ))}
                            </Box>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </Fade>
        </div>
      </span>
    </div>
  );
};

export default ResultsPanel;
