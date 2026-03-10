"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setSearchBbox,
  setEnableMapBboxFilter,
} from "@/store/slices/searchSlice";
import {
  setShowBboxFilter,
  setOverlayIds,
  setGeocodeFeature,
} from "@/store/slices/mapSlice";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CloseIcon from "@mui/icons-material/Close";
import { AppDispatch, RootState } from "@/store";
import maplibregl, {
  LngLatBoundsLike,
  FilterSpecification,
  GeoJSONSource,
  Map,
  NavigationControl,
  Popup,
  ScaleControl,
} from "maplibre-gl";
import { Protocol } from "pmtiles";
import AddIcon from "@mui/icons-material/Add";
import "maplibre-gl/dist/maplibre-gl.css";

import * as turf from "@turf/turf";

import { usePlausible } from "next-plausible";

import {
  overlayRegistry,
  makePreviewLyrs,
  previewSources,
} from "./helper/layers";
import GeocodeControl from "./geocodeControl";
import AssetPopupComponent from "./AssetPopupComponent";
import { config, geocoding } from "@maptiler/client";
import { createRoot, Root } from "react-dom/client";

import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "tailwind.config.js";
const fullConfig = resolveConfig(tailwindConfig);

const apiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;

const LABEL_LAYER_PATTERNS = [
  "place_country",
  "place_state",
  "place_region",
  "place_province",
  "place_city",
  "place_town",
  "place_village",
  "place_hamlet",
  "place_suburb",
  "place_neighbourhood",
  "place_locality",
  "place_other",
  "State labels",
  "Country labels",
  "City labels",
  "Place labels",
];

const US_BOUNDS = {
  minLng: -125.0,
  maxLng: -66.0,
  minLat: 24.0,
  maxLat: 50.0,
};

interface Props {
  initialBounds: LngLatBoundsLike;
}

