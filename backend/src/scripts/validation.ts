import { DBGet } from "../db";

export const MAX_NAME_LENGTH = 36;
/**
 * Checks first, middle, and last names to see if any are too long or short.
 * 
 * **If any checks are failed, an `error` is thrown.**
 * 
 * @param fName First name
 * @param mName Middle name (Optional)
 * @param lName Last name
 * @returns 
 */
export function isValidNames(fName: string, mName: string | undefined, lName: string) {
  if (typeof(fName) != 'string' || (mName && typeof(mName) != 'string') || typeof(lName) != 'string') {
    throw new Error("One of the name types are not valid");
  }
  const fNameLength = fName.trim().length;
  const mNameLength = mName ? mName.trim().length : 0;
  const lNameLength = lName.trim().length;
  
  // Validate first name
  if (fNameLength < 1) {
    throw new Error("First name is too short.");
  }
  if (fNameLength > MAX_NAME_LENGTH) {
    throw new Error("First name is too long.");
  }

  // Validate middle name (if provided)
  if (mName && mNameLength > MAX_NAME_LENGTH) {
    throw new Error("Middle name is too long.");
  }

  // Validate last name
  if (lNameLength < 1) {
    throw new Error("Last name is too short.");
  }
  if (lNameLength > MAX_NAME_LENGTH) {
    throw new Error("Last name is too long.");
  }

  return true;
}

export const MIN_USERNAME_LENGTH = 2, MAX_USERNAME_LENGTH = 32;
const ALLOWED_USERNAME_CHARS = /^[a-zA-Z0-9_.-]+$/;

/**
 * Checks if username is valid. Cannot be too long, or too short, contain spaces inbetween, contains only a-Z, 0-9, underscores, periods, and dashes.
 * 
 * **If any checks are failed, an `error` is thrown.**
 * @param usernameRaw 
 * @returns 
 */
export async function isValidUsername(usernameRaw: string) {
  if (typeof(usernameRaw) != 'string') {
    throw new Error("Username type is not valid");
  }

  let username = usernameRaw.trim().toLowerCase();

  if (username.length < MIN_USERNAME_LENGTH) {
    throw new Error("Username is too short.");
  } else if (username.length > MAX_USERNAME_LENGTH) {
    throw new Error("Username is too long.");
  }

  if (!ALLOWED_USERNAME_CHARS.test(username)) {
    throw new Error("Username can only contain letters, numbers, underscores, hyphens, and periods.");
  }

  if (username.includes(" ")) {
    throw new Error("Username cannot contain spaces.");
  }

  try {
    const res = await DBGet('user', [['usernameLower', '==', username]]);
    if (res.length > 0) {
      throw new Error('This username is not available');
    }
  } catch {
    throw new Error('There was a problem checking if this username is available.');
  }
  return true;
}