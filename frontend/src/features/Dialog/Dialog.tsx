import { useDispatch, useSelector } from "react-redux";
import { RootState } from '../../store';
import * as DialogRadix from "@radix-ui/react-dialog";
import { closeDialog, DialogButton, DialogInput } from "./DialogSlice";
import { useEffect, useState } from "react";
import { AnyObject } from '../../types';
import { XIcon } from 'lucide-react';

const DialogInputDefaultStyling: React.CSSProperties = {
  fontSize: "1rem",
  padding: 10,
  paddingLeft: 15,
  width: "15rem",
  boxSizing: "border-box",
  borderRadius: 10,
  border: "1px solid #0002",
};
export default function Dialog() {
  const {
    title,
    titleStyle,
    subtitle,
    subTitleStyle,
    buttons,
    buttonContainerStyle,
    inputs,
    active,
    containerStyle,
    overlayStyle
  } = useSelector((store: RootState) => store.Dialog);
  const [inputVals, setInputVals] = useState<AnyObject>({});
  const [disabledButtons, setDisabledButtons] = useState(Array.from({ length: buttons?.length || 0 }, () => false));
  const dispatch = useDispatch();

  // used to set initial values
  useEffect(() => {
    if (!inputs) {
      return;
    }
    const initialInputVals: AnyObject = {};
    for (let input of inputs) {
      if (!input.initialValue) {
        continue;
      }
      initialInputVals[input.label] = input.initialValue;
    }
    setInputVals(initialInputVals);
  }, [inputs]);

  function updateInputVal(key: string, val: unknown) {
    setInputVals({ ...inputVals, [key]: val });
  }

  function setButtonDisabled(btnIndex: number, disabled: boolean) {
    const disabledButtonsClone = [...disabledButtons];
    disabledButtonsClone[btnIndex] = disabled;
    setDisabledButtons(disabledButtonsClone);
  }

  function HandleForceClose() {
    dispatch(closeDialog());
  }

  // const dispatch = useDispatch();
  if (!active) {
    return;
  }
  // function HandleCloseDialog() {
  //   dispatch(closeAlert());
  // }

  // const { title, body } = message;

  return (
    <DialogRadix.Root open={true}>
      {/* <DialogRadix.Trigger asChild>
        <button className="Button violet">Edit profile</button>
      </DialogRadix.Trigger> */}
      <DialogRadix.Portal>
        <DialogRadix.Overlay
          style={{ inset: 0, backgroundColor: "#0001", position: "fixed", ...overlayStyle }}
        />
        <DialogRadix.Content
          className="DialogContent"
          style={{
            top: "50%",
            left: "50%",
            position: "fixed",
            transform: "translate(-50%, -50%)",
            backgroundColor: "white",
            padding: 30,
            borderRadius: 10,
            minWidth: 200,
            maxWidth: 600,
            border: "1px solid #0004",
            ...containerStyle
          }}
        >
          <XIcon style={{ position: 'absolute', top: 16, right: 16, cursor: 'pointer' }} onClick={HandleForceClose}/>
          <DialogRadix.Title className="DialogTitle" style={{ margin: 0, ...titleStyle }}>
            {title}
          </DialogRadix.Title>
          <DialogRadix.Description
            className="DialogDescription"
            style={{ margin: 0, ...subTitleStyle }}
          >
            {subtitle}
          </DialogRadix.Description>

          {inputs?.map((DialogInput: DialogInput, index) => {
            const { inputStyle, containerStyle, labelStyle, placeholder, disabled } = DialogInput;
            const typeIsSelect = DialogInput.type == "select";
            const OVRALL_Key = `DialogInput_${index}`;
            const DI_Key = DialogInput.label;
            const DI_Type = DialogInput.type;
            return (
              <div
                style={{ display: "flex", flexDirection: "column" }}
                key={OVRALL_Key}
              >
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "right",
                    alignItems: "center",
                    marginTop: 10,
                    marginBottom: 5,
                    ...containerStyle
                  }}
                >
                  <p style={{ margin: 0, marginRight: 20, ...labelStyle }}>
                    {DialogInput.label}
                  </p>
                  {!typeIsSelect && (
                    <input
                      value={inputVals[DI_Key] || ""}
                      onChange={(e) => updateInputVal(DI_Key, e.target.value)}
                      style={{...DialogInputDefaultStyling, ...inputStyle}}
                      type={DI_Type}
                      placeholder={placeholder?placeholder:DI_Key}
                      disabled={disabled}
                    />
                  )}
                  {typeIsSelect && (
                    <select
                      value={inputVals[DI_Key]}
                      onChange={(e) => updateInputVal(DI_Key, e.target.value)}
                      style={{...DialogInputDefaultStyling, ...inputStyle}}
                      disabled={disabled}
                    >
                      {DialogInput.selectOptions?.map(
                        (option: any, index) => {
                          return (
                            <option
                              value={`${option}`}
                              key={`${OVRALL_Key}_SelectOption_${index}`}
                            >
                              {option}
                            </option>
                          );
                        }
                      )}
                    </select>
                  )}
                </div>
              </div>
            );
          })}

          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              marginTop: 5,
              ...buttonContainerStyle,
            }}
          >
            {buttons?.map((DialogButton: DialogButton, btnIndex) => {
              if (Object.keys(DialogButton).length == 0) {
                return null;
              }
              
              const { useDisableTill } = DialogButton;
              const buttonDisabled = disabledButtons[btnIndex];
              return (
                <button
                  aria-label="Close"
                  style={{ border: "1px solid #0004", ...DialogButton.style, opacity: buttonDisabled ? 0.5:1 }}
                  disabled={buttonDisabled}
                  onClick={() => { 
                    // disables the button
                    useDisableTill && setButtonDisabled(btnIndex, true);

                    // calls the onclick + sends a enable callback if dialog button requires it.
                    DialogButton.onClick && DialogButton.onClick(inputVals, useDisableTill ? () => setButtonDisabled(btnIndex, false) : undefined);
                  }}
                  key={`DialogButton_${btnIndex}`}
                >
                  {DialogButton.text}
                </button>
              );
            })}
          </div>
        </DialogRadix.Content>
      </DialogRadix.Portal>
    </DialogRadix.Root>
  );
}
