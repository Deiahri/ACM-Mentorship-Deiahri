import { io, Socket } from "socket.io-client";
import { Dispatch } from "@reduxjs/toolkit";
import {
  isAssessmentQuestions,
  isClientDataPayloadType,
  isClientSocketState,
  isMentorshipRequestObject,
  isSubmitAssessmentAction,
  isSubmitGoalAction,
} from "../../scripts/validation";
import {
  setAvailableAssessmentQuestions,
  setClientReady,
  setClientState,
  setClientUser,
} from "./ClientSocketSlice";
import {
  AnyFunction,
  AssessmentPreviewMap,
  AssessmentQuestion,
  ChatObj,
  GoalObj,
  GoalPreviewMap,
  MentorshipRequestObj,
  MentorshipRequestResponseAction,
  MessageObj,
  ObjectAny,
  SubmitGoalAction,
} from "../../scripts/types";
import { setAlert } from "../Alert/AlertSlice";
import { NothingFunction } from "../../scripts/tools";
import { addChat } from "../Chat/ChatSlice";
import { playMessageReceiveNotificationSound, playMessageSendNotificationSound } from "../../scripts/sounds";

export let MyClientSocket: ClientSocket | undefined = undefined;

const MAX_FAILED_CONNECTION_ATTEMPTS = 3;
let CreatingConnection = false;
/**
 *
 * @param dispatch Redux dispatch function. Used by server socket to update store when needed
 */
export function CreateClientSocketConnection(
  userToken: string,
  dispatch: Dispatch
) {
  if (MyClientSocket || CreatingConnection) {
    // should not create new socket connection if one already exists, or in process of creating one.
    console.log("already connecting or connected.");
    return;
  }

  // set creating = true, so subsequent calls while connecting are denied.
  CreatingConnection = true;
  console.log(
    "establishing socket connection with",
    import.meta.env.VITE_SERVER_SOCKET_URL,
    "\n",
    userToken
  );
  const socket = io(import.meta.env.VITE_SERVER_SOCKET_URL, {
    auth: {
      token: `Bearer ${userToken}`,
    },
  });

  let failedConnects = 0;
  socket.on("connect_error", async () => {
    failedConnects++;
    if (failedConnects >= MAX_FAILED_CONNECTION_ATTEMPTS) {
      socket.disconnect();
      console.log("Failed to connect. Disconnecting");
      return;
    }
    console.log("failed to connect, trying again.", failedConnects);
  });

  socket.once("connect", () => {
    MyClientSocket = new ClientSocket(socket, dispatch);
  });
}

type ClientMessagePayload = {
  title?: string;
  body?: string;
};

type ClientCreateUserPayload = {
  fName: string;
  mName?: string;
  lName: string;
  username: string;
};

export type ClientSocketUser = {
  fName?: string;
  mName?: string;
  lName?: string;
  username?: string;
  id?: string;
  socials?: ObjectAny[];
  experience?: ObjectAny[];
  education?: ObjectAny[];
  certifications?: ObjectAny[];
  projects?: ObjectAny[];
  softSkills?: string[];
  isMentor?: boolean;
  isMentee?: boolean;
  acceptingMentees?: boolean;
  assessments?: AssessmentPreviewMap;
  menteeIDs?: string[];
  mentorID?: string;
  displayPictureURL?: string;
  bio?: string;
  mentorshipRequests?: string[];
  goals?: GoalPreviewMap;
  chats?: string[];
};

export type ClientDataPayloadType = "initialData" | "mentorshipRequest" | "chat";
export const ClientDataPayloadTypes = ["initialData", "mentorshipRequest", "chat"];

export type SubmitAssessmentAction =
  | "create"
  | "publish"
  | "unpublish"
  | "delete"
  | "edit";
export const SubmitAssessmentActions = [
  "create",
  "publish",
  "unpublish",
  "delete",
  "edit",
];
export type SubmitAssessmentPayload = {
  action?: SubmitAssessmentAction;
  questions?: AssessmentQuestion[];
  id?: string;
  published?: boolean;
};

type ClientDataPayload = {
  type: ClientDataPayloadType;
  data: Object;
};

export const ClientSocketStates = [
  "connecting",
  "authed_nouser",
  "authed_user",
];
export type ClientSocketState = "connecting" | "authed_nouser" | "authed_user";
class ClientSocket {
  dispatch: Dispatch;
  socket: Socket;
  state: ClientSocketState = "connecting";
  user: ClientSocketUser = {};
  mentorshipRequests: ObjectAny[] = [];
  currentSocketStateEvents: { [key: string]: (...args: any[]) => void } = {};

