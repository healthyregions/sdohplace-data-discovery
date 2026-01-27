"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Button, Grid, Menu, SvgIcon } from "@mui/material";
import { ArrowDropDown as ArrowDropDownIcon } from "@mui/icons-material";
import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "../../../../tailwind.config";
import dynamic from "next/dynamic";
import { SolrObject } from "meta/interface/SolrObject";
import { AppDispatch, RootState } from "@/store";
import { setSchema } from "@/store/slices/searchSlice";
import { setOverlayIds } from "@/store/slices/mapSlice";
import CommunityAssetsDropdown from "./CommunityAssetsDropdown";
import { localStyles } from "../../../lib/localStyles";
import { SearchUIConfig } from "@/components/searchUIConfig";

const fullConfig = resolveConfig(tailwindConfig);

const DynamicMapArea = dynamic(() => import("../../map/mapArea"), {
  ssr: false,
});

interface Props {
  resultsList: SolrObject[];
  showMap: string;
  schema: any;
  mobileViewMode?: "list" | "map";
  onMobileViewChange?: (mode: "list" | "map") => void;
}

export default function MapPanelContent(props: Props): JSX.Element {
  const dispatch = useDispatch<AppDispatch>();
  const overlayIds = useSelector((state: RootState) => state.map.overlayIds);
  const [overlaysMenuAnchorEl, setOverlaysMenuAnchorEl] = useState<null | HTMLElement>(null);
  const overlaysOpen = Boolean(overlaysMenuAnchorEl);

  useEffect(() => {
    dispatch(setSchema(props.schema));
  }, [dispatch, props.schema]);

  useEffect(() => {
    dispatch(setOverlayIds(overlayIds));
  }, [dispatch, overlayIds]);

  const handleOverlaysClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setOverlaysMenuAnchorEl(event.currentTarget);
  };
  const closeOverlaysMenu = () => setOverlaysMenuAnchorEl(null);
  const toggleOverlay = (overlay: string) => {
    const newOverlays = overlayIds.includes(overlay) ? overlayIds.filter((e) => e !== overlay) : [...overlayIds, overlay];
    dispatch(setOverlayIds(newOverlays));
  };

  return (
    <Grid item className="sm:px-[2em]" xs={12} display={props.showMap}>
      <Box>
        <div className="flex flex-col mb-[0.5em] sm:mb-[1.5em] sm:ml-[1.1em] sm:flex-row items-start sm:items-center">
          <div className="flex flex-col sm:flex-row sm:flex-grow text-2xl sm:mb-0">Map search</div>
          <Button
            id="overlays-button"
            sx={localStyles.overlaysButton}
            aria-controls={overlaysOpen ? "overlays-button" : undefined}
            aria-haspopup="true"
            aria-expanded={overlaysOpen ? "true" : undefined}
            onClick={handleOverlaysClick}
            className="mb-[1rem] sm:mb-0"
          >
            Community assets
            <SvgIcon component={ArrowDropDownIcon} sx={{ color: fullConfig.theme.colors["frenchviolet"], fontSize: 40 }} />
          </Button>
          <Menu
            id="basic-menu"
            anchorEl={overlaysMenuAnchorEl}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            open={overlaysOpen}
            onClose={closeOverlaysMenu}
            PaperProps={{ sx: { boxShadow: "none", borderRadius: "12px" } }}
            MenuListProps={{ "aria-labelledby": "overlays-button", className: "rounded" }}
          >
            <CommunityAssetsDropdown overlayIds={overlayIds} toggleOverlay={toggleOverlay} clearAll={() => dispatch(setOverlayIds([]))} />
          </Menu>
        </div>
      </Box>

      <Box height="100%" sx={{ height: `${SearchUIConfig.search.searchResults.resultListHeight}` }}>
        <DynamicMapArea />
      </Box>

      <Box className="sm:my-[1.68em]">
        <div className="sm:mb-[1.5em] sm:flex-col">
          <Box height="100%" className="sm:mt-[2em] sm:ml-[1.1em]">
            <Box className="text-2xl sm:mb-[0.6em]">Want to learn more about SDOH data?</Box>
            <Box className="text-s sm:mb-[1.5em]">
              <p className="mb-[1em]">
                We have a selection of resource guides available for different SDOH topics, like {" "}
                <a href="https://sdohplace.org/guides/greenspace-access">Greenspace Access</a> and {" "}
                <a href="https://sdohplace.org/guides/transportation-equity">Transportation Equity</a>.
                More guides are in the works! If you would like to collaborate on a research guide, please {" "}
                <a href="https://forms.illinois.edu/sec/1493227735" target="_blank" rel="noreferrer">get in touch</a>.
              </p>
            </Box>
            <Box className="text-2xl sm:mb-[0.6em]">Unsure how to use SDOH data?</Box>
            <Box className="text-s sm:mb-[1.5em]">
              <p className="mb-[1em]">
                Checkout our <a href="https://toolkit.sdohplace.org">Community Toolkit</a> for walkthroughs and examples of how you can use datasets you find in this discovery application in your own research and web applications.
              </p>
            </Box>
          </Box>
        </div>
      </Box>
    </Grid>
  );
}
