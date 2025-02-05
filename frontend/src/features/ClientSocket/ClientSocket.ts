import { io, Socket } from "socket.io-client";
import { Dispatch } from "@reduxjs/toolkit";
import { isClientDataPayloadType, isClientSocketState } from "../../scripts/validation";
import { setClientState, setClientUserID, setClientUsers } from "./ClientSocketSlice";
import { setDialog } from "../Dialog/DialogSlice";
import { AnyFunction } from "../../scripts/types";

export let MyClientSocket: ClientSocket | undefined = undefined;

const MAX_FAILED_CONNECTION_ATTEMPTS = 3;
let CreatingConnection = false;
/**
 * 
 * @param dispatch Redux dispatch function. Used by server socket to update store when needed
 */
export function CreateClientSocketConnection(userToken: string, dispatch: Dispatch) {
  if (MyClientSocket || CreatingConnection) {
    // should not create new socket connection if one already exists, or in process of creating one.
    console.log('already connecting or connected.');
    return;
  }
  
  // set creating = true, so subsequent calls while connecting are denied.
  CreatingConnection = true;
  console.log('establishing socket connection with', import.meta.env.VITE_SERVER_SOCKET_URL);
  const socket = io(import.meta.env.VITE_SERVER_SOCKET_URL, {
    auth: {
      token: `Bearer ${userToken}`
    }
  });

  let failedConnects = 0;
  socket.on('connect_error', async () => {
    failedConnects++;
    if (failedConnects >= MAX_FAILED_CONNECTION_ATTEMPTS) {
      socket.disconnect();
      console.log('Failed to connect. Disconnecting');
      return;
    }
    console.log('failed to connect, trying again.', failedConnects);
  });

  socket.once('connect', () => {
    MyClientSocket = new ClientSocket(socket, dispatch);
  });
}

type ClientMessagePayload = {
  title?: string,
  body?: string
};

type ClientCreateUserPayload = {
  fName: string,
  mName?: string,
  lName: string,
  username: string
};

export type ClientDataPayloadType = 'users' | 'userID' | 'assessments';
export const ClientDataPayloadTypes = ['users', 'userID', 'assessments'];

type ClientDataPayload = {
  type: ClientDataPayloadType,
  data: Object
}

export const ClientSocketStates = ['connecting', 'authed_nouser', 'authed_user'];
export type ClientSocketState = 'connecting' | 'authed_nouser' | 'authed_user';
class ClientSocket {
  dispatch: Dispatch;
  socket: Socket;
  state: ClientSocketState = 'connecting';
  userID: string | undefined;
  currentSocketStateEvents: { [key: string]: (...args: any[]) => void } = {};
  users: Map<string, object> = new Map();
  constructor(socket: Socket, dispatch: Dispatch) {
    this.socket = socket;
    this.dispatch = dispatch;
    // clean listeners from socket
    this.InstallBaseListeners();
  }

  createAccount(params: ClientCreateUserPayload, callback?: AnyFunction) {
    const CreateAccountErrorHeader = 'Create Account Error';
    if (this.state != 'authed_nouser') {
      this.showDialog(CreateAccountErrorHeader, 'You already have an account');
      return;
    }

    if (typeof(params) != 'object') {
      this.showDialog(CreateAccountErrorHeader, 'Params are invalid.');
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
    this.socket.emit('createUser', { fName, mName, lName, username }, (v: boolean) => {
      callback && callback(v);
    });
  }

  private InstallBaseListeners() {
    this._cleanupSocketEvents();
    this._addStateSocketEvent('state', (state: string) => {
      console.log('state', state);
      if (!isClientSocketState(state)) {
        console.error('Invalid State', state);
        return;
      }
      this.state = state;
      this.dispatch(setClientState(state));
    });

    this._addStateSocketEvent('message', (messagePayload: ClientMessagePayload) => {
      console.log('received message', messagePayload);
      if (typeof(messagePayload) != 'object') {
        console.error('Received a message with invalid format.', messagePayload);
        return;
      }
      const { title, body } = messagePayload;
      this.showDialog(title, body);
    });

    this._addStateSocketEvent('data', (payload: ClientDataPayload) => {
      console.log('received data', payload);
      if (typeof(payload) != 'object') {
        console.error('Received invalid payload');
        return;
      }
      const { type, data } = payload;
      if (!type || !data) {
        console.error('Payload is missing parameters');
        return;
      }

      if (!isClientDataPayloadType(type)) {
        console.error('Payload type is invalid.');
        return;
      }

      let processFunc: Function;
      if (type == 'users') {
        processFunc = this._handleUserData.bind(this);
      } else if (type == 'userID') {
        processFunc = this._handleUserIDData.bind(this);
      } else if (type == 'assessments') {
        processFunc = this._handleAssessmentsData.bind(this);
      } else {
        console.error('Unhandled data type:', type);
        return;
      }
      processFunc(data);
    });
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
    this.dispatch(setDialog({ title: title, subtitle: body }));
  }

  private _cleanupSocketEvents() {
    for (let key in this.currentSocketStateEvents) {
      this.socket.removeListener(key, this.currentSocketStateEvents[key]);
    }
  }

  private _handleUserData(usersData: unknown) {
    if (!(usersData instanceof Array)) {
      console.error('Invalid user data');
      return;
    }
    for (let user of usersData) {
      if (typeof(user) != 'object') {
        console.error('Invalid user object');
        continue;
      }

      const { id } = user;
      if (!id || typeof(id) != 'string') {
        console.error('Invalid user object: invalid id');
        continue;
      }
      this.users.set(id, user);
    }
    const userMap = Object.fromEntries(this.users.entries());
    this.dispatch(setClientUsers(userMap));
  }

  private _handleUserIDData(userID: unknown) {
    if (typeof(userID) != 'string') {
      console.error('Invalid userID data', userID);
      return;
    }
    this.userID = userID;
    this.dispatch(setClientUserID(userID));
  }

  private _handleAssessmentsData() {

  }
}
