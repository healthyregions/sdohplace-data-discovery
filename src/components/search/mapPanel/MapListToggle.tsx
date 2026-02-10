import React from "react";

type Props = {
  value: "list" | "map";
  onChange: (v: "list" | "map") => void;
};

export default function MapListToggle({ value, onChange }: Props) {
  return (
    <div className="block sm:px-4 sm:hidden w-full ">
      <div className="inline-flex items-center justify-between w-full bg-[#F3EAF7] sm:rounded-lg p-2">
        <button
          onClick={() => onChange("list")}
          className={`flex-1 text-center py-2 rounded-md ${value === "list" ? "text-[#3b2a78] font-bold" : "text-[#7B6A91]"}`}
          aria-pressed={value === "list"}
        >
          List
        </button>
        <div className="w-px h-6 bg-[#E6D9F0] mx-2" />
        <button
          onClick={() => onChange("map")}
          className={`flex-1 text-center py-2 rounded-md ${value === "map" ? "text-[#3b2a78] font-bold" : "text-[#7B6A91]"}`}
          aria-pressed={value === "map"}
        >
          Map
        </button>
      </div>
    </div>
  );
}
