import { createSlice } from "@reduxjs/toolkit";

interface MapPreviewLyr {
  lyrId: string;
  filterIds: string[];
}

interface MapState {
  previewLyrs: MapPreviewLyr[];
  overlayIds: string[];
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
    setShowBboxFilter: (state, action) => {
      state.showBboxFilter = action.payload
    }
  },
});

export const {
  setPreviewLyrs,
  setOverlayIds,
  setGeocodeFeature,
  setShowBboxFilter,
} = mapSlice.actions;

export default mapSlice.reducer;
