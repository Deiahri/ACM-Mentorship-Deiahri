import { doc, getDoc, getFirestore } from "firebase/firestore";
import env from "./env/env";
import { initializeApp } from "firebase/app";
import { UserObj } from "@shared/types/general";
import { validateUserObj } from "@shared/validation/user";

// pulls info from .env
const firebaseConfig = {
  apiKey: env.FB_API_KEY,
  authDomain: env.FB_AUTH_DOMAIN,
  projectId: env.FB_PROJECT_ID,
  storageBucket: env.FB_STORAGE_BUCKET,
  messagingSenderId: env.FB_MESSAGING_SENDER_ID,
  appId: env.FB_APP_ID,
};

// Initialize Firebase
initializeApp(firebaseConfig);
const db = getFirestore();

export async function DBGetUserById(userID: string): Promise<UserObj | undefined> {
  const res = (await getDoc(doc(db, 'user', userID))).data();
  if (!res) {
    return undefined;
  } 
  try {
    validateUserObj(res); 
  } catch {
    return undefined;
  }
  return res;
}