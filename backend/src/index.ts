import { StartSocketServer } from './socket/socketServer';
import { StartExpressServer } from './server/server';

import dotenv from 'dotenv';
dotenv.config();

async function StartApp() {
  // starts express server
  try {
      StartExpressServer();
  } catch {}

  // starts socket server.
  try {
      await StartSocketServer();
  } catch {}
}

async function Start() {
  await StartApp();
}

Start();
