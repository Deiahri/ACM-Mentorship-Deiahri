import dotenv from 'dotenv';
dotenv.config();

const env = {
  TESTING: process.env.TESTING === 'true',
  CLIENT_ADDRESS: process.env.CLIENT_ADDRESS!,
  SERVER_PORT: process.env.SERVER_PORT!,

  FB_API_KEY: process.env.FB_API_KEY!,
  FB_AUTH_DOMAIN: process.env.FB_AUTH_DOMAIN!,
  FB_PROJECT_ID: process.env.FB_PROJECT_ID!,
  FB_STORAGE_BUCKET: process.env.FB_STORAGE_BUCKET!,
  FB_MESSAGING_SENDER_ID: process.env.FB_MESSAGING_SENDER_ID!,
  FB_APP_ID: process.env.FB_APP_ID!,

  AUTH0_AUDIENCE: process.env.AUTH0_AUDIENCE!,
  AUTH0_ISSUER_BASE_URL: process.env.AUTH0_ISSUER_BASE_URL!,
  AUTH0_TOKEN_SIGNING_ALG: process.env.AUTH0_TOKEN_SIGNING_ALG!
}

for (const [key, value] of Object.entries(env)) {
  if (value === undefined) {
    throw new Error(`Environment variable ${key} is not defined`);
  }
}

export default env;