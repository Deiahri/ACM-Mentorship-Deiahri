// written in JS because typing is such an issue with redux
import { createSlice, Draft, PayloadAction } from "@reduxjs/toolkit";
import { ClientSocketState, ClientSocketUser } from "./ClientSocket";
import { AssessmentQuestion } from "../../scripts/types";

type ClientSocketMentorshipRequest = {
  mentorID: string;
  menteeID: string;
};

type ClientSocketMentorshipRequestMap = {
  [key: string]: ClientSocketMentorshipRequest;
};

interface ClientSocketRootState {
  state?: ClientSocketState;
  user?: ClientSocketUser;
  assessments?: string[];
  mentorshipRequests?: ClientSocketMentorshipRequestMap;
  availableAssessmentQuestions?: AssessmentQuestion[];
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
      action: PayloadAction<ClientSocketUser>
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
    setAvailableAssessmentQuestions(
      s: Draft<ClientSocketRootState>,
      action: PayloadAction<AssessmentQuestion[]>
    ) {
      s.availableAssessmentQuestions = action.payload;
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
  setAvailableAssessmentQuestions,
} = ClientSocketSlice.actions;

export default ClientSocketSlice.reducer;
