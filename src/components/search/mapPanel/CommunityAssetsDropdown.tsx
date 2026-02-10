import React from "react";
import {
  MenuList,
  MenuItem,
  ListItemIcon,
  IconButton,
  Box,
  Divider,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import VerticalAlignBottomIcon from "@mui/icons-material/VerticalAlignBottom";
import Checkbox from "@mui/material/Checkbox";
import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "../../../../tailwind.config";
import { overlayRegistry } from "@/components/map/helper/layers";

const fullConfig = resolveConfig(tailwindConfig as any);

interface Props {
  overlayIds: string[];
  toggleOverlay: (overlay: string) => void;
  clearAll: () => void;
}

const CommunityAssetsDropdown: React.FC<Props> = ({
  overlayIds,
  toggleOverlay,
  clearAll,
}) => {
  const handleDownload = (key: string) => {
    const entry = overlayRegistry[key];
    if (!entry) return;
    const urlSpec = entry.source?.spec?.url || "";
    const cleanedUrl = urlSpec.replace(/^pmtiles:\/\//, "");
    const fileName = cleanedUrl.split("/").pop() || "";
    const csvName = fileName.replace(/\.pmtiles$/i, ".csv");
    const downloadUrl = `https://raw.githubusercontent.com/healthyregions/overture-poi-extract/discovery-asset/output/${csvName}`;
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.click();
  };

  return (
    <MenuList
      sx={{
        background: "white",
        borderRadius: "12px",
        p: 0,
        fontFamily: "Nunito, sans-serif",
        minWidth: 300,
      }}
    >
      {Object.keys(overlayRegistry).map((overlay) => {
        const checked = overlayIds.includes(overlay);
        const color = overlayRegistry[overlay].mainColor || "#CCCCCC";
        return (
          <MenuItem
            key={overlay}
            sx={{ display: "flex", alignItems: "center", gap: 1, px: 2, py: 0 }}
          >
            <ListItemIcon sx={{ minWidth: 44 }}>
              <Checkbox
                checked={checked}
                onChange={() => toggleOverlay(overlay)}
                sx={{
                  color: fullConfig.theme.colors["frenchviolet"],
                  "&.Mui-checked": {
                    color: fullConfig.theme.colors["frenchviolet"],
                  },
                }}
                icon={
                  <span
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 6,
                      border: `2px solid ${fullConfig.theme.colors["frenchviolet"]}`,
                    }}
                  />
                }
                checkedIcon={
                  <span
                    style={{
                      width: 20,
                      height: 20,
                      background: fullConfig.theme.colors["frenchviolet"],
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      borderRadius: 6,
                    }}
                  >
                    <CheckIcon sx={{ fontSize: 14 }} />
                  </span>
                }
              />
            </ListItemIcon>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flexGrow: 1,
                gap: 1,
              }}
            >
              <svg height="12" width="12" xmlns="http://www.w3.org/2000/svg">
                <circle r="5" cx="6" cy="6" fill={color} />
              </svg>
              <span style={{ fontFamily: "Nunito, sans-serif" }}>
                {overlay}
              </span>
            </Box>
            <IconButton size="small" onClick={() => handleDownload(overlay)}>
              <VerticalAlignBottomIcon
                sx={{ color: fullConfig.theme.colors["frenchviolet"] }}
              />
            </IconButton>
          </MenuItem>
        );
      })}
      <Divider sx={{ my: 1, borderColor: "#E6E6E6" }} />
      <MenuItem
        onClick={clearAll}
        sx={{
          justifyContent: "flex-start",
          color: fullConfig.theme.colors["frenchviolet"],
          fontWeight: 700,
          px: 2,
          py: 0,
        }}
      >
        {/* <ListItemIcon sx={{ minWidth: 44 }} /> */}
        <span style={{ fontFamily: "Nunito, sans-serif", paddingLeft: "0.75em" }}>Clear all</span>
      </MenuItem>
    </MenuList>
  );
};

export default CommunityAssetsDropdown;
