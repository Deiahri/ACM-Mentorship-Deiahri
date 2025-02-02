import { Socket } from "socket.io";
import { DBCreate, DBDelete, DBGet, DBObj } from "../db";
import { objectAny } from "../types";
import { isValidNames, isValidUsername } from "../scripts/validation";

export type AuthenticatedSocketAdditionalParameters = {
  deleteAccountAfterDisconnect?: boolean;
  testing?: boolean;
};

type AuthenticatedSocketState =
  | "connecting"
  | "authed_nouser"
  | "authed_user"
  | "connect_error";

type UserObj = {
  id?: string,
  OAuthSubID?: string
}
export default class AuthenticatedSocket {
  socket: Socket;
  state: AuthenticatedSocketState;
  user: UserObj;
  currentSocketStateEvents: { [key: string]: (...args: any[]) => void } = {};

  constructor(socket: Socket, userSubID: string, additional?: any) {
    this.socket = socket;
    this.user = { OAuthSubID: userSubID };
    this._processAdditionalSettings(additional);
    this._enter_connect_state();
  }

  private _processAdditionalSettings(additional: objectAny) {
    if (!additional || typeof(additional) != 'object') {
      return;
    }

    if (additional.deleteAccountAfterDisconnect) {
      this.socket.on('disconnect', async () => {
        try {
          await DBDelete('user', [['OAuthSubID', '==', this.user.OAuthSubID]]);
        } catch {
          console.error('_processAdditionalSettings | problem deleting user after disconnect');
        }
      });
    }
  }

  private async _enter_connect_state() {
    const userSubID = this.user.OAuthSubID;
    this._setState("connecting");
    console.log("connecting user with subID", userSubID);
    let userData: DBObj;

    try {
      const res = await DBGet("user", [["OAuthSubID", "==", userSubID]]);

      // enter authed no user state if no user data exists for this subID.
      if (!res || res.length == 0) {
        this._enter_authed_nouser_state();
        return;
      }
      userData = res[0];
    } catch (err) {
      // if there is an error getting data, then set state and disconnect.
      console.log("Fatal connection error: ", err);
      this._setState("connect_error");
      this.socket.disconnect();
      return;
    }

    // userData has been retreived at this point.
    this._enter_authed_user_state(userData);
  }

  /**
   * In authed_nouser state we wait for user to submit data to create their user profile.
   * Once this data is received and validated, they can enter the authed_user state.
   * @param userSubID OAuth subID.
   */
  private async _enter_authed_nouser_state() {
    this._cleanupSocketEvents();
    this._setState('authed_nouser');

    this._addStateSocketEvent("createUser", this.handleCreateUser.bind(this));
  }

  private async _enter_authed_user_state(userData: DBObj) {
    this._cleanupSocketEvents();
    this.user = userData;
  }

  private _setState(state: AuthenticatedSocketState) {
    this.state = state;
    this.socket.emit("state", state);
  }

  sendClientMessage(title: string, body: string) {
    this.socket.emit("message", { title, body });
  }

  /**
   * This function is called when state = authed_nouser.
   * @param dataRaw should contain fName, lName, username, and optionally mName.
   * @param callback callback that is used to tell client if successful or not.
   * @returns nada
   */
  async handleCreateUser(dataRaw: unknown, callback: unknown) {
    const createUserSubject = "Fatal error while creating user: ";
    try {
      if (!callback || typeof callback != "function") {
        this.sendClientMessage(
          "Error",
          createUserSubject + "No callback function was provided."
        );
        return;
      } else if (!dataRaw || typeof dataRaw != "object") {
        callback(false);
        this.sendClientMessage(
          "Error",
          createUserSubject + "No data was provided."
        );
        return;
      }

      const data: objectAny = dataRaw;
      const { fName, mName, lName, username } = data;

      // verify names are useable
      try {
        isValidNames(fName, mName, lName);
      } catch (err: unknown) {
        if (err instanceof Error) {
          callback(false);
          this.sendClientMessage("Error", createUserSubject + err.message);
          return;
        }
      }

      // verify username is available
      try {
        await isValidUsername(username);
      } catch (err: unknown) {
        if (err instanceof Error) {
          callback(false);
          this.sendClientMessage("Error", createUserSubject + err.message);
          return;
        }
      }

      // stuff is valid, create user.
      let userID: string;
      const userSubID = this.user.OAuthSubID;
      try {
        const userData = {
          username, fName, mName: mName || null, lName,
          OAuthSubID: userSubID
        };
        userID = await DBCreate('user', userData);
        this.user = {
          ...userData, id: userID
        }
      } catch (err) {
        if (err instanceof Error) {
          callback(false);
          this.sendClientMessage("Error", createUserSubject + err.message);
          return;
        }
      }
      callback(true);
    } catch (err) {
      if (err instanceof Error) {
        this.sendClientMessage(
          "Error",
          createUserSubject + err.message
        );
        return;
      }
    }
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

  /**
   * Remove all socket events listed in ```this.currentSocketStateEvents``` from the socket.
   */
  private _cleanupSocketEvents() {
    for (let key in this.currentSocketStateEvents) {
      this.socket.removeListener(key, this.currentSocketStateEvents[key]);
    }
  }
}
