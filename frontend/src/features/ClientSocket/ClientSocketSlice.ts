// written in JS because typing is such an issue with redux
import { createSlice, Draft, PayloadAction } from "@reduxjs/toolkit";
import { ClientSocketState } from "./ClientSocket";
import { ObjectAny } from "../../scripts/types";

type ClientSocketUserData = {
  id?: string;
  username?: string;
  fName?: string;
  mName?: string;
  lName?: string;
  socials: string[];
  experience: ObjectAny[];
  education: ObjectAny[];
  certifications: ObjectAny[];
  projects: ObjectAny[];
  softSkills: string[];
};

type ClientSocketMentorshipRequest = {
  mentorID: string;
  menteeID: string;
};

type ClientSocketMentorshipRequestMap = {
  [key: string]: ClientSocketMentorshipRequest;
};

interface ClientSocketRootState {
  state?: ClientSocketState;
  user?: ClientSocketUserData;
  assessments?: string[];
  mentorshipRequests?: ClientSocketMentorshipRequestMap;
}

const initialState: ClientSocketRootState = {};

const ClientSocketSlice = createSlice({
  name: "ServerConnection",
  initialState: initialState,
  reducers: {
    setClientState(
      s: Draft<ClientSocketRootState>,
      action: PayloadAction<ClientSocketState>
    ) {
      s.state = action.payload;
    },
    setClientUser(
      s: Draft<ClientSocketRootState>,
      action: PayloadAction<ClientSocketUserData>
    ) {
      s.user = action.payload;
    },
    setClientAssessments(
      s: Draft<ClientSocketRootState>,
      action: PayloadAction<string[]>
    ) {
      s.assessments = action.payload;
    },
    setMentorshipRequests(
      s: Draft<ClientSocketRootState>,
      action: PayloadAction<ClientSocketMentorshipRequestMap>
    ) {
      s.mentorshipRequests = action.payload;
    },
    // closeDialog(state: Draft<DialogState>) {
    //     state.active = false;
    // }
  },
});

export const {
  setClientState,
  setClientUser,
  setClientAssessments,
  setMentorshipRequests,
} = ClientSocketSlice.actions;

export default ClientSocketSlice.reducer;
