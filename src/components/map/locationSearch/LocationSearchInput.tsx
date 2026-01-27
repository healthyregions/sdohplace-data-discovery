import React, { forwardRef } from 'react';
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "tailwind.config.js";

const fullConfig = resolveConfig(tailwindConfig);

interface LocationSearchInputProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onClear: () => void;
  showClearButton: boolean;
  placeholder?: string;
}

const LocationSearchInput = forwardRef<HTMLInputElement, LocationSearchInputProps>(
  ({ value, onChange, onFocus, onBlur, onClear, showClearButton, placeholder = "Search location..." }, ref) => {
    return (
      <div className="relative flex items-center bg-white rounded-full border border-lightviolet shadow-sm w-full sm:w-[300px] h-[48px] px-3" style={{ maxWidth: 'calc(100% - 56px)' }}>
        <SearchIcon
          className="sm:mr-[12px]"
          sx={{
            height: "22px",
            width: "22px",
            color: fullConfig.theme.colors["frenchviolet"],
            flexShrink: 0,
          }}
        />
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          className="flex-1 h-full bg-transparent border-none text-smokegray text-base py-[0.25rem] pr-[0.5rem] sm:pl-0 placeholder:text-neutralgray"
          style={{
            fontFamily: 'Nunito, sans-serif',
            WebkitAppearance: 'none',
            outline: 'none',
            boxShadow: 'none',
          }}
        />
        {showClearButton && (
          <button
            type="button"
            onClick={onClear}
            className="flex items-center justify-center p-1 hover:bg-lightviolet rounded-full transition-colors"
          >
            <CloseIcon
              sx={{
                height: "20px",
                width: "20px",
                color: fullConfig.theme.colors["frenchviolet"],
              }}
            />
          </button>
        )}
      </div>
    );
  }
);

LocationSearchInput.displayName = 'LocationSearchInput';

export default LocationSearchInput;
