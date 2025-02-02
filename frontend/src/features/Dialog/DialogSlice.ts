// written in JS because typing is such an issue with redux
import { createSlice, Draft, PayloadAction } from "@reduxjs/toolkit";

export type DialogInputType = 'number' | 'text' | 'email' | 'select';
export type DialogInput = {
  label: string,
  type: DialogInputType,
  selectOptions?: string[] | boolean[] | number[],
  inputStyle?: React.CSSProperties,
  labelStyle?: React.CSSProperties,
  containerStyle?: React.CSSProperties,
  initialValue?: string | number | undefined | boolean,
  placeholder?: string,
  disabled?: boolean
}

export type DialogButton = {
  text?: string,
  onClick?: (...args: any[]) => any,
  style?: React.CSSProperties,

  /**
   * If true, the onClick will receive all the input states + am enable button function.
   * 
   * Useful if you want button to be disabled until something happens.
   */
  useDisableTill?: boolean
};

export interface SetDialogObject {
  containerStyle?: React.CSSProperties,
  overlayStyle?: React.CSSProperties,
  title?: string,
  titleStyle?: React.CSSProperties,
  subtitle?: string,
  subTitleStyle?: React.CSSProperties,
  buttons?: DialogButton[],
  buttonContainerStyle?: React.CSSProperties,
  inputs?: DialogInput[]
};

interface DialogState extends SetDialogObject {
  active?: boolean
};

const initialState: DialogState = {};

const DialogSlice = createSlice({
  name: "ServerConnection",
  initialState: initialState,
  reducers: {
    setDialog(_: Draft<DialogState>, action: PayloadAction<SetDialogObject>) {
      return { ...action.payload, active: true } as DialogState;
    },
    closeDialog(state: Draft<DialogState>) {
        state.active = false;
    }
  },
});

export const { setDialog, closeDialog } = DialogSlice.actions;
export default DialogSlice.reducer;
