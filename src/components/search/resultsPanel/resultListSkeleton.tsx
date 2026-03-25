"use client";
import * as React from "react";
import { Box, Skeleton } from "@mui/material";
import tailwindConfig from "../../../../tailwind.config";
import resolveConfig from "tailwindcss/resolveConfig";

interface Props {
  count?: number;
}

const fullConfig = resolveConfig(tailwindConfig);

const skeletonLineSx = {
  bgcolor: fullConfig.theme.colors["strongbisque"],
};

const ResultListSkeleton = ({ count = 16 }: Props): JSX.Element => {
  const normalizedCount = Math.min(Math.max(count, 3), 6);
  const items = React.useMemo(
    () => Array.from({ length: normalizedCount }, (_, index) => index),
    [normalizedCount]
  );

  return (
    <Box
      height="100%"
      sx={{
        overflowY: "scroll",
        paddingRight: "1.25em",
        maxHeight: "100vh",
      }}
    >
      {items.map((item) => (
        <Box
          key={item}
          sx={{
            mb: "0.75em",
            p: "0.75rem",
            borderRadius: "0.5rem",
            border: "1px solid transparent",
            backgroundColor: fullConfig.theme.colors["lightbisque"],
          }}
        >
          <Box className="px-2">
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "0.75rem",
              }}
            >
              <Skeleton variant="text" width={72} height={24} animation="wave" sx={skeletonLineSx} />
            </Box>
          </Box>
          <Box
            sx={{
              mt: "1rem",
              px: "0.5rem",
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: "1rem",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ width: { xs: "100%", sm: "62%" } }}>
              <Skeleton variant="text" width="88%" height={24} animation="wave" sx={skeletonLineSx} />
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default ResultListSkeleton;
