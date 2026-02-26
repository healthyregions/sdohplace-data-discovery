import { Button } from "@mui/material";
import Image from "next/image";
import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "tailwind.config.js";
const fullConfig = resolveConfig(tailwindConfig);
interface Props {
  className?: string;
  svgIcon?: any;
  muiIcon?: any;
  label: string;
  fillColor: string;
  labelColor: string;
  onClick: any;
  disabled?: boolean;
  iconOpacity?: number;
  width?: string;
  noBox?: boolean;
  noHover?: boolean;
  justifyContent?: string;
  borderRadius?: string;
  border?: string;
  endIcon?: any; // if there's end icon, then start icon and label will be left aligned and end icon will be right aligned (i.e. footer style)
}
const ButtonWithIcon = (props: Props): JSX.Element => {
  const fillColor = fullConfig.theme.colors[props.fillColor] || props.fillColor;
  const labelColor = fullConfig.theme.colors[props.labelColor] || props.labelColor;

  return (
    <div>
      <Button
        disableElevation
        className={props.className || ''}
        variant="contained"
        startIcon={
          props.svgIcon ? props.svgIcon : null
        }
        endIcon={
          props.endIcon ? props.endIcon : null
        }
        onClick={props.onClick}
        disabled={props.disabled}
        sx={{
          width: props.width ? props.width : "auto ",
          height: "3rem",
          "@media (min-width: 768px)": {
            height: "3.75rem",
          },
          "@media only screen and (max-width: 921px) and (min-width: 768px)": {
            height: "3.25rem",
          },
          borderRadius: props.borderRadius ? props.borderRadius : "6.25rem",
          backgroundColor: `${fillColor} !important`,
          textTransform: "none",
          color: `${labelColor} !important`,
          fontFamily: `${fullConfig.theme.fontFamily["sans"]}`,
          fontSize: "clamp(1.125rem, 1vw + 0.1rem, 1.25rem)",
          fontStyle: "normal",
          fontWeight: 700,
          lineHeight: "1.5rem",
          letterSpacing: "0.00938rem",
          justifyContent: props.justifyContent
            ? props.justifyContent
            : "initial",
          boxShadow: props.noBox ? "none" : "3px 3px 5px rgba(0, 0, 0, 0.3)",
          border: props.border ? props.border : "none",
          "& .buttonContent": {
            color: `${labelColor} !important`,
          },
          "& .MuiButton-startIcon, & .MuiButton-endIcon": {
            color: `${labelColor} !important`,
            opacity: props.iconOpacity ?? 1,
          },
          "&.Mui-disabled": {
            backgroundColor: `${fillColor} !important`,
            color: `${labelColor} !important`,
            opacity: 0.6,
          },
          "&.Mui-disabled .buttonContent": {
            color: `${labelColor} !important`,
          },
          "&.Mui-disabled .MuiButton-startIcon, &.Mui-disabled .MuiButton-endIcon": {
            color: `${labelColor} !important`,
            opacity: props.iconOpacity ?? 1,
          },
          "&:hover": {
            boxShadow: props.noHover
              ? "none"
              : "3px 3px 5px rgba(0, 0, 0, 0.3)",
            backgroundColor: `${fillColor} !important`,
            color: `${labelColor} !important`,
          },
        }}
      >
        <span className="buttonContent">{props.label}</span>
      </Button>
    </div>
  );
};

export default ButtonWithIcon;
