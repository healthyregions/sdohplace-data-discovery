import { createSlice } from "@reduxjs/toolkit";

interface MapPreviewLyr {
  lyrId: string;
  filterIds: string[];
}

interface MapState {
  previewLyrs: MapPreviewLyr[];
  overlayIds: string[];
  mapBbox: [number, number, number, number] | null;
  geocodeFeature: {
    'label': string,
    'bbox': [number, number, number, number],
    'geometry': any,
  } | null;
  showBboxFilter: boolean;
}

const initialState: MapState = {
  previewLyrs: [],
  overlayIds: [],
  mapBbox: [ -125.332, 23.899, -65.742, 49.432],
  geocodeFeature: null,
  showBboxFilter: false
};

const mapSlice = createSlice({
  name: "map",
  initialState,
  reducers: {
    setPreviewLyrs: (state, action) => {
      state.previewLyrs = action.payload;
    },
    setOverlayIds: (state, action) => {
      state.overlayIds = action.payload;
    },
    setGeocodeFeature: (state, action) => {
      state.geocodeFeature = action.payload;
    },
    setMapBbox: (state, action) => {
      state.mapBbox = action.payload;
    },
    setShowBboxFilter: (state, action) => {
      state.showBboxFilter = action.payload
    }
  },
});

export const {
  setPreviewLyrs,
  setOverlayIds,
  setGeocodeFeature,
  setMapBbox,
  setShowBboxFilter,
} = mapSlice.actions;

export default mapSlice.reducer;
