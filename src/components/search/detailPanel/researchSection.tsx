import * as React from "react";
import Image from "next/image";
import tailwindConfig from "../../../../tailwind.config";
import resolveConfig from "tailwindcss/resolveConfig";
import { SolrObject } from "../../../../meta/interface/SolrObject";
import LaunchIcon from "@mui/icons-material/Launch";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import { IconButton } from "@mui/material";

interface Props {
  resultItem: SolrObject;
}
const fullConfig = resolveConfig(tailwindConfig);
const sectionStyle: React.CSSProperties = {
  color: `${fullConfig.theme.colors["almostblack"]}`,
  fontFamily: `${fullConfig.theme.fontFamily["sans"]}`,
  fontSize: "1rem",
};
const linkClass = "inline-flex items-center gap-1 text-frenchviolet no-underline";

// subject (theme) -> SDOH & Place research guide covering it, see https://sdohplace.org/guides
const researchGuides: Record<string, string> = {
  "Food Environment": "https://sdohplace.org/guides/measuring-food-access-on-a-neighborhood-level",
  "Neighborhood and Built Environment": "https://sdohplace.org/guides/greenspace-access",
  "Greenspaces": "https://sdohplace.org/guides/greenspace-access",
  "Health and Healthcare": "https://sdohplace.org/guides/conceptualizing-healthcare-equity",
  "Employment": "https://sdohplace.org/guides/employment-by-occupation-and-industry-research-guide",
  "Economic Stability": "https://sdohplace.org/guides/area-deprivation-indexes",
  "Transportation and Infrastructure": "https://sdohplace.org/guides/public-transit-equity",
};

const ExternalLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
    {children}
    <LaunchIcon sx={{ fontSize: "1rem" }} />
  </a>
);

const ResearchSection = (props: Props): JSX.Element => {
  const { resultItem } = props;
  const [copied, setCopied] = React.useState(false);
  const guides = (resultItem.meta.subject || []).filter((s) => researchGuides[s]);
  const citation = resultItem.meta.preferred_citation;
  const scholarUrl = `https://scholar.google.com/scholar?q=${encodeURIComponent(resultItem.title)}`;

  const handleCopyCitation = () => {
    navigator.clipboard
      ?.writeText(citation)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => console.error("Failed to copy citation:", err));
  };

  return (
    <div
      className="container border-0 border-t border-solid border-strongorange pt-6 mt-6"
      id="researchRow"
      style={sectionStyle}
    >
      <h2 className="m-0 mb-6 font-fredoka font-normal text-2xl">Research</h2>
      {guides.length > 0 && (
        <div className="mb-6">
          <p className="m-0">
            Visit <b>Research Guides</b> to learn more in this resource:
          </p>
          <p className="m-0">
            {guides.map((s, index) => (
              <React.Fragment key={s}>
                {index > 0 && (index === guides.length - 1 ? " and " : ", ")}
                <ExternalLink href={researchGuides[s]}>{s}</ExternalLink>
              </React.Fragment>
            ))}
          </p>
        </div>
      )}
      {citation && (
        <div className="flex items-center gap-4 mb-6 p-4 sm:p-6 bg-lightbisque rounded">
          <div className="flex-1 min-w-0">
            <p className="m-0 mb-2 font-bold">Suggested Citation:</p>
            <p className="m-0 text-s" style={{ overflowWrap: "anywhere" }}>
              {citation}
            </p>
          </div>
          <IconButton
            aria-label={copied ? "Citation copied" : "Copy citation"}
            onClick={handleCopyCitation}
            sx={{
              flex: "none",
              border: `1px solid ${fullConfig.theme.colors["frenchviolet"]}`,
              color: fullConfig.theme.colors["frenchviolet"],
              backgroundColor: "white",
              "&:hover": { backgroundColor: "white" },
            }}
          >
            {copied ? <CheckIcon /> : <ContentCopyIcon />}
          </IconButton>
        </div>
      )}
      <div className="sm:px-6">
        <p className="m-0 mb-2 text-s">Search related Research Papers:</p>
        <Image
          src="/logos/research/google-scholar.png"
          alt="Google Scholar"
          width={161}
          height={28}
        />
        <div className="ml-10 mt-1 text-s">
          <ExternalLink href={scholarUrl}>Access</ExternalLink>
        </div>
      </div>
    </div>
  );
};

export default ResearchSection;
