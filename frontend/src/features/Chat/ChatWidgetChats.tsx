import { useDispatch, useSelector } from "react-redux";
import { ReduxRootState } from "../../store";
import { setActiveChat } from "./ChatSlice";
import { ChatObj } from "../../scripts/types";
import { placeholderPreviewPicture } from "./Chat";

function sortChatPreviews(chatArr: ChatObj[]) {
  function swapIndexes(i: number, j: number) {
    const temp = chatArr[i];
    chatArr[i] = chatArr[j];
    chatArr[j] = temp;
  }
  for (let start = 0; start < chatArr.length - 1; start++) {
    let largestIndex = start;
    for (let index = start + 1; index < chatArr.length; index++) {
      if (
        chatArr[index].lastMessage.timestamp >
        chatArr[largestIndex].lastMessage.timestamp
      ) {
        largestIndex = index;
      }
    }
    if (largestIndex != start) {
      swapIndexes(start, largestIndex);
    }
  }
}
export default function ChatWidgetChats({ fontScale=1 }: { fontScale?: number }) {
  const { chats } = useSelector((store: ReduxRootState) => store.Chat);
  const chatArr = Array.from(chats.values());
  sortChatPreviews(chatArr);
  return (
    <div style={{ width: "100%", height: '100%', background: "#222" }}>
      {chatArr.map((chatObj) => {
        return (
          <ChatWidgetChatPreview
            key={`chat_${chatObj.id}`}
            chatID={chatObj.id}
            chatObj={chatObj}
            fontScale={fontScale}
          />
        );
      })}
    </div>
  );
}


function ChatWidgetChatPreview({
  chatID,
  chatObj,
  fontScale = 1,
}: {
  chatID: string;
  chatObj: ChatObj;
  fontScale?: number;
}) {
  const { user: self } = useSelector(
    (store: ReduxRootState) => store.ClientSocket
  );
  const dispatch = useDispatch();

  if (!self) {
    return;
  }

  function handleClick() {
    dispatch(setActiveChat(chatID));
  }

  const { lastMessage, users } = chatObj;
  const userIDsInChat = Object.keys(users);
  const otherUserID =
    userIDsInChat[0] !== self?.id ? userIDsInChat[0] : userIDsInChat[1];

  return (
    <>
      <div
        style={{
          padding: 10,
          boxSizing: "border-box",
          backgroundColor: "#333",
          display: "flex",
          flexDirection: "row",
          cursor: "pointer",
        }}
        onClick={handleClick}
      >
        <div style={{ marginRight: 1 * fontScale + "rem" }}>
          <img
            style={{
              width: 3 * fontScale + "rem",
              minWidth: 3 * fontScale + "rem",
              height: 3 * fontScale + "rem",
              objectFit: "cover",
              borderRadius: "50%",
            }}
            src={
              users[otherUserID].displayPictureURL || placeholderPreviewPicture
            }
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              fontSize: 1.1 * fontScale + "rem",
              fontWeight: "600",
            }}
          >
            {users[otherUserID].fName} {users[otherUserID].mName}{" "}
            {users[otherUserID].lName}
          </span>
          <span
            style={{
              fontSize: 1 * fontScale + "rem",
              fontWeight: "400",
              opacity: 0.8
            }}
          >
            {lastMessage.sender === self.id
              ? "You"
              : `${users[otherUserID].fName}`}
            : {lastMessage.contents.length > 50 ? lastMessage.contents.substring(0, 50)+'...' : lastMessage.contents}
          </span>
        </div>
      </div>
      <div style={{ width: "100%", height: 1, backgroundColor: "#fff3" }} />
    </>
  );
}