  constructor(socket: Socket, dispatch: Dispatch) {
    this.socket = socket;
    this.dispatch = dispatch;
    // clean listeners from socket
    this.InstallBaseListeners();
  }

  createAccount(params: ClientCreateUserPayload, callback?: AnyFunction) {
    // don't submit if already submitting some information.
    const CreateAccountErrorHeader = "Create Account Error";
    if (this.state != "authed_nouser") {
      this.showDialog(CreateAccountErrorHeader, "You already have an account");
      return;
    }

    if (typeof params != "object") {
      this.showDialog(CreateAccountErrorHeader, "Params are invalid.");
      return;
    }

    const { fName, mName, lName, username } = params;
    if (!fName) {
      this.showDialog(CreateAccountErrorHeader, "You're missing a first name.");
    } else if (!lName) {
      this.showDialog(CreateAccountErrorHeader, "You're missing a last name.");
    } else if (!username) {
      this.showDialog(CreateAccountErrorHeader, "You're missing a username.");
    }

    this.socket.emit(
      "createUser",
      { fName, mName, lName, username },
      (v: boolean) => {
        callback && callback(v);
      }
    );
  }

  updateProfile(params: ClientSocketUser, callback?: Function) {
    console.log("updatingProfile", params);
    this.socket.emit("updateProfile", params, (v: boolean) => {
      callback && callback(v);

      // if successful, requests a self update
      v && this.requestUpdateSelf();
    });
  }

  requestUpdateSelf(callback?: Function) {
    this.socket.emit("getUser", this.user.id, (v: ObjectAny) => {
      callback && callback(v);
      this.dispatch(setClientUser(v));
    });
  }

  submitAssessment(payload: SubmitAssessmentPayload, callbackRaw?: Function) {
    let callback = callbackRaw || NothingFunction;
    // @ts-ignore
    const { action, questions, id, published } = payload;

    if (!action || !isSubmitAssessmentAction(action)) {
      callback(false);
      this.dispatch(
        setAlert({
          title: "Invalid Assessment Action",
          body: `Not sure what action ${action} is.`,
        })
      );
      return;
    }

    if (action == "create") {
      this.socket.emit(
        "submitAssessment",
        { action, questions },
        (v: boolean | string) => {
          callback(v);
        }
      );
    } else if (action == "edit") {
      console.log("editing");
      this.socket.emit(
        "submitAssessment",
        { action, questions, id },
        (v: boolean | string) => {
          callback(v);
        }
      );
    }
    // this.dispatch(setAlert({ title: 'Yep', body: 'Alright' }));

    callback(true);
    this.requestUpdateSelf();
  }

  SubmitGoal(
    {
      action,
      goal,
      id,
    }: { action?: SubmitGoalAction; goal?: GoalObj; id?: string },
    cb?: (v: string | boolean) => any
  ) {
    const callback = cb || NothingFunction;
    if (!isSubmitGoalAction(action)) {
      callback(false);
      return;
    }

    switch (action) {
      case "create":
        if (!goal || typeof goal != "object") {
          return;
        }
        this.socket.emit(
          "submitGoal",
          { goal, action: "create" },
          (v: boolean | string) => {
            callback(v);
            if (v) {
              this.requestUpdateSelf();
            }
          }
        );
        break;
      case "edit":
        if (!goal || typeof goal != "object") {
          callback(false);
          return;
        } else if (!id || typeof id != "string") {
          callback(false);
          return;
        }
        this.socket.emit(
          "submitGoal",
          { goal, action: "edit", id },
          (v: boolean) => {
            callback(v);
            if (v) {
              this.requestUpdateSelf();
            }
          }
        );
        break;
      case "delete":
        if (!id || typeof id != "string") {
          callback(false);
          return;
        }
        this.socket.emit(
          "submitGoal",
          { id, action: "delete" },
          (v: boolean) => {
            callback(v);
            if (v) {
              this.requestUpdateSelf();
            }
          }
        );
        break;
      default:
        console.error("unhandled submit goal action:", action);
        callback(false);
        return;
    }
  }

