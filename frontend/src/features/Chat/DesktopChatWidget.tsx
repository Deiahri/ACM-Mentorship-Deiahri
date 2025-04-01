import { useDispatch, useSelector } from "react-redux";
import { ReduxRootState } from "../../store";
import { ChevronDown } from "lucide-react";
import { setChatOpen } from "./ChatSlice";
import HideOnMobile from "../../components/RenderOnMobile/HideOnMobile";
import ChatWidgetChats from "./ChatWidgetChats";
import ChatWidgetActiveChat from "./ChatWidgetActiveChat";
import ChatsUnreadIndicator from "./ChatsUnreadIndicator";

export default function DesktopChatWidget() {
  const { open, loaded } = useSelector((store: ReduxRootState) => store.Chat);
  const { ready } = useSelector((store: ReduxRootState) => store.ClientSocket);

  if (!ready || !loaded) {
    return;
  }

  return (
    <HideOnMobile
      style={{
        position: "fixed",
        right: "3rem",
        bottom: 0,
        width: "20rem",
        boxSizing: "border-box",
        zIndex: 10,
        // borderLeft: "1px solid #fff2",
        // borderRight: "1px solid #fff2",
      }}
    >
      {!open && <ChatWidgetHeader />}
      {open && <ChatWidgetOpened />}
    </HideOnMobile>
  );
}

function ChatWidgetHeader() {
  const { open } = useSelector((store: ReduxRootState) => store.Chat);
  const dispatch = useDispatch();

  function handleHeaderClick() {
    dispatch(setChatOpen(!open));
  }

  return (
    <div
      style={{
        padding: "1rem",
        borderStartStartRadius: 10,
        borderStartEndRadius: 10,
        backgroundColor: "#444",
        display: "flex",
        justifyContent: "space-between",
        cursor: "pointer",
        alignItems: "center",
        position: "relative",
        width: "100%",
        boxSizing: "border-box",
      }}
      onClick={handleHeaderClick}
    >
      {/* Notification icon */}
      <ChatsUnreadIndicator style={{ position: 'absolute', left: '-0.3rem', top: '-0.3rem' }} />
      <span style={{ fontSize: "1.25rem" }}>Chat</span>
      <ChevronDown style={{ rotate: open ? "0deg" : "180deg" }} />
    </div>
  );
}

function ChatWidgetOpened() {
  const { activeChatID } = useSelector((store: ReduxRootState) => store.Chat);
  return (
    <>
      <ChatWidgetHeader />
      {!activeChatID && (
        <div style={{ height: "25rem", backgroundColor: "#222", borderLeft: '1px solid #fff4', borderRight: '1px solid #fff4' }}>
          <ChatWidgetChats />
        </div>
      )}
      {activeChatID && (
        <div style={{ height: "25rem", backgroundColor: "#222", borderLeft: '1px solid #fff4', borderRight: '1px solid #fff4' }}>
          <ChatWidgetActiveChat />
        </div>
      )}
    </>
  );
}
