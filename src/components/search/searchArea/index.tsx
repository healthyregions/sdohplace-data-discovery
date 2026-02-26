import * as React from "react";
import { useSelector } from "react-redux";
import { Box, Grid, Collapse } from "@mui/material";
import { SearchUIConfig } from "@/components/searchUIConfig";
import tailwindConfig from "../../../../tailwind.config";
import resolveConfig from "tailwindcss/resolveConfig";
import InfoPanel from "./infoPanel";
import { RootState } from "@/store";
import SpatialResolutionCheck from "./spatialResolutionCheck";
import EnhancedSearchBox from "./enhancedSearch";
import {usePlausible} from "next-plausible";
import {EventType} from "@/lib/event";
import AIHintText from "./AIHintText";
import Image from "next/image";
import MobileHeader from "./MobileHeader";

interface Props {
  header: string;
  schema: any;
}
const fullConfig = resolveConfig(tailwindConfig);
const searchAreaStyle: React.CSSProperties = {
  color: fullConfig.theme.colors["almostblack"],
  fontFamily: fullConfig.theme.fontFamily["sans"],
};

const SearchArea = (props: Props): JSX.Element => {
  const plausible = usePlausible();
  const { showInfoPanel } = useSelector((state: RootState) => state.ui);
  const { aiSearch } = useSelector((state: RootState) => state.search);

  const handleMobileMenuClick = () => {
    const mobileMenuButton = document.querySelector('.block.min-\\[940px\\]\\:hidden') as HTMLElement;
    if (mobileMenuButton) {
      mobileMenuButton.click();
    }
  };

  return (
    <>
      <Grid
        size={12}
        className="min-[940px]:hidden py-4 px-4"
      >
        <MobileHeader title={props.header} onMenuClick={handleMobileMenuClick} />
        <Box className="mt-4" sx={{ position: "relative", zIndex: 3 }}>
          <SpatialResolutionCheck
            src={SearchUIConfig.search.searchBox.spatialResOptions}
            isMobile={true}
          />
        </Box>
        <Box className="mt-4" sx={{ position: "relative", zIndex: 1 }}>
          <EnhancedSearchBox schema={props.schema} isMobile={true} />
        </Box>
      </Grid>

      <Grid
        size={{ xs: 12, sm: 6 }}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          '@media (max-width: 939px)': { display: 'none' }
        }}
        className="py-[2em] sm:px-[1.1em] xs:text-center sm:text-left"
      >
        <Collapse
          className={"relative w-full"}
          in={showInfoPanel}
          timeout={300}
          easing={"linear"}
        >
          <InfoPanel />
        </Collapse>
        <Collapse
          className={"relative w-full"}
          in={!showInfoPanel}
          timeout={300}
          easing={"linear"}
        >
        <div className="flex items-start gap-8">
          <Image
            src="/icons/discovery_logo.svg"
            alt="Data Discovery Logo"
            width={80}
            height={80}
            className="flex-shrink-0"
            style={{ objectFit: "contain" }}
          />
          <div className="flex flex-col min-w-0">
            <h2 className="m-0">{props.header}</h2>
            <div
              className="text-s sm:text-left sm:mt-[1em]"
              style={{ textWrap: "balance" }}
            >
              This platform provides access to spatially indexed and curated
              databases, specifically designed for conducting health equity
              research.{" "}
              <button
                type="button"
                onClick={() => {
                  const target = document.getElementById("sdoh-learn-more");
                  if (target) {
                    target.scrollIntoView({ behavior: "smooth" });
                  }
                  plausible(EventType.ClickedGetStarted);
                }}
                style={{
                  cursor: "pointer",
                  background: "transparent",
                  border: "none",
                  padding: 0,
                  font: "inherit",
                }}
                className="no-underline text-frenchviolet"
              >
                <strong>Get started &rarr;</strong>
              </button>
            </div>
            {aiSearch && <AIHintText />}
          </div>
        </div>
        </Collapse>
      </Grid>
      <Grid
        size={{ xs: 12, sm: 6 }}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          '@media (max-width: 939px)': { display: 'none' }
        }}
        className="py-[2em] px-8 sm:pl-[5rem]"
        style={searchAreaStyle}
      >
          <Box width="100%">
            <Box width="100%" sx={{ position: "relative", zIndex: 3 }}>
              <SpatialResolutionCheck
                src={SearchUIConfig.search.searchBox.spatialResOptions}
              />
            </Box>
            <Box width="100%" className="mt-[2em] sm:mt-0" sx={{ position: "relative", zIndex: 1 }}>
              <EnhancedSearchBox schema={props.schema} />
            </Box>
          </Box>
      </Grid>
    </>
  );
};

export default SearchArea;
