import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import http from 'http';

import dotenv from 'dotenv';
import AuthenticatedSocket from './AuthenticatedSocket';
dotenv.config();

let socketServerOnline = false;

let socketServer: SocketIOServer | undefined;
let socketHttpServer: HTTPServer | undefined;

/**
 * 
 * @returns true if socket.io server is available. False otherwise.
 */
export function isSocketServerOnline() {
  return socketServerOnline;
}

/**
 * @returns socket.io server (if available)
 */
export function getSocketServer() {
  return socketServer;
}
/**
 * @returns http server used by socket.io server (if available)
 */
export function getSocketHTTPServer() {
  return socketHttpServer;
}


/**
 * Use in combination with async to create a socket.io server sychronously.
 * Only one socket.io server can be created.
 * 
 * ----
 * 
 * Use `isSocketServerOnline` to determine if a socket server has been created already
 * 
 * Access socket.io server by calling `getSocketServer`. 
 * 
 * Access HTTP server used by socket.io server by calling `getSocketHTTPServer`
 * 
 * 
 * @returns `Promise<boolean | Error>`
 */
export function StartSocketServer() {
  if (socketServerOnline) {
    throw new Error('attempted to create a new socket server when one already exists');
  }

  return new Promise((res: (b: boolean) => void, rej: (e: Error) => void) => {
    const httpServer = http.createServer();
    const io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.SOCKET_SERVER_PORT,
        methods: ['GET', 'POST'],
      }
    });
    
    // once server is online, saves them in respective variables
    // and calls function to add initial listeners.
    httpServer.on('listening', () => {
      socketServer = io;
      socketHttpServer = httpServer;
      _addInitialListenersToSocketIOServer();
      res(true);
    });

    httpServer.listen(process.env.SOCKET_SERVER_PORT, () => {
      console.log('socket server is online on port', process.env.SOCKET_SERVER_PORT);
    });

    interface NodeJSNetworkError extends Error {
      code?: string; // The `code` property is optional
    }

    httpServer.on('error', (err: NodeJSNetworkError) => {
      if (err.code === 'EADDRINUSE') {
        rej(new Error('Port is already in use'));
      } else {
        throw err;
      }
    });

    // timeout if server takes too long to turn on.
    setTimeout(() => rej(new Error('Timed out before creating server.')), 5000);
  });
}

let addedInitialListenersToSocketIOServer = false;
function _addInitialListenersToSocketIOServer() {
  // will throw error if already called, or socketServer has not been initialized.
  if (addedInitialListenersToSocketIOServer) {
    throw new Error('Already added intial listeners to SocketIO Server.');
  }
  if (!socketServer) {
    throw new Error('Socket server is not ready. Cannot add listeners to socket server');
  }

  // authentication middleware
  socketServer.use(async (socket, next) => {
    const tokenWithBearer = socket.handshake.auth.token;
    if (!tokenWithBearer) {
      next(new Error('No token provided'));
    }
    
    // if testing, allow use of "valid" token to pass.
    if(process.env.TESTING == "true") {
      
      let tokenSplit: string[];
      try {
        tokenSplit = tokenWithBearer.split(' ');
        tokenSplit[0] && tokenSplit[1]; // checks to see if split contains at least two parts
      } catch {
        next(new Error('Token was formatted incorrectly '+tokenWithBearer));
        return;
      }

      if (tokenSplit[0] == 'testing') {
        try {
          // tels auth socket to delete user immediately after disconnecting
          const additional = {
            deleteAccountAfterDisconnect: socket.handshake.auth.deleteAccountAfterDisconnect,
            testing: true
          };
          new AuthenticatedSocket(socket, tokenSplit[1], additional);
        } catch {
          throw new Error('expected test token to contain testing userID');
        }
        next();
        return;
      }
    }

    // precheck, should have Bearer <Token>, therefore a two word string.
    if (tokenWithBearer.split(' ').length != 2) {
      return next(new Error('Improperly formatted token'));
    }

    // make request to our server to verify token.
    try {
      console.log(`Veriyfing "${tokenWithBearer}" from http://localhost:${process.env.EXPRESS_SERVER_PORT}/verifyJWT`);
      // request fails if token is invalid.
      const resRaw = (await fetch(`http://localhost:${process.env.EXPRESS_SERVER_PORT}/verifyJWT`, {
          method: 'POST',
          headers: {
              authorization: tokenWithBearer
          }
      }));
      console.log('verify res', resRaw);
      const res = await resRaw.json();
      new AuthenticatedSocket(socket, res.payload.sub);
      next();
    } catch (error) {
        console.log('caught error while connecting\n', error);
        next(new Error('Token invalid'));
    }
  });

  socketServer.on('connection', (socket) => {
    // console.log('socket is online.');
  });
}
