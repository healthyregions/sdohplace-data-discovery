import { configureStore } from "@reduxjs/toolkit";
import searchReducer from "./slices/searchSlice";
import uiReducer from "./slices/uiSlice";
import mapReducer from "./slices/mapSlice";
import { createMiddleware } from "@/middleware/createMiddleware";

export const store = configureStore({
  reducer: {
    search: searchReducer,
    ui: uiReducer,
    map: mapReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(createMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
