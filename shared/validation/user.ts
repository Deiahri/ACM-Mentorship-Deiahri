import { UserObj } from "@shared/types/general";
import {
  isValidAssessmentPreviewMap,
  isValidGoalPreviewMap,
  isValidEducation,
  isValidExperience,
  isValidCertification,
  isValidProject,
  isValidSocial,
} from "./general";

export function validateUserObj(obj: unknown): asserts obj is UserObj {
  if (typeof obj !== "object" || obj === null) {
    throw new Error("UserObj must be a non-null object.");
  }

  const {
    fName,
    mName,
    lName,
    username,
    usernameLower,
    OAuthSubID,
    email,
    id,
    isMentee,
    isMentor,
    acceptingMentees,
    displayPictureURL,
    bio,
    assessments,
    menteeIDs,
    mentorIDs,
    mentorshipRequests,
    softSkills,
    goals,
    education,
    experience,
    certifications,
    projects,
    socials,
    testing,
    chats,
  } = obj as UserObj;

  if (OAuthSubID && typeof OAuthSubID !== "string") {
    throw new Error("OAuthSubID must be a string.");
  }

  if (fName != null && typeof fName !== "string") {
    throw new Error("fName must be a string.");
  }
  if (mName != null && typeof mName !== "string") {
    throw new Error("mName must be a string.");
  }
  if (lName != null && typeof lName !== "string") {
    throw new Error("lName must be a string.");
  }

  // note: does not check for uniqueness
  if (username != null && typeof username !== "string") {
    throw new Error("username must be a string.");
  }
  if (usernameLower != null && typeof usernameLower !== "string") {
    throw new Error("usernameLower must be a string.");
  }

  if (email != null && typeof email !== "string") {
    throw new Error("email must be a string.");
  }

  if (id != null && typeof id !== "string") {
    throw new Error("id must be a string.");
  }
  if (isMentee != null && typeof isMentee !== "boolean") {
    throw new Error("isMentee must be a boolean.");
  }
  if (isMentor != null && typeof isMentor !== "boolean") {
    throw new Error("isMentor must be a boolean.");
  }
  if (acceptingMentees != null && typeof acceptingMentees !== "boolean") {
    throw new Error("acceptingMentees must be a boolean.");
  }
  if (displayPictureURL != null && typeof displayPictureURL !== "string") {
    throw new Error("displayPictureURL must be a string.");
  }
  if (bio != null && typeof bio !== "string") {
    throw new Error("bio must be a string.");
  }

  if (assessments != null && !isValidAssessmentPreviewMap(assessments)) {
    throw new Error("Invalid assessments.");
  }
  if (menteeIDs != null && !Array.isArray(menteeIDs)) {
    throw new Error("menteeIDs must be an array.");
  }
  if (mentorIDs != null && !Array.isArray(mentorIDs)) {
    throw new Error("mentorIDs must be an array.");
  }
  if (mentorshipRequests != null && !Array.isArray(mentorshipRequests)) {
    throw new Error("mentorshipRequests must be an array.");
  }
  if (softSkills != null && !Array.isArray(softSkills)) {
    throw new Error("softSkills must be an array.");
  }
  if (goals != null && !isValidGoalPreviewMap(goals)) {
    throw new Error("Invalid goals.");
  }

  if (education != null) {
    if (!Array.isArray(education)) {
      throw new Error("education must be an array.");
    }
    education.forEach((edu) => isValidEducation(edu));
  }

  if (experience != null) {
    if (!Array.isArray(experience)) {
      throw new Error("experience must be an array.");
    }
    experience.forEach((exp) => isValidExperience(exp));
  }

  if (certifications != null) {
    if (!Array.isArray(certifications)) {
      throw new Error("certifications must be an array.");
    }
    certifications.forEach((cert) => isValidCertification(cert));
  }

  if (projects != null) {
    if (!Array.isArray(projects)) {
      throw new Error("projects must be an array.");
    }
    projects.forEach((proj) => isValidProject(proj));
  }

  if (socials != null) {
    if (!Array.isArray(socials)) {
      throw new Error("socials must be an array.");
    }
    socials.forEach((social) => isValidSocial(social));
  }

  if (testing != null && typeof testing !== "boolean") {
    throw new Error("testing must be a boolean.");
  }

  if (chats != null && !Array.isArray(chats)) {
    throw new Error("chats must be an array.");
  }
}