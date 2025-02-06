import { StartSocketServer } from './socket/socketServer';
import { StartExpressServer } from './server/server';

import dotenv from 'dotenv';
dotenv.config();

const REQUIRED_ENVS = ['PORT', 'FIRESTORE_APIKEY', 'SOCKET_SERVER_PORT', 'EXPRESS_SERVER_PORT', 'TESTING', 'SAMPLE_USER_ACCESS_TOKEN', 'CLIENT_ADDRESS']
function ENV_VAR_CHECK() {
  for (let required_env of REQUIRED_ENVS) {
    if (!process.env[required_env]) {
      throw new Error('Missing env var: '+required_env);
    }
  }
}
ENV_VAR_CHECK();

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