  private InstallBaseListeners() {
    this._cleanupSocketEvents();
    this._addStateSocketEvent("state", (state: string) => {
      console.log("state", state);
      if (!isClientSocketState(state)) {
        console.error("Invalid State", state);
        return;
      }
      this.state = state;
      this.dispatch(setClientState(state));
    });

    this._addStateSocketEvent(
      "message",
      (messagePayload: ClientMessagePayload) => {
        console.log("received message", messagePayload);
        if (typeof messagePayload != "object") {
          console.error(
            "Received a message with invalid format.",
            messagePayload
          );
          return;
        }
        const { title, body } = messagePayload;
        this.showDialog(title, body);
      }
    );

    this._addStateSocketEvent("data", (payload: ClientDataPayload) => {
      console.log("received data", payload);
      if (typeof payload != "object") {
        console.error("Received invalid payload");
        return;
      }
      const { type, data } = payload;
      if (!type || !data) {
        console.error("Payload is missing parameters");
        return;
      }

      if (!isClientDataPayloadType(type)) {
        console.error("Payload type is invalid.", type);
        return;
      }

      let processFunc: Function;
      if (type == "initialData") {
        processFunc = this._handleInitialData.bind(this);
      } else if (type == "mentorshipRequest") {
        processFunc = this._handleMentorshipRequests.bind(this);
      } else if (type == "chat") {
        processFunc = this._handleChat.bind(this);
      } else {
        console.error("Unhandled data type:", type);
        return;
      }
      processFunc(data);
    });
    setTimeout(() => {
      this.dispatch(setClientReady(true));
    }, 250);
  }

  GetAssessment(assessmentID: string, callbackRaw: Function) {
    const callback = callbackRaw || NothingFunction;
    this.socket.emit("getAssessment", assessmentID, (v: Object | boolean) => {
      if (typeof v == "boolean") {
        callback(false);
        return;
      }
      callback(v);
    });
  }

  GetUser(userID: string, callbackRaw: Function) {
    const callback = callbackRaw || NothingFunction;
    this.socket.emit("getUser", userID, (v: Object | boolean) => {
      if (typeof v == "boolean") {
        callback(false);
        return;
      }
      callback(v);
    });
  }

  GetAllMentors(callbackRaw?: Function) {
    const callback = callbackRaw || NothingFunction;
    this.socket.emit("getAllMentors", (v: Object | boolean) => {
      if (typeof v == "boolean") {
        callback(false);
        return;
      }
      callback(v);
    });
  }

  GetGoal(goalID: string, cb: Function) {
    const callback = cb || NothingFunction;

    if (!goalID) {
      console.error("Can't call getGoal without goal ID");
      callback(false);
      return;
    }

    this.socket.emit("getGoal", goalID, (v: boolean | GoalObj) => {
      cb(v);
    });
  }

  GetMessages(messageIDs: string[], cb?: Function) {
    const callback = cb || NothingFunction;
    if (!messageIDs || !(messageIDs instanceof Array)) {
      callback(false);
      return;
    }
    this.socket.emit("getMessages", messageIDs, (v: MessageObj[]) => {
      if (!v || !(v instanceof Array)) {
        callback(false);
        return;
      }
      callback(v);
    });
  }

  BecomeMentor(cb?: Function) {
    this.updateProfile({ isMentor: true, acceptingMentees: true }, cb);
  }

  SendMentorshipRequest(userID: string, callback?: Function) {
    const cb = callback || NothingFunction;
    this.socket.emit(
      "mentorshipRequest",
      { action: "send", mentorID: userID },
      (v: boolean) => {
        cb(v);
      }
    );
  }

  GetMentorshipRequestBetweenMentorMentee(
    mentorID: string,
    menteeID: string,
    callback: AnyFunction
  ) {
    if (!mentorID || !menteeID) {
      callback(false);
      return;
    }
    this.socket.emit(
      "getMentorshipRequestBetweenUsers",
      mentorID,
      menteeID,
      (v: ObjectAny | undefined) => {
        setTimeout(() => {
          callback(v);
        }, 500);
      }
    );
  }

  DoMentorshipRequestAction(
    requestID: string,
    mentorshipRequestAction: MentorshipRequestResponseAction,
    callback?: Function
  ) {
    console.log(
      "DoMentorshipRequestAction",
      requestID,
      mentorshipRequestAction
    );
    this.socket.emit(
      "mentorshipRequest",
      { action: mentorshipRequestAction, mentorshipRequestID: requestID },
      (v: boolean) => {
        callback && callback(v);
        if (v) {
          this.requestUpdateSelf();
        }
      }
    );
  }

  GetChats(chats: string[], cb?: Function) {
    const callback = cb || NothingFunction;
    if (!chats || !(chats instanceof Array)) {
      callback(false);
      return;
    }
    this.socket.emit("getChats", chats, (v: ChatObj[]) => {
      if (!v || !(v instanceof Array)) {
        callback(false);
        return;
      }
      callback(v);
    });
  }

