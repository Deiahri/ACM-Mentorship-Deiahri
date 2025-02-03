import { DBGet } from "../db";
import { ObjectAny, SocialTypes } from "../types";

export const MAX_NAME_LENGTH = 36;
/**
 * Validates the first name.
 * @param fName - The first name to validate.
 * @throws Error if the first name is invalid.
 */
export function isValidFirstName(fName: string): void {
  if (typeof fName !== "string") {
    throw new Error("First name must be a string.");
  }

  const fNameLength = fName.trim().length;

  if (fNameLength < 1) {
    throw new Error("First name is too short.");
  }
  if (fNameLength > MAX_NAME_LENGTH) {
    throw new Error("First name is too long.");
  }
}

/**
 * Validates the middle name (if provided).
 * @param mName - The middle name to validate.
 * @throws Error if the middle name is invalid.
 */
export function isValidMiddleName(mName: string | undefined): void {
  if (mName && typeof mName !== "string") {
    throw new Error("Middle name must be a string.");
  }

  if (mName) {
    const mNameLength = mName.trim().length;

    if (mNameLength > MAX_NAME_LENGTH) {
      throw new Error("Middle name is too long.");
    }
  }
}

/**
 * Validates the last name.
 * @param lName - The last name to validate.
 * @throws Error if the last name is invalid.
 */
export function isValidLastName(lName: string): void {
  if (typeof lName !== "string") {
    throw new Error("Last name must be a string.");
  }

  const lNameLength = lName.trim().length;

  if (lNameLength < 1) {
    throw new Error("Last name is too short.");
  }
  if (lNameLength > MAX_NAME_LENGTH) {
    throw new Error("Last name is too long.");
  }
}

/**
 * Validates all names (first, middle, and last).
 * @param fName - The first name to validate.
 * @param mName - The middle name to validate (optional).
 * @param lName - The last name to validate.
 * @throws Error if any of the names are invalid.
 */
export function isValidNames(
  fName: string,
  mName: string | undefined,
  lName: string
): void {
  isValidFirstName(fName);
  isValidMiddleName(mName);
  isValidLastName(lName);
}

export const MIN_USERNAME_LENGTH = 2,
  MAX_USERNAME_LENGTH = 32;
const ALLOWED_USERNAME_CHARS = /^[a-zA-Z0-9_.-]+$/;

/**
 * Checks if username is valid. Cannot be too long, or too short, contain spaces inbetween, contains only a-Z, 0-9, underscores, periods, and dashes.
 *
 * **If any checks are failed, an `error` is thrown.**
 * @param usernameRaw
 * @returns
 */
export async function isValidUsername(usernameRaw: string) {
  if (typeof usernameRaw != "string") {
    throw new Error("Username type is not valid");
  }

  let username = usernameRaw.trim().toLowerCase();

  if (username.length < MIN_USERNAME_LENGTH) {
    throw new Error("Username is too short.");
  } else if (username.length > MAX_USERNAME_LENGTH) {
    throw new Error("Username is too long.");
  }

  if (!ALLOWED_USERNAME_CHARS.test(username)) {
    throw new Error(
      "Username can only contain letters, numbers, underscores, hyphens, and periods."
    );
  }

  if (username.includes(" ")) {
    throw new Error("Username cannot contain spaces.");
  }

  try {
    const res = await DBGet("user", [["usernameLower", "==", username]]);
    if (res.length > 0) {
      throw new Error("This username is not available");
    }
  } catch {
    throw new Error(
      "There was a problem checking if this username is available."
    );
  }
  return true;
}

export function isValidSocial(social: ObjectAny) {
  if (typeof social != "object") {
    throw new Error("A social was not formatted correctly.");
  }
  const { type, url } = social;
  if (!type || !url) {
    throw new Error("Information was missing from a social.");
  }

  if (!SocialTypes.includes(type)) {
    throw new Error(`Social type ${type} is not valid.`);
  }

  if (typeof url != "string") {
    throw new Error(`URL is not valid.`);
  }
  return true;
}

/**
 * {
 *   company: string,
 *   position: string,
 *   description: string | undefined
 *   range: [[month, year], [month, year] | undefined]
 * }
 */
export function isValidExperience(experience: ObjectAny) {
  console.log('iVE', experience);
  if (typeof(experience) != 'object') {
    throw new Error("Experience format was unexpected");
  }
  const { company, position, description, range } = experience;
  if (!company || typeof(company) != 'string' || company.length < 1) {
    throw new Error('Company name is missing from experience.');
  } else if (!position || typeof(position) != 'string' || position.length < 1) {
    throw new Error('Position was not provided');
  } else if (description && typeof(description) != 'string' || description.length < 1) {
    throw new Error('Description was provided, but format was unexpected');
  } else if (!range || !isValidMonthYearRange(range)) {
    throw new Error('Range is not valid');
  }
}

export function isValidProject(project: ObjectAny) {
  if (typeof(project) != 'object') {
    throw new Error("Experience format was unexpected");
  }
  const { name, position, description, range } = project;
  const mockExperience = { company: name, position, description, range };
  isValidExperience(mockExperience);
  return true;
}

export function isValidEducation(education: ObjectAny) {
  if (typeof(education) != 'object') {
    throw new Error("Experience format was unexpected");
  }
  const { school, degree, fieldOfStudy, range } = education;
  if (!school || typeof(school) != 'string' || school.length < 1) {
    throw new Error('Education name is missing from experience.');
  } else if (!degree || typeof(degree) != 'string' || degree.length < 1) {
    throw new Error('Position was not provided');
  } else if (!fieldOfStudy || typeof(fieldOfStudy) != 'string' || fieldOfStudy.length < 1) {
    throw new Error('Description was provided, but format was unexpected');
  } else if (!range || !isValidMonthYearRange(range)) {
    throw new Error('Range is not valid');
  }
}

export function isValidMonthInteger(monthInteger: number) {
  return monthInteger > 0 && monthInteger < 13;
}

export function isValidMonthYearRange(range: { start: [number, number], end?: [number, number] }) {
  if (!range || typeof range !== 'object' || !range.start || !Array.isArray(range.start) || range.start.length !== 2) {
    return false;
  }
  const { start, end } = range;

  // Validate the start date
  if (!isValidMonthInteger(start[0]) || start[1] < 1900) {
    return false;
  }

  // Validate the end date if provided
  if (end) {
    if (!Array.isArray(end) || end.length !== 2) {
      return false;
    }
    if (!isValidMonthInteger(end[0]) || end[1] < 1900) {
      return false;
    }
  }
  return true;
}


export function isValidCertification(certification: ObjectAny) {
  if (typeof(certification) != 'object') {
    throw new Error("Certification format was unexpected");
  }
  const { name, issuingOrg } = certification;
  if (!name || typeof(name) != 'string' || name.length < 1) {
    throw new Error('Name format was unexpected');
  } else if (!issuingOrg || typeof(issuingOrg) != 'string' || issuingOrg.length < 1) {
    throw new Error('"Issuing Organization format was unexpected');
  }
}
