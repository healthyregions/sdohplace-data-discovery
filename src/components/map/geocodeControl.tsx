import React, { useState, useEffect, useRef } from 'react';

import { useDispatch, useSelector } from "react-redux";
import { setGeocodeFeature } from "@/store/slices/mapSlice";
import { setSearchBbox, setEnableMapBboxFilter } from "@/store/slices/searchSlice";
import { AppDispatch, RootState } from "@/store";

import { config, geocoding } from '@maptiler/client';

import {
  LocationSearchInput,
  LocationSearchDropdown,
  LocationResult,
} from './locationSearch';

interface Props {
  apiKey: string;
  onClear: () => void;
}

export default function GeocodeControl(props: Props): JSX.Element {
  config.apiKey = props.apiKey;

  const dispatch = useDispatch<AppDispatch>();
  const { geocodeFeature } = useSelector((state: RootState) => state.map);

  const [inputValue, setInputValue] = useState('');
  const [geocodeResults, setGeocodeResults] = useState<LocationResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);

    if (value.length >= 2) {
      try {
        const result = await geocoding.forward(value, {
          country: ["us"],
          types: ["region", "county", "postal_code", "municipality", "municipal_district", "joint_municipality", "joint_submunicipality", "locality", "neighbourhood"],
        });
        setGeocodeResults(result.features as LocationResult[]);
        setShowDropdown(true);
        setHasSearched(true);
      } catch (error) {
        console.error('Geocoding error:', error);
        setGeocodeResults([]);
        setHasSearched(true);
      }
    } else {
      setGeocodeResults([]);
      setShowDropdown(false);
      setHasSearched(false);
    }
  };

  const handleSelectFromResultList = async (item: LocationResult) => {
    try {
      const resultById = await geocoding.forward(item.id, {
        country: ["us"],
        types: ["region", "county", "postal_code", "municipality", "municipal_district", "joint_municipality", "joint_submunicipality", "locality", "neighbourhood"],
      });
      const selectedPlace = resultById.features[0];

      dispatch(setGeocodeFeature({
        label: selectedPlace.place_name,
        bbox: selectedPlace.bbox,
        geometry: selectedPlace.geometry,
      }));

      setInputValue(selectedPlace.place_name);
      setGeocodeResults([]);
      setShowDropdown(false);
    } catch (error) {
      console.error('Selection error:', error);
    }
  };

  const handleFocus = () => {
    if (geocodeResults.length > 0) {
      setShowDropdown(true);
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      setShowDropdown(false);
    }, 200);
  };

  const handleClearGeocode = () => {
    setInputValue('');
    setGeocodeResults([]);
    setShowDropdown(false);
    setHasSearched(false);
    props.onClear();
    dispatch(setGeocodeFeature(null));
    dispatch(setSearchBbox(null));
    dispatch(setEnableMapBboxFilter(false));
  };

  useEffect(() => {
    if (geocodeFeature) {
      setInputValue(geocodeFeature.label);
    } else {
      setInputValue('');
    }
  }, [geocodeFeature]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={containerRef} className="maplibregl-ctrl geocode-ctrl relative">
      <LocationSearchInput
        ref={inputRef}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onClear={handleClearGeocode}
        showClearButton={!!geocodeFeature || inputValue.length > 0}
        placeholder="Search location..."
      />
      <LocationSearchDropdown
        results={geocodeResults}
        onSelect={handleSelectFromResultList}
        visible={showDropdown}
        showNoResults={hasSearched}
      />
    </div>
  );
}
