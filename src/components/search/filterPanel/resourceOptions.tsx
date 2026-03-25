import { Box } from "@mui/material";
import tailwindConfig from "../../../../tailwind.config";
import resolveConfig from "tailwindcss/resolveConfig";
import { AppDispatch, RootState } from "@/store";
import { setResource } from "@/store/slices/searchSlice";
import { useDispatch, useSelector } from "react-redux";

const fullConfig = resolveConfig(tailwindConfig);

const resourceOptions = [
  { value: "Websites", label: "Websites" },
  { value: "Datasets", label: "Datasets" },
  { value: "Maps", label: "Maps" },
  { value: "Web services", label: "Web services" },
  { value: "Collections", label: "Collections" },
  { value: "Imagery", label: "Imagery" },
];

export const ResourceOptions = (): JSX.Element => {
  const dispatch = useDispatch<AppDispatch>();
  const selectedResources = useSelector((state: RootState) => state.search.resource);
  const handleSelectionChange = (value: string) => {
    const nextValues = selectedResources.includes(value)
      ? selectedResources.filter((resource) => resource !== value)
      : [...selectedResources, value];
    dispatch(setResource(nextValues));
  };

  return (
    <Box className="mt-6">
      <Box className="text-base font-bold" sx={{ mb: 1 }}>
        Resource
      </Box>
      <Box className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3 justify-items-start">
        {resourceOptions.map((option) => {
          const checked = selectedResources.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={checked}
              onClick={() => handleSelectionChange(option.value)}
              className="inline-flex items-center bg-transparent border-none p-0 m-0 text-left whitespace-nowrap"
              style={{ cursor: "pointer" }}
            >
              <span
                style={{
                  borderRadius: "4px",
                  border: `2px solid ${fullConfig.theme.colors["frenchviolet"]}`,
                  width: "20px",
                  height: "20px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: checked
                    ? fullConfig.theme.colors["frenchviolet"]
                    : fullConfig.theme.colors["white"],
                  flexShrink: 0,
                  marginRight: "0.75rem",
                }}
              >
                {checked && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ width: "14px", height: "14px" }}
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </span>
              <span
                style={{
                  color: fullConfig.theme.colors["almostblack"],
                  fontSize: "0.875rem",
                }}
              >
                {option.label}
              </span>
            </button>
          );
        })}
      </Box>
    </Box>
  );
};
