import { DBGetWithID } from "../db/db";
import { generateText } from "./GenAI";
import { validateUserObj } from "@shared/validation/user";
import { CheckUserBelowAIResumeQuota, CheckUserHasAIResumeTimeout, GetUserAIResumeTimeoutEnd } from "../db/check";
import { UserObj } from "@shared/types/general";

interface GenerateUserObjParams {
  text?: string;
  combine?: boolean;
  userID?: string;
  OAuthSubID?: string;
}

export class GenerateUserObjError extends Error {
  timeoutEnd?: number;
  constructor(message: string, timeoutEnd?: number) {
    super(message);
    this.name = "GenerateUserObjError";
    this.timeoutEnd = timeoutEnd;
  }
};

// TODO: test this function
export async function generateUserObjHandler(params: GenerateUserObjParams) {
  const { combine, text, userID, OAuthSubID } = params;
  if (typeof combine !== "boolean") {
    throw new GenerateUserObjError("combine must be a boolean");
  }

  if (!text || typeof text !== "string") {
    throw new GenerateUserObjError("text is required and must be a string");
  }

  if (!userID || typeof userID !== "string") {
    throw new GenerateUserObjError("userID is required and must be a string");
  }

  if (!OAuthSubID || typeof OAuthSubID !== "string") {
    throw new GenerateUserObjError("Unauthorized");
  }

  // check if user is above quota
  // quick fail if user is in timeout cache
  if (CheckUserHasAIResumeTimeout(userID)) {
    throw new GenerateUserObjError("User is above AI resume quota", GetUserAIResumeTimeoutEnd(userID));
  }

  const userData = await DBGetWithID('user', userID);
  if (!userData) {
    throw new GenerateUserObjError("User not found");
  }

  try {
    validateUserObj(userData);
  } catch (error) {
    throw new GenerateUserObjError("Invalid user data");
  }

  if (userData.OAuthSubID !== OAuthSubID) {
    throw new GenerateUserObjError("Unauthorized");
  }


  if (!(await CheckUserBelowAIResumeQuota(userID))) {
    throw new GenerateUserObjError("User is above AI resume quota", GetUserAIResumeTimeoutEnd(userID));
  }

  const response = await generateText(
    text,
    combine ? JSON.stringify(userData) : undefined
  );

  if (!response) return;
  
  // doesn't return full user obj, only parts that are expected to be updated from resume
  const partialUserObj: UserObj = {
    bio: response.bio,
    softSkills: response.softSkills,

    education: response.education,
    experience: response.experience,
    certifications: response.certifications,
    projects: response.projects,
    socials: response.socials
  };
  return partialUserObj;
}
