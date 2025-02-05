import { configureStore } from "@reduxjs/toolkit";
import DialogSlice from './features/Dialog/DialogSlice';
import ClientSocketSlice from './features/ClientSocket/ClientSocketSlice';

export const store = configureStore({
  reducer: {
    Dialog: DialogSlice,
    ClientSocket: ClientSocketSlice
  },
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware({
      serializableCheck: false, // Completely disable serializability checks
    });
  }
});

export type AppDispatch = typeof store.dispatch;
export type ReduxRootState = ReturnType<typeof store.getState>;
