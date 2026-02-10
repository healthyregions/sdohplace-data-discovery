import React from "react";
import Tooltip from "@mui/material/Tooltip";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import AdjustOutlinedIcon from "@mui/icons-material/AdjustOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import { makeStyles } from "@mui/styles";

type Props = {
  props: any;
  overlayKey?: string;
  overlayColor?: string;
  overlayDescription?: string;
  fullConfig?: any;
};

const useStyles = (fullConfig: any) =>
  makeStyles({
    container: {
      fontFamily: fullConfig?.theme?.fontFamily?.["sans"] || "Nunito, sans-serif",
      maxWidth: 440,
      minWidth: 320,
      borderRadius: 8,
      background: fullConfig?.theme?.colors?.["white"] || "white",
      padding: "1rem 1.5rem",
      boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
      fontSize: "0.875rem",
      color: fullConfig?.theme?.colors?.["almostblack"] || "rgb(55, 65, 81)",
      "@media (max-width: 640px)": {
        maxWidth: 280,
        minWidth: 200,
        padding: "0.75rem 1rem",
      },
    },
    header: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
    },
    headerContent: {
      display: "flex",
      flexDirection: "column",
    },
    name: {
      fontWeight: 600,
      color: fullConfig?.theme?.colors?.["almostblack"] || "rgb(55, 65, 81)",
      fontSize: "0.875rem",
    },
    typeRow: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginTop: 4,
      color: fullConfig?.theme?.colors?.["darkgray"] || "#6B7280",
      fontSize: "0.875rem",
    },
    divider: {
      height: 1,
      background: fullConfig?.theme?.colors?.["lightbisque"] || "#FFE5C4",
      margin: "1rem 0",
      borderRadius: 2,
    },
    infoRow: {
      display: "flex",
      gap: 8,
      alignItems: "flex-start",
    },
    iconWrapper: {
      flex: "0 0 18px",
    },
    confidenceRow: {
      display: "flex",
      gap: 8,
      alignItems: "center",
      marginTop: 8,
      fontSize: "0.875rem",
    },
    confidenceIcon: {
      flex: "0 0 16px",
    },
    text: {
      color: fullConfig?.theme?.colors?.["almostblack"] || "rgb(55, 65, 81)",
      fontSize: "0.875rem",
    },
  });

const getName = (props: any) =>
  props.name || props.NAME || props.title || props.label || "Untitled";

const getType = (props: any) =>
  props.type || props.category || props.TYPE || props.subtype || "";

const getAddress = (props: any) =>
  props.address || props.ADDRESS || props.formatted_address || props.display || "";

const getAccuracy = (props: any) => {
  const v = getRawAccuracy(props);
  return formatPercentValue(v);
};

const getRawAccuracy = (props: any) =>
  props.accuracy ||
  props.match_score ||
  props.score ||
  props.confidence ||
  props.accuracy_pct;

const formatPercentValue = (value: unknown) => {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number" && Number.isFinite(value)) {
    const percent = value >= 0 && value <= 1 ? value * 100 : value;
    return `${Math.round(percent)}%`;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const isPercentString = trimmed.endsWith("%");
    const numeric = Number(isPercentString ? trimmed.slice(0, -1) : trimmed);
    if (Number.isFinite(numeric)) {
      const percent =
        isPercentString || numeric > 1 || numeric < 0 ? numeric : numeric * 100;
      return `${Math.round(percent)}%`;
    }
    return trimmed;
  }
  return null;
};

