import * as React from "react";
import tailwindConfig from "../../../../tailwind.config";
import resolveConfig from "tailwindcss/resolveConfig";
import { SolrObject } from "../../../../meta/interface/SolrObject";
import SubdirectoryArrowRightIcon from "@mui/icons-material/SubdirectoryArrowRight";
import PublicIcon from "@mui/icons-material/Public";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { Tooltip } from "@mui/material";
import GeographicLevel from "./geographicLevel";

interface Props {
  resultItem: SolrObject;
}
const fullConfig = resolveConfig(tailwindConfig);
const introCardStyle: React.CSSProperties = {
  color: `${fullConfig.theme.colors["almostblack"]}`,
  fontFamily: `${fullConfig.theme.fontFamily["sans"]}`,
  fontWeight: 400,
  fontSize: "1rem",
  lineHeight: 1.6,
};

const accessTooltipSx = {
  backgroundColor: fullConfig.theme.colors["lightbisque"],
  color: fullConfig.theme.colors["almostblack"],
  border: `1px solid ${fullConfig.theme.colors["strongorange"]}`,
  borderRadius: "0.375rem",
  fontFamily: fullConfig.theme.fontFamily["sans"],
  fontSize: "1rem",
  fontWeight: 400,
  padding: "0.5rem 0.875rem",
  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.08)",
};
const accessTooltipArrowSx = {
  color: fullConfig.theme.colors["lightbisque"],
  "&::before": { border: `1px solid ${fullConfig.theme.colors["strongorange"]}` },
};

const toList = (value?: string | string[]): string[] =>
  !value ? [] : Array.isArray(value) ? value : [value];

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="mb-4" style={introCardStyle}>
    <b>{label}</b>: {children}
  </div>
);

const yearRange = (years: string[]): string => {
  const nums = years.map(Number).filter((y) => !isNaN(y));
  if (nums.length === 0) return years.join(", ");
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  return min === max ? `${min}` : `${min} - ${max}`;
};

const IntroCard = (props: Props): JSX.Element => {
  const { resultItem } = props;
  const resourceClass = toList(resultItem.resource_class);
  const resourceType = toList(resultItem.meta.resource_type);
  const format = toList(resultItem.meta.format).join(", ");
  const fileSize = resultItem.meta.file_size;
  const keyword = toList(resultItem.meta.keyword);
  const years = toList(resultItem.index_year);
  const access = toList(resultItem.access_rights).join(", ");
  const isPublic = access.toLowerCase() === "public";
  const spatialResolution = toList(resultItem.meta.spatial_resolution);

  return (
    <div className={`container mx-auto shadow-none aspect-ratio`}>
      <div className="flex flex-col sm:flex-row border-0 border-t border-solid border-strongorange pt-6 gap-x-8">
        <div className="flex-1 w-full sm:w-1/2">
          {resourceClass.length > 0 && (
            <div className="mb-4" style={introCardStyle}>
              <b>Resource Type</b>: {resourceClass.join(", ")}
              {resourceType.length > 0 && (
                <div className="flex items-start gap-2 mt-1 ml-1">
                  <SubdirectoryArrowRightIcon
                    fontSize="small"
                    className="mt-0.5"
                    style={{ color: fullConfig.theme.colors["strongorange"] }}
                  />
                  <span>{resourceType.join(", ")}</span>
                </div>
              )}
            </div>
          )}
          {format && (
            <Field label="File">
              {format}
              {fileSize ? ` (${fileSize})` : ""}
            </Field>
          )}
          {keyword.length > 0 && <Field label="Topics">{keyword.join(", ")}</Field>}
          {resultItem.creator?.length > 0 && (
            <Field label="Creator">{resultItem.creator.join(", ")}</Field>
          )}
          {resultItem.meta.publisher && (
            <Field label="Publisher">{resultItem.meta.publisher}</Field>
          )}
        </div>
        <div className="flex-1 w-full sm:w-1/2">
          {years.length > 0 && <Field label="Year">{yearRange(years)}</Field>}
          {access && (
            <Field label="Access">
              {isPublic ? (
                <Tooltip
                  title="Like all resources here :)"
                  placement="top"
                  arrow
                  slotProps={{ tooltip: { sx: accessTooltipSx }, arrow: { sx: accessTooltipArrowSx } }}
                >
                  <span className="inline-flex items-center gap-1 align-middle cursor-default">
                    <PublicIcon fontSize="small" style={{ color: fullConfig.theme.colors["strongorange"] }} />
                    Public &amp; Free
                  </span>
                </Tooltip>
              ) : (
                <span className="inline-flex items-center gap-1 align-middle">
                  <LockOutlinedIcon fontSize="small" style={{ color: fullConfig.theme.colors["strongorange"] }} />
                  {access}
                </span>
              )}
            </Field>
          )}
          {spatialResolution.length > 0 && (
            <div className="mb-4" style={introCardStyle}>
              <b>Geographic Level</b>: {spatialResolution.join(", ")}
              <GeographicLevel spatialResolution={spatialResolution} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IntroCard;
