import * as React from "react";
import LightbulbOutlined from "@mui/icons-material/LightbulbOutlined";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";
import CloseIcon from "@mui/icons-material/Close";
import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  CustomPaper,
  CustomPopper,
  useSearchStyles,
} from "./searchUiComponents";
import tailwindConfig from "../../../../tailwind.config";
import resolveConfig from "tailwindcss/resolveConfig";
import {
  MAX_SEARCH_LENGTH,
  isSearchAllowed,
  isSearchBlocked,
} from "./searchUtils";

const fullConfig = resolveConfig(tailwindConfig);

interface SearchInputProps {
  textFieldRef: React.RefObject<HTMLInputElement>;
  inputValue: string;
  aiSearch: boolean;
  query: string;
  suggestions: string[];
  isLoading: boolean;
  showClearButton: boolean;
  onUserInputChange: (event: React.ChangeEvent<{}>, value: string) => void;
  onDropdownSelect: (event: any, value: string | null) => void;
  onSubmit: (event: React.FormEvent) => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
  handleClear: () => void;
  handleModeSwitch: () => void;
  shouldShowDropdown: boolean;
  autocompleteRef: React.RefObject<HTMLDivElement>;
  CustomListbox: any;
  onAutocompleteFocus: (event: React.FocusEvent) => void;
  onAutocompleteBlur: (event: React.FocusEvent) => void;
  isLocalLoading: boolean;
  isSearching: boolean;
  isMobile?: boolean;
}

