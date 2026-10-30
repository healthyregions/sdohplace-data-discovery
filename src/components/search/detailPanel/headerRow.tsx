import * as React from "react";
import tailwindConfig from "../../../../tailwind.config";
import resolveConfig from "tailwindcss/resolveConfig";
import { SolrObject } from "../../../../meta/interface/SolrObject";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import LaunchIcon from "@mui/icons-material/Launch";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import { Button, IconButton, Collapse } from "@mui/material";
import { ParseReferenceLink } from "../helper/ParsingMethods";
import { AppDispatch, RootState } from "@/store";
import { useDispatch, useSelector } from "react-redux";
import { setShowDetailPanel, setShowSharedLink } from "@/store/slices/uiSlice";
import { EventType } from "@/lib/event";
import { usePlausible } from "next-plausible";
import { copyShareCard } from "./shareCard";

interface Props {
  resultItem: SolrObject;
  headerIcon: any;
  isMobileView?: boolean;
  onMobileBackToList?: () => void;
}
const fullConfig = resolveConfig(tailwindConfig);
const introCardStyle: React.CSSProperties = {
  color: `${fullConfig.theme.colors["almostblack"]}`,
  fontFamily: `${fullConfig.theme.fontFamily["sans"]}`,
};
const actionLinkClass =
  "flex items-center gap-1 text-base text-frenchviolet cursor-pointer bg-transparent border-0 p-0 no-underline";

const HeaderRow = (props: Props): JSX.Element => {
  const dispatch = useDispatch<AppDispatch>();
  const plausible = usePlausible();
  const currentShowSharedLink = useSelector(
    (state: RootState) => state.ui.showSharedLink
  );
  const backToMapView = (e) => {
    e.preventDefault();
    dispatch(setShowDetailPanel(null));
    if (props.isMobileView) {
      props.onMobileBackToList?.();
    }
  };

  const [copied, setCopied] = React.useState(false);
  // a fresh share panel (or a different resource) starts uncopied
  React.useEffect(() => {
    setCopied(false);
  }, [currentShowSharedLink, props.resultItem.id]);

  // not reflect shared link in url, only in redux
  const handleShare = () => {
    dispatch(setShowSharedLink(!currentShowSharedLink));
    plausible(EventType.ClickedShareButton, {
      props: {
        resourceId: props.resultItem.id
      }
    });
  };
  const handleCopyShareCard = () => {
    copyShareCard(props.resultItem, window.location.href)
      .then(() => setCopied(true))
      .catch((err) => console.error("Failed to copy share card:", err));
  };
  // get the second items's value as the link to be parsed from the meta.references,
  // e.g. {"http://schema.org/url ": "https://ephtracking.cdc.gov/DataExplorer/#/", "http://lccn.loc.gov/sh85035852": "https://data.cdc.gov/Environmental-Health-Toxicology/Daily-Census-Tract-Level-PM2-5-Concentrations-2011/qjxm-7fny/data_preview"}"
  const links = ParseReferenceLink(props.resultItem.meta.references);
  const resourceUrl = links.homepageUrl || links.downloadUrl || links.dataDictionaryUrl;
  return (
    <div className={`container mx-auto shadow-none aspect-ratio`} style={introCardStyle}>
      <div className="flex mb-5">
        <a
          href="#"
          className="flex items-center gap-2 text-xl text-frenchviolet leading-8"
          onClick={backToMapView}
          style={{ textDecoration: "none" }}
        >
          <ArrowBackIcon fontSize="inherit" />
          {props.isMobileView ? "Back to list" : "Back to Map search"}
        </a>
      </div>
      <div className="flex flex-col sm:flex-row items-start gap-4 pb-6 border-0 border-b border-solid border-lightgray">
        <div className="flex items-start flex-grow">
          <div
            className="flex items-center text-[2em] sm:text-[2.5em] mt-1"
            style={{ color: fullConfig.theme.colors["strongorange"] }}
          >
            {React.cloneElement(props.headerIcon, { fontSize: "inherit" })}
          </div>
          <h1 className="m-0 ml-3 sm:ml-4 font-fredoka font-normal text-2xl sm:text-4xl leading-tight">
            {props.resultItem.title}
          </h1>
        </div>
        <Button
          disableElevation
          variant="contained"
          endIcon={<LaunchIcon />}
          disabled={!resourceUrl}
          onClick={() => {
            if (!resourceUrl) return;
            const resourceWindow = window.open(resourceUrl, "_blank", "noopener,noreferrer");
            resourceWindow?.focus();
            plausible(EventType.ClickedGoToResource, {
              props: {
                resourceId: props.resultItem.id
              }
            });
          }}
          sx={{
            flex: "none",
            whiteSpace: "nowrap",
            textTransform: "none",
            borderRadius: "0.25rem",
            backgroundColor: `${fullConfig.theme.colors["frenchviolet"]} !important`,
            color: "white !important",
            fontFamily: fullConfig.theme.fontFamily["sans"],
            fontSize: "1rem",
            fontWeight: 400,
            padding: "0.5rem 1rem",
            "&.Mui-disabled": { opacity: 0.6 },
          }}
        >
          Go to Resource
        </Button>
      </div>
      <Collapse
        className={"relative w-full"}
        in={currentShowSharedLink}
        timeout={150}
        easing={"linear"}
      >
        <div
          className="flex items-center gap-4 px-4 py-4 bg-lightbisque border-0 border-t-2 border-solid border-strongorange rounded-b-lg"
        >
          <IconButton
            aria-label="Close share link"
            className="self-start"
            sx={{
              padding: 0,
              color: fullConfig.theme.colors["frenchviolet"],
              "&:hover": { backgroundColor: "transparent" },
            }}
            onClick={() => dispatch(setShowSharedLink(false))}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
          <div className="flex-1 min-w-0">
            <p className="m-0 mb-1 font-bold">
              {copied ? "Copied to clipboard:" : "Share link:"}
            </p>
            <p className="m-0" style={{ overflowWrap: "anywhere", lineHeight: "1.4" }}>
              {window.location.href}
            </p>
          </div>
          <IconButton
            aria-label={copied ? "Share link copied" : "Copy share link"}
            onClick={handleCopyShareCard}
            sx={{
              flex: "none",
              width: "2.5rem",
              height: "2.5rem",
              border: copied ? "none" : `1px solid ${fullConfig.theme.colors["frenchviolet"]}`,
              backgroundColor: copied ? fullConfig.theme.colors["strongorange"] : "white",
              color: copied ? "white" : fullConfig.theme.colors["frenchviolet"],
              "&:hover": {
                backgroundColor: copied ? fullConfig.theme.colors["strongorange"] : "white",
              },
            }}
          >
            {copied ? <CheckIcon /> : <ContentCopyIcon fontSize="small" />}
          </IconButton>
        </div>
      </Collapse>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 mb-6">
        <button type="button" className={actionLinkClass} onClick={handleShare}>
          <ShareOutlinedIcon fontSize="small" />
          Share
        </button>
        {links.archiveUrl && (
          <a
            className={actionLinkClass}
            href={String(links.archiveUrl)}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "none" }}
          >
            <ArchiveOutlinedIcon fontSize="small" />
            Resource unavailable? Access Archive
            <LaunchIcon sx={{ fontSize: "1rem" }} />
          </a>
        )}
      </div>
      {props.resultItem.description.length > 0 && (
        <div className="flex flex-col">
          {props.resultItem.description.map((description, index) => {
            return <p
              key={index}
              className="m-0 text-base leading-relaxed mb-2"
            >{description}
            </p>
          })}
        </div>
      )}
    </div>
  );
};
export default HeaderRow;
