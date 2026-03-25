import * as React from "react";
import { Popper, Paper } from "@mui/material";
import { keyframes } from "@emotion/react";
import tailwindConfig from "../../../../tailwind.config";
import resolveConfig from "tailwindcss/resolveConfig";

const fullConfig = resolveConfig(tailwindConfig);

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

export const searchStyles = {
  searchBox: {
    fontFamily: `${fullConfig.theme.fontFamily["sans"]} !important`,
    "&:hover, &:focus, &:focus-visible, &:active": {
      outline: "none",
      boxShadow: "none",
    },
    "& input": {
      fontFamily: `${fullConfig.theme.fontFamily["sans"]} !important`,
      appearance: "none",
      WebkitAppearance: "none",
      "&:hover, &:focus, &:focus-visible, &:active": {
        outline: "none",
        borderColor: "transparent",
        boxShadow: "none",
      },
      "&::-webkit-search-cancel-button": {
        display: "none",
      },
    },
    "& .MuiOutlinedInput-root": {
      "&:hover, &.Mui-focused, &:focus-within, &:active": {
        outline: "none",
        boxShadow: "none",
      },
      "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: "transparent !important",
      },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: "transparent !important",
      },
      "&:active .MuiOutlinedInput-notchedOutline": {
        borderColor: "transparent !important",
      },
    },
    "& .MuiInputBase-input": {
      "&:hover, &:focus, &:focus-visible, &:active": {
        outline: "none",
        boxShadow: "none",
      },
    },
    "& .MuiOutlinedInput-notchedOutline": {
      display: "none",
      borderColor: "transparent !important",
    },
    "& .MuiAutocomplete-option": {
      "&[aria-selected='true']": {
        backgroundColor: "transparent !important",
      },
      "&:hover": {
        backgroundColor: "#f0f0f0 !important",
      },
      "&.Mui-focused": {
        backgroundColor: "transparent !important",
      },
      "&[data-focus='true']": {
        backgroundColor: "transparent !important",
      },
    },
  },
  popper: {
    borderRadius: "1.75em !important",
    zIndex: 1000,
  },
  paper: {
    fontFamily: `${fullConfig.theme.fontFamily["sans"]} !important`,
    color: `${fullConfig.theme.colors["smokegray"]}`,
    fontSize: "0.875em",
    marginTop: "0.5em",
    width: "100%",
    zIndex: 1000,
    backgroundColor: "white",
    borderRadius: "1.75em !important",
    border: `1px solid ${fullConfig.theme.colors["frenchviolet"]}`,
    overflow: "hidden",
  },
  aiModeButton: {
    color: fullConfig.theme.colors["frenchviolet"],
    "&.active": {
      backgroundColor: fullConfig.theme.colors["frenchviolet"],
      color: "white",
    },
    "&:hover": {
      color: fullConfig.theme.colors["frenchviolet"],
    },
    "&:hover&.active": {
      backgroundColor: fullConfig.theme.colors["frenchviolet"],
      color: "white",
    },
  },
  loadingButton: {
    color: fullConfig.theme.colors["frenchviolet"],
    animation: `${spin} 1s linear infinite`,
  },
};

export const CustomPopper = (props) => {
  return (
    <Popper {...props} sx={searchStyles.popper} placement="bottom-start" />
  );
};

export const CustomPaper = (props) => {
  return <Paper {...props} sx={searchStyles.paper} />;
};

export const CustomListbox = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement> & {
    onMouseEnter: () => void,
    onMouseLeave: () => void
  }
>((props, ref) => {
  return (
    <ul
      ref={ref}
      {...props}
      className={`${props.className || ""} custom-autocomplete-listbox`}
      style={{
        padding: "6px 0.75rem",
        margin: 0,
        listStyle: "none",
        ...props.style,
      }}
    />
  );
});

CustomListbox.displayName = "CustomListbox";
