import React, { useState, useEffect } from 'react';

import { useDispatch, useSelector } from "react-redux";
import { setGeocodeFeature } from "@/store/slices/mapSlice";
import { setSearchBbox, setEnableMapBboxFilter } from "@/store/slices/searchSlice";
import { AppDispatch, RootState } from "@/store";

import { config, geocoding } from '@maptiler/client';

interface Props {
  apiKey: string;
  onClear: () => void;
}

export default function GeocodeControl(props: Props): JSX.Element {
  config.apiKey = props.apiKey

  const dispatch = useDispatch<AppDispatch>();
  const { geocodeFeature } = useSelector((state: RootState) => state.map);

  const [geocodeResults, setGeocodeResults] = useState([])

  const handleInputChange = (event) => {
    const inputVal = event.target.value;

    if (inputVal.length && inputVal.length >= 2) {
      (async () => {
        const result = await geocoding.forward(inputVal, {
          country: ["us"],
          types: ["region", "county", "postal_code", "municipality", "municipal_district", "joint_municipality", "joint_submunicipality", "locality", "neighbourhood"],
        });
        setGeocodeResults(result.features)
      })()
    }
  };

  const handleSelectFromResultList = (item) => {
    (async () => {
      const resultById = await geocoding.forward(item.id, {
        country: ["us"],
        types: ["region", "county", "postal_code", "municipality", "municipal_district", "joint_municipality", "joint_submunicipality", "locality", "neighbourhood"],
      });
      const selectedPlace = resultById.features[0]
      dispatch(setGeocodeFeature({
        "label": selectedPlace.place_name,
        "bbox": selectedPlace.bbox,
        "geometry": selectedPlace.geometry
      }))
      setGeocodeResults([])
    })()
  }

  useEffect(() => {
    if (geocodeFeature) {
      (document.getElementById("geocode-input") as HTMLInputElement).value = geocodeFeature.label;
    } else {
      (document.getElementById("geocode-input") as HTMLInputElement).value = "";
    }
  }, [geocodeFeature])

  const handleClearGeocode = () => {
    props.onClear()
    dispatch(setGeocodeFeature(null))
    dispatch(setSearchBbox(null))
    dispatch(setEnableMapBboxFilter(false))
  }

  return <div className="maplibregl-ctrl geocode-ctrl">
    <div style={{backgroundColor:"rgba(255,255,255,.9)", width: "250px"}}>
      <input id="geocode-input" style={{width: "230px", border:"none", background:"none"}} type="text" onChange={handleInputChange} />
      <button id="clearButton" style={{width: "20px"}} onClick={handleClearGeocode}>
        {geocodeFeature && (
          "X"
        )}
      </button>
    </div>
    {geocodeResults.length > 0 && (
    <div style={{marginTop: "1em", backgroundColor:"rgba(255,255,255,.9)", width:"250px"}}>
      <ul>
      {geocodeResults.map((item, index) => {
          return <li key={index} >
            <button onClick={() => handleSelectFromResultList(item)}>
            {item.place_name}
          </button>
        </li>
      })}
      </ul>
    </div>
    )}
  </div>
}
