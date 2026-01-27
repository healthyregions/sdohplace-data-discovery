import React from 'react';
import CancelIcon from "@mui/icons-material/Cancel";
import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "tailwind.config.js";

const fullConfig = resolveConfig(tailwindConfig);

export interface LocationResult {
  id: string;
  place_name: string;
  place_type?: string[];
  text?: string;
  context?: Array<{ id: string; text: string }>;
}

interface LocationSearchDropdownProps {
  results: LocationResult[];
  onSelect: (item: LocationResult) => void;
  visible: boolean;
  showNoResults?: boolean;
}

const parseLocationInfo = (item: LocationResult) => {
  const name = item.text || item.place_name?.split(',')[0] || '';
  const type = item.place_type?.[0] || '';

  let region = '';
  if (item.context && item.context.length > 0) {
    const regionParts = item.context
      .filter((ctx) => ctx.id.startsWith('region') || ctx.id.startsWith('country'))
      .map((ctx) => ctx.text);
    region = regionParts.join(', ');
  } else if (item.place_name) {
    const parts = item.place_name.split(',').slice(1);
    region = parts.map((p) => p.trim()).join(', ');
  }

  return { name, type, region };
};

const LocationSearchDropdown: React.FC<LocationSearchDropdownProps> = ({
  results,
  onSelect,
  visible,
  showNoResults = false,
}) => {
  if (!visible) {
    return null;
  }

  if (showNoResults && results.length === 0) {
    return (
      <div
        className="absolute top-full left-0 mt-2 w-[300px] bg-white rounded-lg shadow-lg border border-lightviolet overflow-hidden z-50"
        style={{ fontFamily: 'Nunito, sans-serif' }}
      >
        <div className="px-4 py-4 flex flex-col items-center text-center">
          <div className="flex items-center gap-2 mb-1">
            <CancelIcon
              sx={{
                height: "18px",
                width: "18px",
                color: fullConfig.theme.colors["strongorange"],
              }}
            />
            <span
              className="font-bold"
              style={{ fontSize: '0.75rem', color: fullConfig.theme.colors["smokegray"] }}
            >
              No matching locations found
            </span>
          </div>
          <span
            className="text-darkgray"
            style={{ fontSize: '0.625rem' }}
          >
            Try searching for only <strong style={{ color: fullConfig.theme.colors["frenchviolet"] }}>within the United States</strong>
          </span>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return null;
  }

  return (
    <div
      className="absolute top-full left-0 mt-2 w-[300px] bg-white rounded-lg shadow-lg border border-lightviolet overflow-hidden z-50"
      style={{ fontFamily: 'Nunito, sans-serif' }}
    >
      <ul className="py-1">
        {results.map((item, index) => {
          const { name, type, region } = parseLocationInfo(item);
          const isLastItem = index === results.length - 1;

          return (
            <li key={item.id || index}>
              <button
                type="button"
                onClick={() => onSelect(item)}
                className="w-full px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex flex-col w-full">
                  <div className="flex items-center gap-2">
                    <span
                      className="font-bold"
                      style={{
                        color: fullConfig.theme.colors["frenchviolet"],
                        fontSize: '0.75rem',
                      }}
                    >
                      {name}
                    </span>
                    {type && (
                      <>
                        <span className="text-neutralgray" style={{ fontSize: '0.75rem' }}>•</span>
                        <span className="text-neutralgray" style={{ fontSize: '0.75rem' }}>{type}</span>
                      </>
                    )}
                  </div>
                  {region && (
                    <span className="text-darkgray mt-0.5" style={{ fontSize: '0.75rem' }}>{region}</span>
                  )}
                </div>
              </button>
              {!isLastItem && (
                <div className="mx-4 border-b border-gray-200" />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default LocationSearchDropdown;
