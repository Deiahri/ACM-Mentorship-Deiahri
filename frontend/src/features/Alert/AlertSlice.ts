// written in JS because typing is such an issue with redux
import { createSlice, Draft, PayloadAction } from "@reduxjs/toolkit";

type AlertMessage = {
  title?: string;
  body?: string;
};
interface AlertState {
  active: boolean;
  message?: AlertMessage;
}
const initialState: AlertState = {
  active: false,
  message: {
    title: 'test',
    body: 'test message.'
  },
};

const AlertSlice = createSlice({
  name: "ServerConnection",
  initialState: initialState,
  reducers: {
    setAlert(state: Draft<AlertState>, action: PayloadAction<AlertMessage>) {
      state.message = action.payload;
      state.active = true;
    },
    closeAlert(state: Draft<AlertState>) {
        state.active = false;
    }
  },
});

export const { setAlert, closeAlert } = AlertSlice.actions;
export default AlertSlice.reducer;
