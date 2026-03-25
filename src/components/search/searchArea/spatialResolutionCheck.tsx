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

  const normalizeValue = (value: string) => value.toString().trim();
  const selectedValues = spatialResolution || [];
  const selectedSet = React.useMemo(
    () => new Set(selectedValues.map((value) => normalizeValue(value))),
    [selectedValues]
  );

  const handleSelectionChange = (value: string, checked: boolean) => {
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

    try {
      plausible(EventType.ChangedSpatialResolution, {
        props: {
          spatialResolution: nextSelectedValues.join(", "),
        },
      });
    } catch (error) {
      console.error("Analytics error:", error);
    }
  };

  const checkboxSize = props.isMobile ? 28 : 32;

  const renderCheckbox = (
    value: string,
    displayName: string,
    index: number
  ) => {
    const checked = selectedSet.has(normalizeValue(value));
    return (
      <div
        key={`${value}-${index}`}
        className={`flex items-center ${
          props.isMobile ? "mr-4 mb-1" : "mr-3 mb-1"
        }`}
      >
        <label
          htmlFor={`sr-checkbox-${index}`}
          className="flex items-center cursor-pointer"
        >
          <Checkbox
            id={`sr-checkbox-${index}`}
            checked={checked}
            onChange={(_event, nextChecked) =>
              handleSelectionChange(value, nextChecked)
            }
            disableRipple
            sx={{
              p: 0.25,
              mr: 1,
              color: fullConfig.theme.colors["frenchviolet"],
              "&.Mui-checked": {
                color: fullConfig.theme.colors["frenchviolet"],
              },
              "& .MuiSvgIcon-root": {
                fontSize: checkboxSize,
              },
            }}
          />
          <span
            className={`select-none pr-2 pl-1 ${
              props.isMobile ? "text-sm" : "text-l"
            }`}
            style={{
              letterSpacing: 0.5,
              color: fullConfig.theme.colors["almostblack"],
            }}
          >
            {displayName}
          </span>
        </label>
      </div>
    );
  };

  if (props.isMobile) {
    return (
      <div
        className="flex flex-col relative z-20"
        style={{ pointerEvents: "auto" }}
      >
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
    <div
      className={`flex flex-col items-start ml-4 relative z-20`}
      style={{ pointerEvents: "auto" }}
    >
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
