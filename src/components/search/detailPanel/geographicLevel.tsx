import * as React from "react";
import tailwindConfig from "../../../../tailwind.config";
import resolveConfig from "tailwindcss/resolveConfig";

interface Props {
  spatialResolution: string[];
}
const fullConfig = resolveConfig(tailwindConfig);
const colors = fullConfig.theme.colors;

// nested levels drawn from largest to smallest; `matches` are spatial_resolution values (lowercased)
const levels = [
  { label: "State", matches: ["state"], r: 68, labelY: 30 },
  { label: "County", matches: ["county"], r: 54, labelY: 58 },
  { label: "Zip", matches: ["zip code tabulation area (zcta)", "zcta", "zip", "zip code"], r: 40, labelY: 86 },
  { label: "Tract", matches: ["census tract", "tract"], r: 28, labelY: 114 },
  { label: "Block group", matches: ["census block group", "block group", "bg"], r: 14, labelY: 142 },
];
const cx = 80;
const bottom = 160;
const lineEnd = 186;

/**
 * Nested-circle diagram highlighting the geographic levels a resource is available at.
 * Renders nothing if none of the levels apply (e.g. City only).
 */
const GeographicLevel = (props: Props): JSX.Element => {
  const values = props.spatialResolution.map((s) => s.trim().toLowerCase());
  const isActive = (matches: string[]) => matches.some((m) => values.includes(m));
  const activeLevels = levels.filter((l) => isActive(l.matches));
  if (activeLevels.length === 0) return null;

  return (
    <svg
      viewBox="0 0 290 170"
      className="w-full max-w-[18rem] mt-3"
      role="img"
      aria-label={`Geographic levels: ${props.spatialResolution.join(", ")}`}
    >
      {levels.map((l) => {
        const active = activeLevels.includes(l);
        // with several active levels, a light dashed outline keeps each nested orange circle visible
        const separated = active && activeLevels.length > 1;
        return (
          <circle
            key={l.label}
            cx={cx}
            cy={bottom - l.r}
            r={l.r}
            fill={active ? colors["strongorange"] : colors["lightbisque"]}
            stroke={separated ? colors["lightbisque"] : colors["strongorange"]}
            strokeWidth={separated ? 1.5 : 1}
            strokeDasharray={active && !separated ? undefined : "4 3"}
          />
        );
      })}
      {levels.map((l) => {
        const active = isActive(l.matches);
        const lineColor = active ? colors["almostblack"] : colors["neutralgray"];
        return (
          <g key={l.label}>
            <line x1={cx} y1={l.labelY} x2={lineEnd} y2={l.labelY} stroke={lineColor} strokeWidth={1} />
            <circle cx={lineEnd} cy={l.labelY} r={2.5} fill={lineColor} />
            <text
              x={lineEnd + 12}
              y={l.labelY}
              dominantBaseline="middle"
              fontFamily={fullConfig.theme.fontFamily["sans"]}
              fontSize={14}
              fontWeight={active ? 700 : 400}
              fill={active ? colors["almostblack"] : colors["neutralgray"]}
            >
              {l.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

export default GeographicLevel;
