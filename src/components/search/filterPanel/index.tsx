import { Box } from "@mui/material";
import { FilterHeader } from "./filterHeader";
import { SortOptions } from "./sortOptions";
import { YearRangeSlider } from "./yearRangeSlider";
import { SearchUIConfig } from "@/components/searchUIConfig";
import { ThemeOptions } from "./themeOptions";
import { ResourceOptions } from "./resourceOptions";

const FilterPanel = (): JSX.Element => {
  return (
    <div className="pr-5 my-4 sm:my-0 filter-panel">
      <Box className="p-5 bg-white border border-lightgray rounded">
        <FilterHeader />
        <SortOptions />
        <YearRangeSlider
          minRange={SearchUIConfig.search.index_year.min_year}
          maxRange={SearchUIConfig.search.index_year.max_year}
        />
        <ResourceOptions />
        <ThemeOptions />
      </Box>
    </div>
  );
};

export default FilterPanel;
