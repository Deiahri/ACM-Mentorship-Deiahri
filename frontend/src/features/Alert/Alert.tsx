import { useDispatch, useSelector } from "react-redux";
import { ReduxRootState } from "../../store";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { closeAlert } from "./AlertSlice";

export default function Alert() {
  const { message, active } = useSelector((store: ReduxRootState) => store.Alert);
  const dispatch = useDispatch();
  if (!message || !active) {
    return;
  }
  function HandleCloseDialog() {
    dispatch(closeAlert());
  }

  const { title, body } = message;
  return (
    <AlertDialog.Root open={active}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay style={{display: 'flex', width: '100vw', height: '100vh', backgroundColor: '#0004', position: 'fixed', inset: 0, backdropFilter: 'blur(2px)', zIndex: 20 }} />
        <AlertDialog.Content className="AlertDialogContent" style={{top: '50%', left: '50%', position: 'fixed', transform: 'translate(-50%, -50%)', backgroundColor: '#333', padding: 30, borderRadius: 10, minWidth: 300, border: '1px solid #0004', zIndex: 21}} >
          <AlertDialog.Title className="AlertDialogTitle" style={{margin: 0}}>
            { title }
          </AlertDialog.Title>
          <AlertDialog.Description className="AlertDialogDescription" style={{margin: 0}}>
            { body }
          </AlertDialog.Description>
          <div style={{ display: "flex", gap: 25, justifyContent: "flex-end", marginTop: 15 }}>
            <AlertDialog.Action asChild>
              <button onClick={HandleCloseDialog} className="Button red" style={{ border: '1px solid #0004', backgroundColor: '#ddd', color: '#333' }}>Okay</button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
