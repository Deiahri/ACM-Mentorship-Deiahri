export type ObjectAny = { [key: string]: any };

export type SocialType =
  | "instagram"
  | "twitter"
  | "youtube"
  | "linkedIn"
  | "discord"
  | "github"
  | "stackOverflow"
  | "hackerrank"
  | "facebook"
  | "portfolio";
export const SocialTypes = [
  "instagram",
  "twitter",
  "youtube",
  "linkedIn",
  "discord",
  "github",
  "stackOverflow",
  "hackerrank",
  "facebook",
  "portfolio"
];

export type SocialObj = {
  type: SocialType;
  url: string;
};

export type AssessmentAction =
  | "create"
  | "edit"
  | "publish"
  | "unpublish"
  | "delete";
export const AssessmentActions = [
  "create",
  "edit",
  "publish",
  "unpublish",
  "delete",
];

export type MentorshipRequestAction =
  | "send"
  | "accept"
  | "decline"
  | "cancel"
  | "removeMentor"
  | "removeMentee";
export const MentorshipRequestActions = [
  "send",
  "accept",
  "decline",
  "cancel",
  "removeMentor",
  "removeMentee",
];

export type GoalObj = {
  name?: string;
  tasks?: TaskObj[];
  id?: string;
  testing?: boolean;
  userID?: string;
};

export type TaskObj = {
  name?: string,
  description?: string,
  completitionDate?: number
};

export type SubmitGoalAction = 'create' | 'edit' | 'delete';
export const SubmitGoalActions = ['create', 'edit', 'delete'];

export type AssessmentPreviewMap = {
  [key: string]: AssessmentPreviewObj
}

export type AssessmentPreviewObj = {
  /**  ID of assessment */
  date: number
};

export type GoalPreviewMap = {
  [key: string]: GoalPreviewObj
};

export type GoalPreviewObj = {
  name: string
};

export type SendMessageAction = 'send' | 'create';
export const SendMessageActions = ['send', 'create'];