export function assetPopupHTML(props: any, fullConfig?: any) {
  const name = getName(props);
  const type = getType(props);
  const address = getAddress(props);
  const accuracy = getAccuracy(props);

  const fontFamily = fullConfig?.theme?.fontFamily?.["sans"] || "Nunito, sans-serif";
  const white = fullConfig?.theme?.colors?.["white"] || "white";
  const textColor = fullConfig?.theme?.colors?.["almostblack"] || "#374151";
  const subtleColor = fullConfig?.theme?.colors?.["darkgray"] || "#6B7280";
  const dividerColor = fullConfig?.theme?.colors?.["lightbisque"] || "#F8EDE2";
  const accentColor = fullConfig?.theme?.colors?.["salmonpink"] || "#FF9C77";
  const pinColor = fullConfig?.theme?.colors?.["frenchviolet"] || "#7FB3FF";
  const borderColor = fullConfig?.theme?.colors?.["frenchviolet"] || "#59B0FF";
  const lightBg = fullConfig?.theme?.colors?.["lightviolet"] || "#E6F4FF";

  const svgDot = `<svg width="10" height="10" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg"><circle cx="5" cy="5" r="5" fill="${pinColor}"/></svg>`;
  const svgBook = `<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="${accentColor}" d="M3 6a2 2 0 0 1 2-2h12v14H5a2 2 0 0 1-2-2V6z"/></svg>`;
  const svgTarget = `<svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="${accentColor}" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 4a6 6 0 1 1 0 12 6 6 0 0 1 0-12z"/></svg>`;

  return `
    <div style="font-family:${fontFamily}; max-width:320px; border-radius:8px; background:${white}; padding:12px; box-shadow:0 6px 18px rgba(0,0,0,0.08); border:2px solid ${borderColor}">
      <div style="display:flex; align-items:center; justify-content:space-between; gap:8px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <div style="width:10px; height:10px;">${svgDot}</div>
          <div style="font-weight:700; color:${textColor}; font-size:16px;">${name}</div>
        </div>
        <div style="width:20px; height:20px; border-radius:9999px; background:${white}; display:flex; align-items:center; justify-content:center;">
          <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="${lightBg}"/></svg>
        </div>
      </div>
      <div style="color:${subtleColor}; margin-top:4px; font-size:13px;">${type}</div>
      <div style="height:1px; background:${dividerColor}; margin:10px 0; border-radius:2px;"></div>
      <div style="display:flex; gap:8px; align-items:flex-start;">
        <div style="flex:0 0 18px;">${svgBook}</div>
        <div style="color:${textColor}; font-size:13px;">${address}</div>
      </div>
      ${accuracy ? `<div style="display:flex; gap:8px; align-items:center; margin-top:8px; color:${textColor}; font-size:13px;"><div style="flex:0 0 16px">${svgTarget}</div><div>${accuracy} accuracy</div></div>` : ""}
    </div>
  `;
}

export default function AssetPopupComponent({
  props,
  overlayKey,
  overlayColor,
  overlayDescription,
  fullConfig,
}: Props) {
  const classes = useStyles(fullConfig)();

  const name = getName(props);
  const type = getType(props);
  const address = getAddress(props);
  const raw = getRawAccuracy(props);
  const formatted = formatPercentValue(raw);
  const confidence = formatted ? `${formatted} confidence` : null;

  const displayType = type || "info not available";
  const displayAddress = address || "info not available";
  const displayConfidence = confidence || "info not available";

  const pinColor =
    overlayColor || fullConfig?.theme?.colors?.["salmonpink"] || "#7FB3FF";
  const accentColor = fullConfig?.theme?.colors?.["salmonpink"] || "#FF9C77";
  const infoColor = fullConfig?.theme?.colors?.["frenchviolet"] || "#5D3A9B";
  const salmonpink = fullConfig?.theme?.colors?.["salmonpink"] || "#FF9C77";
  const lightbisque = fullConfig?.theme?.colors?.["lightbisque"] || "#FFE5C4";

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <div className={classes.headerContent}>
          <div className={classes.name}>{name}</div>
          <div className={classes.typeRow}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 10,
                background: pinColor,
              }}
            />
            <div>{displayType}</div>
          </div>
        </div>
        <div className="hidden sm:block">
          <Tooltip
            title={
              overlayKey && overlayDescription
                ? `${overlayKey}: ${overlayDescription}`
                : overlayDescription || ""
            }
            slotProps={{
              popper: {
                sx: { zIndex: 999999 },
              },
              tooltip: {
                sx: {
                  backgroundColor: lightbisque,
                  border: `1px solid ${salmonpink}`,
                  color: "rgb(55, 65, 81)",
                },
              },
            }}
          >
            <InfoOutlinedIcon sx={{ color: infoColor }} />
          </Tooltip>
        </div>
      </div>
      <div className={classes.divider} />
      <div className={classes.infoRow}>
        <div className={classes.iconWrapper}>
          <MapOutlinedIcon fontSize="small" sx={{ color: accentColor }} />
        </div>
        <div className={classes.text}>{displayAddress}</div>
      </div>
      <div className={classes.confidenceRow}>
        <div className={classes.confidenceIcon}>
          <AdjustOutlinedIcon fontSize="small" sx={{ color: accentColor }} />
        </div>
        <div className={classes.text}>{displayConfidence}</div>
      </div>
    </div>
  );
}
