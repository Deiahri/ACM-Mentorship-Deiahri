import { createSlice } from "@reduxjs/toolkit";

interface AIResumeProfileButtonState {
  isGenerating: boolean;
  timeoutEnd?: number;
};

const initialState: AIResumeProfileButtonState = {
  isGenerating: false,
  timeoutEnd: undefined,
};

export const AIResumeProfileButtonSlice = createSlice({
  name: "AIResumeProfileButton",
  initialState,
  reducers: {
    setAIResumeProfileButtonIsGenerating: (state, action) => {
      state.isGenerating = action.payload;
    },
    setAIResumeProfileButtonTimeoutEnd: (state, action) => {
      state.timeoutEnd = action.payload;
    },
  },
});

export const { setAIResumeProfileButtonIsGenerating, setAIResumeProfileButtonTimeoutEnd } = AIResumeProfileButtonSlice.actions;
export default AIResumeProfileButtonSlice.reducer;