  CreateChat(targetUserID: string, messageContent: string, cb?: Function) {
    const callback = cb || NothingFunction;
    if (!targetUserID || !messageContent) {
      callback(false);
      return;
    } else if (messageContent.length == 0) {
      this.dispatch(
        setAlert({
          title: "A little bit more",
          body: "We need a little bit more text before we can send this message.",
        })
      );
      return;
    }
    this.socket.emit(
      "sendMessage",
      {
        action: "create",
        contents: messageContent,
        targetUserIDs: [targetUserID],
      },
      (v: boolean | string) => {
        callback(v);
      }
    );
  }

  SendMessage(chatID: string, messageContent: string, cb?: Function) {
    const callback = cb || NothingFunction;
    if (!chatID || !messageContent) {
      callback(false);
      return;
    } else if (messageContent.length == 0) {
      this.dispatch(
        setAlert({
          title: "A little bit more",
          body: "We need a little bit more text before we can send this message.",
        })
      );
      return;
    }
    this.socket.emit(
      "sendMessage",
      {
        action: "send",
        contents: messageContent,
        chatID: chatID,
      },
      (v: boolean | string) => {
        callback(v);
      }
    );
  }

  /**
   * adds event function pair to socket.
   * also adds it to `currentSocketStateEvents` to keep track of current socket events (used by ``_cleanupSocketEvents``).
   * @param event
   * @param func
   */
  private _addStateSocketEvent(event: string, func: (...args: any[]) => void) {
    this.currentSocketStateEvents[event] = func;
    this.socket.on(event, func);
  }

  private showDialog(title?: string, body?: string) {
    this.dispatch(setAlert({ title, body }));
  }

  private _cleanupSocketEvents() {
    for (let key in this.currentSocketStateEvents) {
      this.socket.removeListener(key, this.currentSocketStateEvents[key]);
    }
  }

  private _handleInitialData(initialData: unknown) {
    if (!initialData || typeof initialData != "object") {
      console.error("Expected initial data to be object", initialData);
      return;
    }
    const { user, availableAssessmentQuestions } = initialData as ObjectAny;
    if (!user) {
      console.error("initialData is missing user payload", initialData);
      return;
    }
    this.dispatch(setClientUser(user));
    this.user = user;

    if (isAssessmentQuestions(availableAssessmentQuestions)) {
      this.dispatch(
        setAvailableAssessmentQuestions(availableAssessmentQuestions)
      );
    } else {
      console.error(
        "Received unexpected format for available assessment questions",
        availableAssessmentQuestions
      );
    }
  }

  private async _handleMentorshipRequests(
    mentorshipRequestObj: MentorshipRequestObj
  ) {
    if (!isMentorshipRequestObject(mentorshipRequestObj)) {
      console.error(
        "Received mentorship object that was invalid",
        mentorshipRequestObj
      );
      return;
    }

    const { id, mentorID, menteeID, status } = mentorshipRequestObj;
    if (!mentorID || !id || !menteeID) {
      console.error(
        "Received mentorship object that was missing a parameter",
        mentorshipRequestObj
      );
      return;
    }

    if (status) {
      if (status == "accepted" || status == "declined") {
        this.requestUpdateSelf();
        let mentorObj = await new Promise((res) => {
          this.GetUser(mentorID, (v: ObjectAny | boolean) => {
            res(v);
          });
        });
        if (!mentorObj || typeof mentorObj != "object") {
          return;
        }

        if (this.user.id == menteeID) {
          const { fName, lName } = mentorObj as ObjectAny;
          this.dispatch(
            setAlert({
              title: `Mentorship request ${status}`,
              body: `${fName} ${lName} ${status} your request.`,
            })
          );
        }
      }
    } else {
      this.requestUpdateSelf();
      if (mentorID == this.user.id) {
        let menteeObj = await new Promise((res) => {
          this.GetUser(menteeID, (v: ObjectAny | boolean) => {
            res(v);
          });
        });

        if (!menteeObj || typeof menteeObj != "object") {
          return;
        }

        const { fName, lName } = menteeObj as ObjectAny;
        this.dispatch(
          setAlert({
            title: `Mentorship request received`,
            body: `${fName} ${lName} sent you a mentorship request.`,
          })
        );
      }
    }
  }

  private _handleChat(chatObj: ChatObj) {
    this.dispatch(addChat({ chatID: chatObj.id, chat: chatObj }));
    console.log(chatObj.lastMessage.sender, this.user.id, chatObj.lastMessage.sender == this.user.id);
    if (chatObj.lastMessage.sender == this.user.id) {
      playMessageSendNotificationSound();
    } else {
      playMessageReceiveNotificationSound();
    }
  }
}