export default function DynamicMap(props: Props): JSX.Element {
  const dispatch = useDispatch<AppDispatch>();
  const plausible = usePlausible();

  const { geocodeFeature, overlayIds, previewLyrs, showBboxFilter } =
    useSelector((state: RootState) => state.map);
  const { enableMapBboxFilter, searchBbox } = useSelector(
    (state: RootState) => state.search
  );

  const [popup, setPopup] = useState(null);
  const [popupInfo, setPopupInfo] = useState(null);
  const popupRootRef = useRef<Root | null>(null);
  const popupContainerRef = useRef<HTMLDivElement | null>(null);
  const styleInjectedRef = useRef(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [bboxFilterLabel, setBboxFilterLabel] = useState("");
  const [bboxStale, setBboxStale] = useState(false); // whether the current bbox results are stale or fresh
  const suppressStaleUntilRef = useRef(0); // timestamp to prevent moveend from immediately marking stale (such as programmetic moves)
  const enableMapBboxFilterRef = useRef(enableMapBboxFilter); // keep a ref version of the enableMapBboxFilter for use in callbacks
  enableMapBboxFilterRef.current = enableMapBboxFilter;
  const pendingGeocodeRef = useRef<{
    label: string;
    bbox: number[];
    geometry: any;
  } | null>(null);

  const mapDivRef = useRef(null);
  const mapRef = useRef(null);

  // create ability to load pmtiles layers
  useEffect(() => {
    let protocol = new Protocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);
    return () => {
      maplibregl.removeProtocol("pmtiles");
    };
  });

  function getCurrentMapBbox() {
    const bounds = mapRef.current.getBounds();
    const newBbox: [number, number, number, number] = [
      Math.round(bounds._sw.lng * 1000) / 1000,
      Math.round(bounds._sw.lat * 1000) / 1000,
      Math.round(bounds._ne.lng * 1000) / 1000,
      Math.round(bounds._ne.lat * 1000) / 1000,
    ];
    return newBbox;
  }

  /* Changed logic in #44: check to see if user has moved the map or not since the last search.
  zoom/pan moveend handler to mark bbox as stale and no result update yet
  */
  const markBboxStale = useCallback(() => {
    if (Date.now() < suppressStaleUntilRef.current) return;
    setBboxStale(true);
    setBboxFilterLabel("Show results in this area");
  }, []);

  const handleSearchWithinMap = () => {
    if (!mapLoaded) return;
    if (enableMapBboxFilter) {
      mapRef.current.on("moveend", markBboxStale);
    } else {
      mapRef.current.off("moveend", markBboxStale);
    }
  };
  useEffect(handleSearchWithinMap, [
    mapLoaded,
    enableMapBboxFilter,
    markBboxStale,
  ]);

  const handleBboxFilterLabel = () => {
    if (!enableMapBboxFilter) {
      setBboxFilterLabel("Show results in this area");
      setBboxStale(false);
    }
  };
  useEffect(handleBboxFilterLabel, [enableMapBboxFilter]);

  /*  When the move moveend happens, mark the markBboxStale and change the button label with NO search happens.
  Then for the BbboxFilterButton:
  Filter on + results fresh (!bboxStale) → acts as "Clear", turns everything off
  Filter on + results stale (bboxStale) → re-searches with the current viewport
  Filter off → enables filter, searches current viewport
  */
  const handleBboxFilterButton = () => {
    if (!mapLoaded) return;
    if (enableMapBboxFilter && !bboxStale) {
      dispatch(setEnableMapBboxFilter(false));
      dispatch(setSearchBbox(null));
      setBboxStale(false);
      return;
    }
    suppressStaleUntilRef.current = Date.now() + 1000; // prevent immediate stale marking
    if (!enableMapBboxFilter) {
      dispatch(setEnableMapBboxFilter(true));
    }
    dispatch(setSearchBbox(getCurrentMapBbox()));
    setBboxStale(false);
    setBboxFilterLabel("Showing results in this area");
    if (pendingGeocodeRef.current) {
      dispatch(setGeocodeFeature(pendingGeocodeRef.current));
      pendingGeocodeRef.current = null;
    }
  };

  const handleBboxFilterToggle = () => {
    if (!mapLoaded) return;
    if (!enableMapBboxFilter && searchBbox !== null) {
      dispatch(setSearchBbox(null));
    }
  };
  useEffect(handleBboxFilterToggle, [dispatch, mapLoaded, enableMapBboxFilter, searchBbox]);

  const handlePreviewIds = () => {
    if (!mapLoaded) return;
    const map = mapRef.current;
    map.getStyle().layers.map((lyr) => {
      if (lyr.id.startsWith("herop-")) {
        map.removeLayer(lyr.id);
      }
    });

    const lookup = {
      "040": "state-2018",
      "050": "county-2018",
      "140": "tract-2018",
      "150": "bg-2018",
      "860": "zcta-2018",
    };

    previewLyrs.map((previewLyr) => {
      // Just look at first id here (we shouldn't see minus mixed with non-minus)
      const firstId = previewLyr.filterIds[0];
      const operator = firstId.startsWith("-") ? "all" : "any";
      let clauses: FilterSpecification[] = [];
      previewLyr.filterIds.forEach((id: string) => {
        if (id.startsWith("-") && id.endsWith("*")) {
          // Wildcard excludes - exclude any IDs that match the wildcard if it starts with "-"
          clauses.push([
            "!=",
            ["slice", ["get", "HEROP_ID"], 0, id.length - 2],
            id.slice(1, -1),
          ]);
        } else if (id.startsWith("-") && !id.endsWith("*")) {
          // Excludes - exclude any IDs that start with "-"
          clauses.push(["!=", ["get", "HEROP_ID"], id.slice(1, id.length)]);
        } else if (!id.startsWith("-") && id.endsWith("*")) {
          // Wildcards - "*" on the end works as a wildcard match
          clauses.push([
            "==",
            ["slice", ["get", "HEROP_ID"], 0, id.length - 1],
            id.slice(0, -1),
          ]);
        } else {
          // Other values are exact matches
          // These are handled below in bulk
        }
      });

      // Other values are exact matches
      const exactMatches = previewLyr.filterIds.filter(
        (id: string) => !id.startsWith("-") && !id.endsWith("*")
      );
      if (exactMatches.length) {
        clauses.push(["in", ["get", "HEROP_ID"], ["literal", exactMatches]]);
      }

      const expression = [operator, ...clauses];

      const source = firstId.startsWith("-")
        ? lookup[firstId.slice(1, 4)]
        : lookup[firstId.slice(0, 3)];

      const previewLyrs = makePreviewLyrs(
        previewLyr.lyrId,
        source,
        expression as any
      );

      // determine where in the layer stack to add the preview layers.
      // they must be before any overlay clusters for the best presentation.
      // get list of all currently visible overlay ids
      const currentOverlayLayerIds = overlayIds
        .map((overlayName) => {
          return overlayRegistry[overlayName].layers.map(
            (layer) => layer.spec.id
          );
        })
        .flat();

      // find the first overlay id in the overall list of map layers.
      // if no overlays, this will be undefined.
      const firstOverlay = map.getStyle().layers.find(function (lyr) {
        return currentOverlayLayerIds.includes(lyr.id);
      });

      // get the id of the first overlay, if exists, otherwise default to "Ocean labels"
      const addBefore = firstOverlay ? firstOverlay.id : "Ocean labels";

      // now add the preview layers to the map
      previewLyrs.forEach((lyr) => {
        map.addLayer(lyr, addBefore);
      });
    });
  };
  useEffect(handlePreviewIds, [mapLoaded, previewLyrs, overlayIds]);

  const handleOverlayInteraction = () => {
    if (!mapLoaded) return;

    const map = mapRef.current;
    const mapLyrIds = map.getStyle().layers.map((lyr) => lyr.id);

    overlayIds.forEach((lyr) => {
      if (overlayRegistry[lyr]) {
        overlayRegistry[lyr].layers.forEach((lyrDef) => {
          if (!mapLyrIds.includes(lyrDef.spec.id)) {
            map.addLayer(lyrDef.spec, lyrDef.addBefore);

            // Change the cursor to a pointer when the mouse is over this layer.
            map.on("mouseenter", lyrDef.spec.id, () => {
              map.getCanvas().style.cursor = "pointer";
            });

            // Change it back to a default style when it leaves.
            map.on("mouseleave", lyrDef.spec.id, () => {
              map.getCanvas().style.cursor = "default";
            });

            // set the click handling for the cluster layer
            if (lyrDef.spec.id.endsWith("-clusters")) {
              map.on("click", lyrDef.spec.id, async (e) => {
                const features = map.queryRenderedFeatures(e.point, {
                  layers: [lyrDef.spec.id],
                });
                map.easeTo({
                  center: features[0].toJSON().geometry.coordinates,
                  zoom: map.getZoom() + 1,
                });
              });
            }
            // set the click handling for the non-clustered or label layer, this sets the pop content
            else if (
              !lyrDef.spec.id.includes("-clustered") &&
              !lyrDef.spec.id.includes("-cluster-count")
            ) {
              map.on("click", lyrDef.spec.id, async (e) => {
                const features = map.queryRenderedFeatures(e.point, {
                  layers: [lyrDef.spec.id],
                });
                const props = features[0].properties || {};
                setPopupInfo({
                  longitude: features[0].geometry["coordinates"][0],
                  latitude: features[0].geometry["coordinates"][1],
                  props: props,
                  overlayKey: lyr,
                });
              });
            }
          }
        });
      }
    });
    for (const [key, data] of Object.entries(overlayRegistry)) {
      data.layers.forEach((lyrDef) => {
        if (mapLyrIds.includes(lyrDef.spec.id) && !overlayIds.includes(key)) {
          map.removeLayer(lyrDef.spec.id);
        }
      });
    }
  };
  useEffect(handleOverlayInteraction, [overlayIds, mapLoaded]);

  const handlePopup = () => {
    if (!mapRef.current) return;
    if (!popup) {
      const popupInstance = new Popup({
        closeButton: false,
        className: "asset-popup",
        offset: 15,
        anchor: "bottom",
      });
      if (!styleInjectedRef.current) {
        const style = document.createElement("style");
        style.id = "asset-popup-styles";
        style.innerHTML = `
          .asset-popup { z-index: 99999 !important; }
          .asset-popup .maplibregl-popup-content { background: transparent !important; padding: 0 !important; box-shadow: none !important; }
          .asset-popup .maplibregl-popup-tip { border-top-color: white !important; border-bottom-color: white !important; }
        `;
        document.head.appendChild(style);
        styleInjectedRef.current = true;
      }
      popupInstance.addTo(mapRef.current);
      setPopup(popupInstance);
      return;
    }
    if (popupInfo) {
      if (popupRootRef.current) {
        popupRootRef.current.unmount();
        popupRootRef.current = null;
        popupContainerRef.current = null;
      }
      const container = document.createElement("div");
      popupContainerRef.current = container;
      const root = createRoot(container);
      popupRootRef.current = root;
      const overlayKey = popupInfo.overlayKey;
      const overlayMeta = overlayRegistry[overlayKey] || {};
      root.render(
        <AssetPopupComponent
          props={popupInfo.props}
          overlayKey={overlayKey}
          overlayColor={overlayMeta.mainColor}
          overlayDescription={overlayMeta.description}
          fullConfig={fullConfig}
        />
      );
      popup
        .setLngLat([popupInfo.longitude, popupInfo.latitude])
        .setDOMContent(container);
      popup.addTo(mapRef.current);
    } else {
      if (popupRootRef.current) {
        popupRootRef.current.unmount();
        popupRootRef.current = null;
      }
      if (popup) popup.remove();
    }
  };
  useEffect(handlePopup, [popupInfo, popup]);

  useEffect(() => {
    if (popupInfo && !overlayIds.includes(popupInfo.overlayKey)) {
      setPopupInfo(null);
    }
  }, [overlayIds, popupInfo]);

  const handleGeocodeFeatureDisplay = () => {
    if (!mapLoaded) return;

    const highlightSource = mapRef.current.getSource(
      "geoSearchHighlight"
    ) as GeoJSONSource;

    // start by clearing the highlight source data
    highlightSource.setData({ type: "FeatureCollection", features: [] });

    // add an inverted boundary if the geocode feature has a polygon
    if (geocodeFeature) {
      if (
        geocodeFeature.geometry["type"] == "MultiPolygon" ||
        geocodeFeature.geometry["type"] == "Polygon"
      ) {
        let feat = turf.feature(geocodeFeature.geometry);
        let diffGeom = turf.difference(
          turf.featureCollection([
            turf.polygon([
              [
                [180, 90],
                [-180, 90],
                [-180, -90],
                [180, -90],
                [180, 90],
              ],
            ]),
            feat,
          ])
        );
        highlightSource.setData(diffGeom);
      }
    }
  };
  useEffect(handleGeocodeFeatureDisplay, [geocodeFeature, mapLoaded]);

  // zoom to geocode feature when it changes, button appears but no search
  const handleGeocodeFeatureZoom = () => {
    if (!mapLoaded) return;
    if (geocodeFeature) {
      suppressStaleUntilRef.current = Date.now() + 1000; // prevent immediate stale marking
      dispatch(setShowBboxFilter(true));
      if (!enableMapBboxFilterRef.current) {
        setBboxFilterLabel("Show results in this area");
        setBboxStale(true);
      }
      mapRef.current.fitBounds(geocodeFeature.bbox, { padding: 40 });
      dispatch(setEnableMapBboxFilter(true));
    } else {
      mapRef.current.fitBounds(props.initialBounds, { padding: 40 });
      dispatch(setShowBboxFilter(false));
      dispatch(setEnableMapBboxFilter(false));
      setTimeout(() => {
        mapRef.current.once("moveend", () => {
          dispatch(setShowBboxFilter(true));
        });
      }, 1000); // how long to wait before re-showing the button after clearing the geocode feature. I use 1 second here in case user want to immediately try the map
    }
  };
  // don't include props.initialBounds here because it causes unwanted re-zooming
  useEffect(handleGeocodeFeatureZoom, [dispatch, geocodeFeature, mapLoaded]);

  const isPointWithinUS = useCallback((lng: number, lat: number) => {
    return (
      lng >= US_BOUNDS.minLng &&
      lng <= US_BOUNDS.maxLng &&
      lat >= US_BOUNDS.minLat &&
      lat <= US_BOUNDS.maxLat
    );
  }, []);

  const handleMapLabelClick = useCallback(
    async (placeName: string, clickLngLat: { lng: number; lat: number }) => {
      if (!placeName || !mapRef.current) return;

      if (!isPointWithinUS(clickLngLat.lng, clickLngLat.lat)) return;

      config.apiKey = apiKey;

      try {
        const result = await geocoding.forward(placeName, {
          country: ["us"],
          types: [
            "country",
            "region",
            "subregion",
            "county",
            "municipality",
            "municipal_district",
            "locality",
          ],
          proximity: [clickLngLat.lng, clickLngLat.lat],
          limit: 1,
        });

        if (result.features && result.features.length > 0) {
          const feature = result.features[0];
          if (feature.bbox) {
            mapRef.current.fitBounds(feature.bbox as LngLatBoundsLike, {
              padding: 40,
            });
            // Map label click → stores geocode, waits for button click in handleBboxFilterButton without search yet
            pendingGeocodeRef.current = {
              label: feature.place_name,
              bbox: feature.bbox,
              geometry: feature.geometry,
            };
            dispatch(setShowBboxFilter(true));
          }
        }
      } catch (error) {
        console.error("Error geocoding label click:", error);
      }
    },
    [dispatch, isPointWithinUS]
  );

  const initMap = () => {
    if (mapRef.current) return; // stops map from intializing more than once

    mapRef.current = new Map({
      container: mapDivRef.current,
      style: `https://api.maptiler.com/maps/3d4a663a-95c3-42d0-9ee6-6a4cce2ba220/style.json?key=${apiKey}`,
      bounds: props.initialBounds,
      attributionControl: { compact: true },
      dragRotate: false,
      touchPitch: false,
      touchZoomRotate: false,
    });

    const nav = new NavigationControl({
      showCompass: false,
    });
    mapRef.current.addControl(nav);

    const scale = new ScaleControl({
      maxWidth: 80,
      unit: "imperial",
    });
    mapRef.current.addControl(scale);

    mapRef.current.getCanvas().style.cursor = "default";

    // final callback to be run after the map element has been fully loaded.
    mapRef.current.on("load", () => {
      // add sources and layers to the map to be used to display geocode selection
      mapRef.current.addSource("geoSearchHighlight", {
        type: "geojson",
        data: null,
      });
      mapRef.current.addLayer({
        id: "geoSearchHighlightLyr-fill",
        type: "fill",
        source: "geoSearchHighlight",
        paint: {
          "fill-color": "#000",
          "fill-opacity": 0.1,
        },
      });
      mapRef.current.addLayer({
        id: "geoSearchHighlightLyr-line",
        type: "line",
        source: "geoSearchHighlight",
        paint: {
          "line-width": ["case", ["==", ["geometry-type"], "Polygon"], 2, 3],
          "line-dasharray": [1, 1],
          "line-color": "#FF9C77",
        },
      });

      // add all community asset overlay sources to the map
      for (const [key, data] of Object.entries(overlayRegistry)) {
        mapRef.current.addSource(
          data.source.id,
          overlayRegistry[key].source.spec
        );
      }

      // add all preview sources to the map
      previewSources.map((src) => {
        mapRef.current.addSource(src.id, src.spec);
      });

      // change the border color and text color of the scale control
      const scaleControlEl = document.getElementsByClassName(
        "maplibregl-ctrl-scale"
      )[0];
      if (scaleControlEl) {
        (scaleControlEl as HTMLElement).style.borderColor = "#AAAAAA";
        (scaleControlEl as HTMLElement).style.color = "#444444";
        (scaleControlEl as HTMLElement).style.fontFamily = "Nunito, sans-serif";
      }

      // change the icon that zoom control uses addIcon and minusIcon
      const zoomInButton = document
        .getElementsByClassName("maplibregl-ctrl-zoom-in")[0]
        ?.getElementsByClassName("maplibregl-ctrl-icon")[0];
      const zoomOutButton = document
        .getElementsByClassName("maplibregl-ctrl-zoom-out")[0]
        ?.getElementsByClassName("maplibregl-ctrl-icon")[0];
      if (zoomInButton && zoomOutButton) {
        const zoomIconColor = "#AAAAAA";
        const zoomIconSvg = (path: string) =>
          `url("data:image/svg+xml,${encodeURIComponent(
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="${zoomIconColor}" d="${path}"/></svg>`
          )}")`;
        const zoomInEl = zoomInButton as HTMLElement;
        const zoomOutEl = zoomOutButton as HTMLElement;
        zoomInEl.style.backgroundSize = "1rem 1rem";
        zoomOutEl.style.backgroundSize = "1rem 1rem";
        zoomInEl.style.backgroundRepeat = "no-repeat";
        zoomOutEl.style.backgroundRepeat = "no-repeat";
        zoomInEl.style.backgroundPosition = "center";
        zoomOutEl.style.backgroundPosition = "center";
        zoomInEl.style.backgroundImage = zoomIconSvg(
          "M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z"
        );
        zoomOutEl.style.backgroundImage = zoomIconSvg("M19 13H5V11H19V13Z");
      }

      // force the attribution control to use compact mode after initial load
      const attributionControlEl = document.getElementsByClassName(
        "maplibregl-ctrl-attrib-button"
      )[0];
      if (attributionControlEl) {
        const attribBtn = attributionControlEl as HTMLElement;
        attribBtn.style.backgroundImage = "url('/icons/map_info.svg')";
        attribBtn.style.backgroundRepeat = "no-repeat";
        attribBtn.style.backgroundPosition = "center";
        attribBtn.style.visibility = "visible";
        const attribEl = attribBtn.closest(
          ".maplibregl-ctrl-attrib"
        ) as HTMLElement | null;
        if (attribEl) {
          attribEl.classList.add("maplibregl-compact");
          attribEl.classList.remove("maplibregl-compact-show");
          try {
            (attribEl as HTMLDetailsElement).open = false;
          } catch (e) {}
          attribEl.removeAttribute("open");
        }
      }

      const styleLayers = mapRef.current.getStyle().layers;
      const labelLayerIds = styleLayers
        .filter((layer) => {
          if (layer.type !== "symbol") return false;
          const layerId = layer.id.toLowerCase();
          return LABEL_LAYER_PATTERNS.some((pattern) =>
            layerId.includes(pattern.toLowerCase())
          );
        })
        .map((layer) => layer.id);

      mapRef.current.on("click", (e) => {
        if (labelLayerIds.length === 0) return;

        const features = mapRef.current.queryRenderedFeatures(e.point, {
          layers: labelLayerIds,
        });

        if (features.length > 0) {
          const feature = features[0];
          const placeName =
            feature.properties?.name ||
            feature.properties?.name_en ||
            feature.properties?.["name:en"];
          if (placeName) {
            handleMapLabelClick(placeName, {
              lng: e.lngLat.lng,
              lat: e.lngLat.lat,
            });
          }
        }
      });

      labelLayerIds.forEach((layerId) => {
        mapRef.current.on("mouseenter", layerId, (e) => {
          if (isPointWithinUS(e.lngLat.lng, e.lngLat.lat)) {
            mapRef.current.getCanvas().style.cursor = "pointer";
          }
        });
        mapRef.current.on("mousemove", layerId, (e) => {
          if (isPointWithinUS(e.lngLat.lng, e.lngLat.lat)) {
            mapRef.current.getCanvas().style.cursor = "pointer";
          } else {
            mapRef.current.getCanvas().style.cursor = "default";
          }
        });
        mapRef.current.on("mouseleave", layerId, () => {
          mapRef.current.getCanvas().style.cursor = "default";
        });
      });

      // finally set the map loaded state to true to enable other map interactions
      setMapLoaded(true);
    });
  };
  useEffect(initMap, [
    props.initialBounds,
    handleMapLabelClick,
    isPointWithinUS,
  ]);

  return (
    <>
      {overlayIds.length > 0 && (
        <div style={{ marginBottom: ".5em" }}>
          <div
            style={{
              display: "flex",
              gap: "0.5em",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <span style={{ marginRight: ".25em" }}>Showing:</span>
            {overlayIds.map((id, index) => {
              return (
                <div
                  key={index}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: ".5em",
                    padding: ".35em .6em",
                    borderRadius: "0.5rem",
                    background: "white",
                    border: `1px solid ${fullConfig.theme.colors["salmonpink"]}`,
                    fontFamily: fullConfig.theme.fontFamily["sans"],
                    fontSize: ".9em",
                  }}
                >
                  <svg
                    height="14"
                    width="14"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      r="6"
                      cx="7"
                      cy="7"
                      fill={overlayRegistry[id].mainColor}
                    />
                  </svg>
                  <span>{id}</span>
                  <button
                    type="button"
                    onClick={() =>
                      dispatch(
                        setOverlayIds(overlayIds.filter((k) => k !== id))
                      )
                    }
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
                </div>
              );
            })}
            <button
              style={{
                color: fullConfig.theme.colors["frenchviolet"],
                fontWeight: "700",
                background: "transparent",
                border: "none",
                cursor: "pointer",
              }}
              onClick={() => {
                dispatch(setOverlayIds([]));
              }}
            >
              Clear all
            </button>
          </div>
        </div>
      )}
      <div
        style={{
          width: "100%",
          height: overlayIds.length > 0 ? "calc(100% - 2.5em)" : "100%",
          position: "relative",
        }}
      >
        <div ref={mapDivRef} style={{ width: "100%", height: "100%" }}>
          {mapLoaded && (
            <div style={{ marginTop: "1em", marginLeft: "1em" }}>
              <GeocodeControl
                apiKey={apiKey}
                onClear={() => {
                  setEnableMapBboxFilter(false);
                }}
              />
            </div>
          )}
        </div>
        {showBboxFilter && (
          <div
            style={{
              position: "absolute",
              bottom: "2em",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 10,
            }}
          >
            <button
              style={{
                background:
                  enableMapBboxFilter && !bboxStale ? "white" : "#FFE5C4",
                height: "fit-content",
                padding: ".5em 1em",
                borderRadius: "8px",
                border: `1px solid ${fullConfig.theme.colors["salmonpink"]}`,
              }}
              onClick={handleBboxFilterButton}
            >
              <span>
                <LocationOnIcon
                  style={{
                    verticalAlign: "middle",
                    marginRight: ".2em",
                    color: fullConfig.theme.colors["frenchviolet"],
                  }}
                />
                {bboxFilterLabel}
              </span>
              {enableMapBboxFilter && !bboxStale && (
                <span
                  style={{
                    marginLeft: "2em",
                    fontWeight: "700",
                    color: fullConfig.theme.colors["frenchviolet"],
                  }}
                >
                  Clear
                </span>
              )}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
