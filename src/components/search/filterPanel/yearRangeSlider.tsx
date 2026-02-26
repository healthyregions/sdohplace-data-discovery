import { AppDispatch, RootState } from "@/store";
import { setIndexYear } from "@/store/slices/searchSlice";
import { Box, Slider, SxProps, Theme } from "@mui/material";
import { SyntheticEvent, useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import tailwindConfig from "tailwind.config";
import resolveConfig from "tailwindcss/resolveConfig";

const fullConfig = resolveConfig(tailwindConfig);
const DEFAULT_MIN_YEAR = 2000;
const MIN_YEAR_GAP = 1; // prevent the two thumbs from being at the same position
const labelStyle: SxProps<Theme> = {
  fontFamily: `${fullConfig.theme.fontFamily["sans"]} !important`,
  fontSize: "0.875rem",
};

type YearRange = [number, number];

const clampYearRange = (
  range: YearRange,
  minimum: number,
  maximum: number
): YearRange => {
  const clampedStart = Math.min(Math.max(range[0], minimum), maximum);
  const clampedEnd = Math.min(Math.max(range[1], clampedStart), maximum);
  return [clampedStart, clampedEnd];
};

// Ensures that the year range respects the minimum gap and stays within bounds. 
// If activeThumb is provided, it indicates which thumb is being moved (0 for start, 1 for end) to determine how to adjust the range when the gap is violated.
const enforceMinimumYearGap = (
  range: YearRange,
  minimum: number,
  maximum: number,
  activeThumb?: number
): YearRange => {
  if (maximum - minimum < MIN_YEAR_GAP) {
    return clampYearRange(range, minimum, maximum);
  }
  let [start, end] = clampYearRange(range, minimum, maximum);
  if (end - start >= MIN_YEAR_GAP) {
    return [start, end];
  }
  if (activeThumb === 0) {
    start = Math.min(start, maximum - MIN_YEAR_GAP);
    end = start + MIN_YEAR_GAP;
    return [start, end];
  }
  if (activeThumb === 1) {
    end = Math.max(end, minimum + MIN_YEAR_GAP);
    start = end - MIN_YEAR_GAP;
    return [start, end];
  }
  end = Math.min(maximum, start + MIN_YEAR_GAP);
  start = Math.max(minimum, end - MIN_YEAR_GAP);
  return [start, end];
};

const createYearsArray = (start: number, end: number): number[] =>
  Array.from({ length: end - start + 1 }, (_, i) => start + i);

const PriorYearToggle = ({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={enabled}
    onClick={onToggle}
    className="flex items-center gap-2 bg-transparent border-none p-0"
    style={{ cursor: "pointer" }}
  >
    <span
      style={{
        width: "42px",
        height: "24px",
        borderRadius: "9999px",
        padding: "2px",
        display: "inline-flex",
        justifyContent: enabled ? "flex-end" : "flex-start",
        alignItems: "center",
        backgroundColor: enabled
          ? fullConfig.theme.colors["frenchviolet"]
          : fullConfig.theme.colors["lightviolet"],
        transition: "all 0.2s ease",
      }}
    >
      <span
        style={{
          width: "20px",
          height: "20px",
          borderRadius: "9999px",
          backgroundColor: fullConfig.theme.colors["white"],
        }}
      />
    </span>
    <span
      style={{
        color: fullConfig.theme.colors["almostblack"],
        fontSize: "0.875rem",
      }}
    >
      Show prior to 2000
    </span>
  </button>
);

export const YearRangeSlider = ({
  minRange,
  maxRange,
}: {
  minRange: number;
  maxRange: number;
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const indexYear = useSelector((state: RootState) => state.search.indexYear);
  const yearBounds = useSelector((state: RootState) => state.search.yearBounds);
  const derivedMinRange = yearBounds?.min ?? minRange;
  const derivedMaxRange = yearBounds?.max ?? maxRange;
  const boundedMaxYear = Math.max(derivedMinRange, derivedMaxRange);
  const defaultMinYear = Math.min(
    Math.max(DEFAULT_MIN_YEAR, derivedMinRange),
    boundedMaxYear
  );
  const priorMinYear = Math.min(derivedMinRange, boundedMaxYear);
  const [allowPriorTo2000, setAllowPriorTo2000] = useState(false);
  const [yearRange, setYearRange] = useState<YearRange>([
    defaultMinYear,
    boundedMaxYear,
  ]);

  const dispatchYearRange = useCallback(
    (range: YearRange) => {
      dispatch(setIndexYear(createYearsArray(range[0], range[1])));
    },
    [dispatch]
  );

  useEffect(() => {
    if (!indexYear || indexYear.length === 0) {
      setAllowPriorTo2000(false);
      setYearRange(
        enforceMinimumYearGap(
          [defaultMinYear, boundedMaxYear],
          defaultMinYear,
          boundedMaxYear
        )
      );
      return;
    }
    const years = indexYear.map(Number).filter((year) => !Number.isNaN(year));
    if (!years.length) {
      setAllowPriorTo2000(false);
      setYearRange(
        enforceMinimumYearGap(
          [defaultMinYear, boundedMaxYear],
          defaultMinYear,
          boundedMaxYear
        )
      );
      return;
    }
    const min = Math.min(...years);
    const max = Math.max(...years);
    if (min < defaultMinYear) {
      setAllowPriorTo2000(true);
      setYearRange(
        enforceMinimumYearGap([min, max], priorMinYear, boundedMaxYear)
      );
      return;
    }
    setYearRange(
      enforceMinimumYearGap([min, max], defaultMinYear, boundedMaxYear)
    );
  }, [indexYear, defaultMinYear, priorMinYear, boundedMaxYear]);

  const sliderMin = allowPriorTo2000 ? priorMinYear : defaultMinYear;

  const handleYearRangeChange = useCallback(
    (_event: Event, newValue: number | number[], activeThumb: number) => {
      if (!Array.isArray(newValue)) return;
      const nextRange = enforceMinimumYearGap(
        [newValue[0], newValue[1]],
        sliderMin,
        boundedMaxYear,
        activeThumb
      );
      setYearRange(nextRange);
    },
    [sliderMin, boundedMaxYear]
  );

  const handleYearRangeCommit = useCallback(
    (_event: SyntheticEvent | Event, newValue: number | number[]) => {
      if (!Array.isArray(newValue)) return;
      const nextRange = enforceMinimumYearGap(
        [newValue[0], newValue[1]],
        sliderMin,
        boundedMaxYear
      );
      setYearRange(nextRange);
      dispatchYearRange(nextRange);
    },
    [sliderMin, boundedMaxYear, dispatchYearRange]
  );

  const handlePriorYearToggle = useCallback(() => {
    const nextAllowPrior = !allowPriorTo2000;
    const nextMinimum = nextAllowPrior ? priorMinYear : defaultMinYear;
    const nextRange = enforceMinimumYearGap(
      yearRange,
      nextMinimum,
      boundedMaxYear
    );
    setAllowPriorTo2000(nextAllowPrior);
    setYearRange(nextRange);
  }, [
    allowPriorTo2000,
    priorMinYear,
    defaultMinYear,
    yearRange,
    boundedMaxYear
  ]);

  return (
    <Box className="mt-6">
      <Box className="text-base font-bold" sx={{ mb: 1 }}>
        Filter
      </Box>
      <Box className="text-base font-bold">Year</Box>
      <Box className="mt-2 flex items-center gap-3">
        <Box
          sx={{
            ...labelStyle,
            minWidth: "36px",
            textAlign: "left",
            color: fullConfig.theme.colors["almostblack"],
            fontWeight: 900,
          }}
        >
          {sliderMin}
        </Box>
        <Box className="flex-1">
          <Slider
            sx={{
              color: `${fullConfig.theme.colors["frenchviolet"]}`,
              "& .MuiSlider-track": {
                border: "none",
                backgroundColor: `${fullConfig.theme.colors["frenchviolet"]}`,
                height: "6px",
                borderRadius: "9999px",
              },
              "& .MuiSlider-rail": {
                opacity: 1,
                backgroundColor: `${fullConfig.theme.colors["lightviolet"]}`,
                height: "6px",
                borderRadius: "9999px",
              },
              "& .MuiSlider-thumb": {
                width: "18px",
                height: "18px",
                backgroundColor: `${fullConfig.theme.colors["frenchviolet"]}`,
                border: `2px solid ${fullConfig.theme.colors["frenchviolet"]}`,
              },
              "& .MuiSlider-valueLabel": {
                ...labelStyle,
                color: `${fullConfig.theme.colors["frenchviolet"]}`,
                backgroundColor: "transparent",
                fontWeight: 900,
              },
              "& .MuiSlider-valueLabelLabel": {
                fontWeight: 900,
              },
              "& .MuiSlider-valueLabel:before": {
                display: "none",
              },
            }}
            min={sliderMin}
            max={boundedMaxYear}
            value={yearRange}
            onChange={handleYearRangeChange}
            onChangeCommitted={handleYearRangeCommit}
            valueLabelDisplay="auto"
            marks={false}
            step={1}
            disableSwap
          />
        </Box>
        <Box
          sx={{
            ...labelStyle,
            minWidth: "36px",
            textAlign: "right",
            color: fullConfig.theme.colors["almostblack"],
            fontWeight: 900,
          }}
        >
          {boundedMaxYear}
        </Box>
      </Box>
      <Box className="mt-3">
        <PriorYearToggle
          enabled={allowPriorTo2000}
          onToggle={handlePriorYearToggle}
        />
      </Box>
    </Box>
  );
};
