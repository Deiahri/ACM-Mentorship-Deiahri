// written in JS because typing is such an issue with redux
import { createSlice, Draft, PayloadAction } from "@reduxjs/toolkit";
import { ClientSocketState } from "./ClientSocket";



type ClientSocketUserData = {
  id?: string,
  username?: string,
  fName?: string
  mName?: string
  lName?: string
};

type ClientSocketUserMap = {
  [key: string]: ClientSocketUserData
}

interface ClientSocketRootState {
  state?: ClientSocketState,
  users?: ClientSocketUserMap,
  userID?: string
};

const initialState: ClientSocketRootState = {};

const ClientSocketSlice = createSlice({
  name: "ServerConnection",
  initialState: initialState,
  reducers: {
    setClientState(s: Draft<ClientSocketRootState>, action: PayloadAction<ClientSocketState>) {
      s.state = action.payload;
    },
    setClientUsers(s: Draft<ClientSocketRootState>, action: PayloadAction<ClientSocketUserMap>) {
      s.users = action.payload;
    },
    setClientUserID(s: Draft<ClientSocketRootState>, action: PayloadAction<string>) {
      s.userID = action.payload;
    },
    // closeDialog(state: Draft<DialogState>) {
    //     state.active = false;
    // }
  },
});

export const { setClientState, setClientUsers, setClientUserID } = ClientSocketSlice.actions;
export default ClientSocketSlice.reducer;
