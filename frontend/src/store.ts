import { configureStore } from "@reduxjs/toolkit";
import DialogSlice from './features/Dialog/DialogSlice';

export const store = configureStore({
  reducer: {
    Dialog: DialogSlice
  },
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware({
      serializableCheck: false, // Completely disable serializability checks
    });
  }
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
