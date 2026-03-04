"use client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import { Collapse, Grid } from "@mui/material";
import SearchArea from "./searchArea";
import DetailPanel from "./detailPanel";
import { initializeSearch, setSchema } from "@/store/slices/searchSlice";
import MapPanel from "./mapPanel";
import dynamic from "next/dynamic";
import MapListToggle from "./mapPanel/MapListToggle";
import * as React from "react";
import styled from "@emotion/styled";

const BannerLink = styled.a`
  margin-left: 0.25rem;
  :link { text-decoration: none; }
  :visited { text-decoration: none; }
  :hover { text-decoration: underline; }
  :active { text-decoration: underline; }
`;

const Banner = styled.div`
  font-size: 14px;
`;

const DynamicResultsPanel = dynamic(() => import("./resultsPanel"), {
  ssr: false,
  loading: () => (
    <Grid container className="h-full">
      <Grid size={12}>
        <div className="h-full w-full bg-gray-100 animate-pulse" />
      </Grid>
    </Grid>
  ),
});

export default function DiscoveryArea({ schema }): JSX.Element {
  const dispatch = useDispatch<AppDispatch>();
  const { showDetailPanel } = useSelector((state: RootState) => state.ui);
  const { results, relatedResults, yearBounds } = useSelector(
    (state: RootState) => state.search
  );
  const [isMounted, setIsMounted] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [mobileViewMode, setMobileViewMode] = useState<"list" | "map">("list");
  useEffect(() => {
    if (
      isMounted &&
      typeof window !== "undefined" &&
      !yearBounds?.isInitialized
    )
      dispatch(initializeSearch({ schema }));
  }, [schema, dispatch, isMounted, yearBounds?.isInitialized]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && typeof window !== "undefined") {
      const check = () => setIsMobileView(window.innerWidth < 640);
      check();
      window.addEventListener("resize", check);
      return () => window.removeEventListener("resize", check);
    }
  }, [isMounted]);

  useEffect(() => {
    if (isMobileView && showDetailPanel && showDetailPanel.length > 0) {
      setMobileViewMode("map");
    }
  }, [isMobileView, showDetailPanel]);

  if (!isMounted) {
    return (
      <Grid container>
        <Grid
          size={12}
          className="w-full px-[1em] sm:px-[2em] sm:mt-32 max-md:max-w-full shadow-none aspect-ratio bg-lightviolet"
        >
          <div className="h-full w-full bg-gray-100 animate-pulse" />
        </Grid>
      </Grid>
    );
  }
  return (
    <Grid container>
      <Grid
        size={12}
        className="w-full px-[1em] sm:px-[2em] sm:mt-32 max-md:max-w-full shadow-none aspect-ratio bg-lightviolet"
      >
        <Grid container className="container mx-auto pt-[2em] sm:pt-0">
          <SearchArea schema={schema} header="Data Discovery" />
        </Grid>
      </Grid>

      <Grid
        size={12}
        className="w-full px-[1em] sm:px-[2em] max-md:max-w-full shadow-none aspect-ratio"
      >
        <Grid container className="container mx-auto py-[1em] px-4">
          <Banner>
            This platform is under development, feel free to
            <BannerLink href={'https://go.illinois.edu/data-discovery-feedback-form'} target={'_blank'}>share your feedback &rarr;</BannerLink>
          </Banner>
        </Grid>
      </Grid>

      <Grid
        size={12}
        className="w-full px-[1em] sm:px-[2em] transition-all duration-300"
      >
        <div className="block sm:px-4 sm:mb-4 sm:hidden container mx-auto ">
          <MapListToggle value={mobileViewMode} onChange={(m) => setMobileViewMode(m)} />
        </div>
        <Grid
          container
          className="container mx-auto pt-[1.5rem]"
          columnSpacing={{ xs: 0, sm: 2 }}
          sx={{ alignItems: "flex-start" }}
        >
          <Grid size={{ xs: 12, sm: 6 }}>
            {(!isMobileView || mobileViewMode === "list") && (
              <DynamicResultsPanel schema={schema} />
            )}
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            {(!isMobileView || mobileViewMode === "map") && (
              <>
                <MapPanel
                  resultsList={results}
                  showMap={
                    showDetailPanel && (results && results.find((r) => r.id === showDetailPanel))
                      ? "none"
                      : "block"
                  }
                  schema={schema}
                  mobileViewMode={mobileViewMode}
                  onMobileViewChange={(m) => setMobileViewMode(m)}
                />
                {showDetailPanel && showDetailPanel.length > 0 && (
                  <DetailPanel
                    resultList={results}
                    relatedList={relatedResults}
                    isMobileView={isMobileView}
                    onMobileBackToList={() => setMobileViewMode("list")}
                  />
                )}
              </>
            )}
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
