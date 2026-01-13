"use client";
import { useEffect, useState } from "react";
import { LngLatBoundsLike } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import dynamic from "next/dynamic";

const DynamicMap = dynamic(() => import("./dynamicMap"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-100 animate-pulse" />,
});

export default function MapArea(): JSX.Element {
  const [isMounted, setIsMounted] = useState(false);
  const contiguousBounds: LngLatBoundsLike = [
    -125.332, 23.899, -65.742, 49.432,
  ];
  useEffect(() => {
    setIsMounted(true);
  }, []);
  if (!isMounted) {
    return <div className="h-full w-full bg-gray-100" />;
  }
  return (
    <div className="h-full w-full relative">
      <DynamicMap initialBounds={contiguousBounds} />
    </div>
  );
}
