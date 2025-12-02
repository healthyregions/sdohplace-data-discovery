import { AppDispatch, RootState } from "@/store";
import { setSort } from "@/store/slices/searchSlice";
import { Box } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";

export const SortOptions = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { sort, isSearching, initializing } = useSelector(
    (state: RootState) => state.search
  );

  const handleSort = (field: string, direction: string) => {
    if (isSearching || initializing) return;
    if (sort.sortBy === field && sort.sortOrder === direction) {
      dispatch(setSort({ field: null, direction: null }));
    } else {
      dispatch(setSort({ field, direction }));
    }
  };
  const isRecentActive = sort.sortBy === "index_year" && sort.sortOrder === "desc";
  const isOldestActive = sort.sortBy === "index_year" && sort.sortOrder === "asc";
  return (
    <Box display="flex" alignItems="center">
      <Box>
        <span
          className={`pr-5 cursor-pointer text-frenchviolet font-bold ${
            isSearching ? "opacity-50" : ""
          }`}
          style={{
            textDecoration: isRecentActive ? "underline" : "none",
          }}
          onClick={() => handleSort("index_year", "desc")}
        >
          Recent first
        </span>

        <span
          className={`cursor-pointer text-frenchviolet font-bold ${
            isSearching ? "opacity-50" : ""
          }`}
          style={{
            textDecoration: isOldestActive ? "underline" : "none",
          }}
          onClick={() => handleSort("index_year", "asc")}
        >
          Oldest first
        </span>
      </Box>
    </Box>
  );
};
