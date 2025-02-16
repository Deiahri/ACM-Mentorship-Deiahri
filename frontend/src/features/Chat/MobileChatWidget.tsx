import { useDispatch, useSelector } from "react-redux";
import { ReduxRootState } from "../../store";
import ShowOnMobile from "../../components/RenderOnMobile/ShowOnMobile";
import ChatWidgetChats from "./ChatWidgetChats";
import ChatWidgetActiveChat from "./ChatWidgetActiveChat";
import { ChevronLeft } from "lucide-react";
import { setChatOpen } from "./ChatSlice";

const mobileFontScale = 1.5;
export default function MobileChatWidget() {
  const { open, loaded } = useSelector((store: ReduxRootState) => store.Chat);
  const { ready } = useSelector((store: ReduxRootState) => store.ClientSocket);

  if (!ready || !loaded) {
    return;
  }

  return (
    open && (
      <ShowOnMobile
        style={{
          position: "fixed",
          width: "100%",
          height: "100%",
          backgroundColor: "#0003",
          zIndex: 1000,
        }}
      >
        <ChatWidgetOpened />
      </ShowOnMobile>
    )
  );
}

function ChatWidgetOpened() {
  const { activeChatID } = useSelector((store: ReduxRootState) => store.Chat);
  return (
    <>
      {!activeChatID && <MobileFullScreenChatWidgetChats />}
      {activeChatID && <ChatWidgetActiveChat fontScale={mobileFontScale} />}
    </>
  );
}

function MobileFullScreenChatWidgetChats() {
  return (
    <div
      style={{
        padding: 10,
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
        overflowY: "scroll",
        backgroundColor: "#333",
      }}
    >
      <MobileFullScreenChatWidgetChatsHeader />
      <div
        style={{
          border: "1px solid #fff4",
          boxSizing: "border-box",
          overflowY: "scroll",
          borderRadius: 10,
          height: "92%",
          width: "100%",
        }}
      >
        <ChatWidgetChats fontScale={mobileFontScale} />
      </div>
    </div>
  );
}

function MobileFullScreenChatWidgetChatsHeader() {
  const dispatch = useDispatch();

  function handleGoBack() {
    dispatch(setChatOpen(false));
  }

  return (
    <div
      style={{
        width: "100%",
        height: "4rem",
        position: "relative",
        display: "flex",
        justifyContent: "center",
        padding: "0.5rem",
        boxSizing: "border-box",
      }}
    >
      <ChevronLeft
        onClick={handleGoBack}
        style={{ position: "absolute", left: 0 }}
      />
      <span style={{ fontSize: "1.5rem", fontWeight: "bold" }}>Chats</span>
    </div>
  );
}
