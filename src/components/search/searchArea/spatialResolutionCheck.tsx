import * as React from "react";
import { Checkbox } from "@mui/material";
import tailwindConfig from "tailwind.config";
import resolveConfig from "tailwindcss/resolveConfig";
import { RootState, AppDispatch } from "@/store";
import { setSpatialResolution } from "@/store/slices/searchSlice";
import { useDispatch, useSelector } from "react-redux";
import { usePlausible } from "next-plausible";
import { EventType } from "@/lib/event";

interface SpatialResolutionCheck {
  value: string;
  display_name: string;
}
interface Props {
  src: SpatialResolutionCheck[];
  isMobile?: boolean;
}
const fullConfig = resolveConfig(tailwindConfig);

const SpatialResolutionCheck = (props: Props): JSX.Element => {
  const dispatch = useDispatch<AppDispatch>();
  const plausible = usePlausible();
  const spatialResolution = useSelector(
    (state: RootState) => state.search.spatialResolution
  );
  const isSearching = useSelector(
    (state: RootState) => state.search.isSearching
  );

  const normalizeValue = (value: string) => value.toString().trim();
  const selectedValues = spatialResolution || [];
  const selectedSet = React.useMemo(
    () => new Set(selectedValues.map((value) => normalizeValue(value))),
    [selectedValues]
  );

  const handleSelectionChange = (value: string, checked: boolean) => {
    if (isSearching) return;

    const normalized = normalizeValue(value);
    let nextSelectedValues: string[];

    if (checked) {
      nextSelectedValues = selectedSet.has(normalized)
        ? selectedValues
        : [...selectedValues, normalized];
    } else {
      nextSelectedValues = selectedValues.filter(
        (selected) => normalizeValue(selected) !== normalized
      );
    }

    dispatch(setSpatialResolution(nextSelectedValues));

    plausible(EventType.ChangedSpatialResolution, {
      props: {
        spatialResolution: nextSelectedValues.join(", "),
      },
    });
  };

  const checkboxSize = props.isMobile ? "18px" : "24px";
  const checkmarkSize = props.isMobile ? "12px" : "16px";

  const renderCheckbox = (value: string, displayName: string, index: number) => {
    const checked = selectedSet.has(normalizeValue(value));
    return (
      <div
        key={`${value}-${index}`}
        className={`flex items-center ${props.isMobile ? "mr-4" : ""}`}
      >
        <Checkbox
          id={`sr-checkbox-${index}`}
          checked={checked}
          value={value}
          disabled={isSearching}
          onChange={(event) =>
            handleSelectionChange(value, event.target.checked)
          }
          sx={{ padding: props.isMobile ? "4px" : "9px" }}
          icon={
            <span
              style={{
                borderRadius: "4px",
                border: `2px solid ${fullConfig.theme.colors["frenchviolet"]}`,
                width: checkboxSize,
                height: checkboxSize,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "transparent",
              }}
            ></span>
          }
          checkedIcon={
            <span
              style={{
                borderRadius: "4px",
                border: `2px solid ${fullConfig.theme.colors["frenchviolet"]}`,
                width: checkboxSize,
                height: checkboxSize,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: `${fullConfig.theme.colors["frenchviolet"]}`,
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ width: checkmarkSize, height: checkmarkSize }}
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
          }
        />
        <div
          className={`cursor-pointer select-none pl-1 pr-2 ${props.isMobile ? "text-sm" : "text-l"}`}
          style={{ letterSpacing: 0.5 }}
          onClick={() =>
            !isSearching && handleSelectionChange(value, !checked)
          }
        >
          {displayName}
        </div>
      </div>
    );
  };

  if (props.isMobile) {
    return (
      <div className="flex flex-col">
        <div className="text-sm whitespace-nowrap mb-1">Filter by:</div>
        <div className="flex flex-row flex-wrap">
          {props.src.map((option, index) =>
            renderCheckbox(option.value, option.display_name, index)
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-start ml-4`}>
      <div className="text-sm whitespace-nowrap ml-2">Filter by:</div>
      <div className="flex flex-col sm:flex-row flex-wrap">
        {props.src.map((option, index) =>
          renderCheckbox(option.value, option.display_name, index)
        )}
      </div>
    </div>
  );
};
export default SpatialResolutionCheck;
