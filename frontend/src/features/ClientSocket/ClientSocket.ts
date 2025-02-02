import { io } from "socket.io-client";
import { sleep } from "../../scripts/tools";

export let ClientSocket = undefined;

const MAX_FAILED_CONNECTION_ATTEMPTS = 3;
let CreatingConnection = false;
/**
 * 
 * @param dispatch Redux dispatch function. Used by server socket to update store when needed
 */
export function CreateClientSocketConnection(userToken: string, dispatch?: Function) {
  if (ClientSocket || CreatingConnection) {
    // should not create new socket connection if one already exists, or in process of creating one.
    console.log('already connecting or connected.');
    return;
  }
  
  // set creating = true, so subsequent calls while connecting are denied.
  CreatingConnection = true;
  console.log('establishing socket connection with', import.meta.env.VITE_SERVER_SOCKET_URL);
  const socket = io(import.meta.env.VITE_SERVER_SOCKET_URL, {
    auth: {
      token: userToken
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
  
}