const SearchInput: React.FC<SearchInputProps> = ({
  textFieldRef,
  inputValue,
  aiSearch,
  query,
  suggestions,
  isLoading,
  showClearButton,
  onUserInputChange,
  onDropdownSelect,
  onSubmit,
  onKeyDown,
  handleClear,
  handleModeSwitch,
  shouldShowDropdown,
  autocompleteRef,
  CustomListbox,
  onAutocompleteFocus,
  onAutocompleteBlur,
  isLocalLoading,
  isSearching,
  isMobile = false,
}) => {
  const classes = useSearchStyles();
  const maxLength = MAX_SEARCH_LENGTH;

  const searchBlocked = isSearchBlocked(isLocalLoading, isSearching, aiSearch);

  const noSearchAllowed = !isSearchAllowed(aiSearch, inputValue, maxLength);

  return (
    <form id="search-form" onSubmit={onSubmit}>
      <Autocomplete
        ref={autocompleteRef}
        PopperComponent={CustomPopper}
        PaperComponent={CustomPaper}
        freeSolo
        open={shouldShowDropdown && !aiSearch}
        options={aiSearch ? [] : suggestions}
        value={query === "*" ? "" : query}
        inputValue={inputValue === "*" ? "" : inputValue}
        onInputChange={onUserInputChange}
        onChange={onDropdownSelect}
        filterOptions={(options) => options}
        autoSelect={false}
        disablePortal={false}
        disableListWrap={true}
        selectOnFocus={false}
        blurOnSelect="touch"
        includeInputInList={true}
        openOnFocus={false}
        disableCloseOnSelect={false}
        ListboxComponent={CustomListbox}
        clearOnBlur={false}
        clearOnEscape={false}
        forcePopupIcon={false}
        handleHomeEndKeys={false}
        onKeyDown={onKeyDown}
        onFocus={onAutocompleteFocus}
        onBlur={onAutocompleteBlur}
        renderOption={(props, option, state) => {
          const { "aria-selected": _, onClick, ...otherProps } = props;
          const isLast = state.index === suggestions.length - 1;
          const plainText = option;
          const highlightMatch = (text: string, query: string) => {
            if (!query) {
              return <Typography component="span" sx={{ whiteSpace: "pre-wrap" }}>{text}</Typography>;
            }
            const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const regex = new RegExp(escapedQuery, "gi");
            const result: React.ReactNode[] = [];
            let lastIndex = 0;
            let match: RegExpExecArray | null;
            let keyIndex = 0;
            while ((match = regex.exec(text)) !== null) {
              if (match.index > lastIndex) {
                result.push(
                  <span key={`text-${keyIndex++}`}>
                    {text.slice(lastIndex, match.index)}
                  </span>
                );
              }
              result.push(
                <Box
                  component="span"
                  key={`match-${keyIndex++}`}
                  sx={{
                    color: fullConfig.theme.colors["frenchviolet"],
                    fontWeight: 900,
                  }}
                >
                  {match[0]}
                </Box>
              );
              lastIndex = regex.lastIndex;
            }
            if (lastIndex < text.length) {
              result.push(
                <span key={`text-${keyIndex++}`}>
                  {text.slice(lastIndex)}
                </span>
              );
            }
            return (
              <Typography
                component="span"
                sx={{
                  fontWeight: 400,
                  fontFamily: "Nunito, sans-serif",
                  whiteSpace: "pre-wrap",
                }}
              >
                {result.length > 0 ? result : text}
              </Typography>
            );
          };
          return (
            <li
              {...otherProps}
              onClick={(e) => {
                if (onClick) onClick(e);
              }}
              className={`${props.className} cursor-pointer`}
              key={option}
              style={{
                padding: "12px 4px",
                fontSize: "0.95rem",
                color: fullConfig.theme.colors["smokegray"],
                transition: "background-color 0.2s ease",
                borderBottom: isLast ? "none" : "1px solid #e5e5e5",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor =
                  "#f5f5f5";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor =
                  "transparent";
              }}
            >
              {highlightMatch(plainText, inputValue)}
            </li>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            inputRef={textFieldRef}
            variant="outlined"
            fullWidth
            placeholder={
              isMobile
                ? ""
                : aiSearch
                ? `Ask a research question (max ${maxLength} characters)...`
                : "Type keyword for recommended term and exact search (e.g. 'poverty' or 'socioeconomic')"
            }
            className={`${classes.searchBox} bg-white`}
            inputProps={{ maxLength: maxLength, ...params.inputProps }}
            sx={{
              paddingRight: "0",
              borderRadius: "1.75em",
              border: `1px solid ${fullConfig.theme.colors["frenchviolet"]}`,
              "& .MuiOutlinedInput-root": {
                borderRadius: "1.75em",
                color: fullConfig.theme.colors["smokegray"],
                paddingRight: isMobile ? "0 !important" : undefined,
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "transparent",
                },
                transition: "all 0.2s ease-in-out",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "transparent",
              },
            }}
            InputProps={{
              ...params.InputProps,
              startAdornment: isMobile ? null : (
                <InputAdornment position="start" sx={{ ml: "-0.25rem" }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      cursor: searchBlocked ? "not-allowed" : "pointer",
                      opacity: searchBlocked ? 0.5 : 1,
                    }}
                    onClick={searchBlocked ? undefined : handleModeSwitch}
                  >
                    <Box
                      className={`${classes.searchBox}`}
                      sx={{
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        color: !aiSearch
                          ? fullConfig.theme.colors["frenchviolet"]
                          : fullConfig.theme.colors["smokegray"],
                        transition: "color 0.3s ease-in-out",
                        mr: "0.5rem",
                        ml: "1rem",
                        width: "4rem",
                        textAlign: "right",
                      }}
                    >
                      Keyword
                    </Box>
                    <Box
                      sx={{
                        position: "relative",
                        width: "4rem",
                        height: "1.5rem",
                        display: "flex",
                        alignItems: "center",
                        backgroundColor: "#ECE6F0",
                        borderRadius: "0.75rem",
                      }}
                    >
                      <Box
                        sx={{
                          position: "absolute",
                          left: !aiSearch ? "0" : "calc(100% - 2rem)",
                          width: "2rem",
                          height: "2rem",
                          backgroundColor:
                            fullConfig.theme.colors["frenchviolet"],
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
                            fontSize: "1.125rem",
                          }}
                        />
                      </Box>
                    </Box>
                    <Box
                      className={`${classes.searchBox}`}
                      sx={{
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        color: aiSearch
                          ? fullConfig.theme.colors["frenchviolet"]
                          : fullConfig.theme.colors["smokegray"],
                        transition: "color 0.3s ease-in-out",
                        ml: "0.5rem",
                        width: "2rem",
                        textAlign: "left",
                      }}
                    >
                      Ask
                    </Box>
                  </Box>
                </InputAdornment>
              ),
              endAdornment: (
                <Box
                  display="flex"
                  alignItems="center"
                  sx={{ mr: isMobile ? "0.5rem" : 0 }}
                >
                  {showClearButton && (
                    <InputAdornment position="end">
                      <Tooltip
                        title={
                          searchBlocked
                            ? "Please wait for the current search to complete"
                            : "Clear search"
                        }
                      >
                        <span>
                          <IconButton
                            onClick={handleClear}
                            disabled={searchBlocked}
                            sx={{
                              opacity: searchBlocked ? 0.5 : 1,
                              cursor: searchBlocked ? "not-allowed" : "pointer",
                            }}
                          >
                            <CloseIcon className="text-2xl text-frenchviolet" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </InputAdornment>
                  )}
                  <InputAdornment position="end">
                    <Tooltip
                      title={
                        isLoading || noSearchAllowed
                          ? aiSearch &&
                            (!inputValue ||
                              inputValue === "*" ||
                              inputValue.length > maxLength)
                            ? !inputValue
                              ? "Please enter your question first"
                              : inputValue.length > maxLength
                              ? `Question must be within ${maxLength} characters`
                              : "Please enter a valid question"
                            : ""
                          : ""
                      }
                      enterDelay={0}
                      leaveDelay={200}
                    >
                      <span style={{ display: "inline-flex" }}>
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          disabled={isLoading || noSearchAllowed}
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-end",
                            justifyContent: "center",
                            backgroundColor: "transparent",
                            color: fullConfig.theme.colors["frenchviolet"],
                            boxShadow: "none",
                            minWidth: isMobile ? "auto" : undefined,
                            padding: isMobile ? "6px" : undefined,
                            "&:hover": {
                              backgroundColor: "transparent",
                              boxShadow: "none",
                            },
                            "&:disabled": {
                              color: fullConfig.theme.colors["frenchviolet"],
                              opacity: noSearchAllowed ? 0.1 : 1.0,
                              backgroundColor: "transparent",
                            },
                          }}
                        >
                          {isLoading ? (
                            <span>
                              <CircularProgress
                                size={28}
                                className={classes.loadingButton}
                              />
                            </span>
                          ) : (
                            <ArrowCircleRightIcon className="text-xxl" />
                          )}
                        </Button>
                      </span>
                    </Tooltip>
                  </InputAdornment>
                </Box>
              ),
              type: "search",
            }}
          />
        )}
      />
    </form>
  );
};

export default SearchInput;
