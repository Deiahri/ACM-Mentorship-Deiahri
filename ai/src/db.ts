import env from "./env/env";
import admin from "firebase-admin";
import { UserObj } from "@shared/types/general";
import { validateUserObj } from "@shared/validation/user";
import { getFirestore } from "firebase-admin/firestore";

admin.initializeApp({
  credential: admin.credential.cert(env.FB_ADMIN_JSON)
});
const db = getFirestore();

export async function DBGetUserById(userID: string): Promise<UserObj | undefined> {
  const res = (await db.collection('user').doc(userID).get()).data();
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