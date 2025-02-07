export type ObjectAny = { [key: string]: any };

export type SocialType =
  | "instagram"
  | "twitter"
  | "youtube"
  | "linkedIn"
  | "discord";
export const SocialTypes = [
  "instagram",
  "twitter",
  "youtube",
  "linkedIn",
  "discord",
];
export type SocialObj = {
  type: SocialType;
  url: string;
};

export type AssessmentAction = 'create' | 'edit' | 'publish' | 'unpublish' | 'delete';
export const AssessmentActions = ['create', 'edit', 'publish', 'unpublish', 'delete'];

export type MentorshipRequestAction = 'send' | 'accept' | 'decline' | 'cancel' | 'removeMentor' | 'removeMentee';
export const MentorshipRequestActions = ['send', 'accept', 'decline', 'cancel', 'removeMentor', 'removeMentee'];
