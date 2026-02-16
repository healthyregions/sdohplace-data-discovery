import { useState, useEffect } from "react";
import MapPanelContent from "./mapPanelContent";
import { SolrObject } from "meta/interface/SolrObject";

interface Props {
  resultsList: SolrObject[];
  showMap: string;
  schema: any;
  mobileViewMode?: "list" | "map";
  onMobileViewChange?: (mode: "list" | "map") => void;
}

export default function MapPanel(props: Props) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="sm:px-[2em]" style={{ display: props.showMap }}>
        <div className="h-full w-full bg-gray-100 animate-pulse" />
      </div>
    );
  }

  return <MapPanelContent {...props} />;
}
