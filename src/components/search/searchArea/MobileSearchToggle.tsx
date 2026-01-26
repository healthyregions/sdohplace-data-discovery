import * as React from "react";
import LightbulbOutlined from "@mui/icons-material/LightbulbOutlined";
import { Box } from "@mui/material";
import tailwindConfig from "../../../../tailwind.config";
import resolveConfig from "tailwindcss/resolveConfig";

const fullConfig = resolveConfig(tailwindConfig);

interface MobileSearchToggleProps {
  aiSearch: boolean;
  disabled: boolean;
  onToggle: () => void;
}

const MobileSearchToggle: React.FC<MobileSearchToggleProps> = ({
  aiSearch,
  disabled,
  onToggle,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
      }}
      onClick={disabled ? undefined : onToggle}
    >
      <Box
        sx={{
          fontSize: "0.75rem",
          fontWeight: 600,
          color: !aiSearch
            ? fullConfig.theme.colors["frenchviolet"]
            : fullConfig.theme.colors["smokegray"],
          transition: "color 0.3s ease-in-out",
          mr: "0.35rem",
        }}
      >
        Keyword
      </Box>
      <Box
        sx={{
          position: "relative",
          width: "2.5rem",
          height: "1.25rem",
          display: "flex",
          alignItems: "center",
          backgroundColor: "#AAAAAA",
          borderRadius: "0.625rem",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            left: !aiSearch ? "0" : "calc(100% - 1.25rem)",
            width: "1.25rem",
            height: "1.25rem",
            backgroundColor: fullConfig.theme.colors["frenchviolet"],
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "left 0.3s ease-in-out",
            boxShadow: "0 0.125rem 0.25rem rgba(0, 0, 0, 0.2)",
          }}
        >
          <LightbulbOutlined
            sx={{
              color: "white",
              fontSize: "0.875rem",
            }}
          />
        </Box>
      </Box>
      <Box
        sx={{
          fontSize: "0.75rem",
          fontWeight: 600,
          color: aiSearch
            ? fullConfig.theme.colors["frenchviolet"]
            : fullConfig.theme.colors["smokegray"],
          transition: "color 0.3s ease-in-out",
          ml: "0.35rem",
        }}
      >
        Ask
      </Box>
    </Box>
  );
};

export default MobileSearchToggle;
