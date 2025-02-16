export type CardinalDirection = 'down' | 'left' | 'up' | 'right';
export type AnyFunction = (...args: any[]) => any;
export type ObjectAny = {
  [key: string]: any
};
export type AssessmentQuestion = {
  question?: string,
  inputType?: string,
  answer?: string,
  [key: string]: any
};

export type AssessmentQuestionInputType = 'text' | 'number' | 'boolean';
export const AssessmentQuestionInputTypes = ['text', 'number', 'boolean'];
export type Assessment = {
  questions?: AssessmentQuestion[],
  published?: boolean,
  userID?: string,
  date?: number,
  id?: string
};
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

export type Month =
  | 'January'
  | 'February'
  | 'March'
  | 'April'
  | 'May'
  | 'June'
  | 'July'
  | 'August'
  | 'September'
  | 'October'
  | 'November'
  | 'December';
export const Months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

export type MentorshipRequestObj = {
  menteeID?: string,
  mentorID?: string
  id?: string,
  status?: MentorshipRequestStatus
};
export type MentorshipRequestStatus = 'accepted' | 'declined' | 'cancelled';
export const MentorshipRequestStatuses = ['accepted', 'declined', 'cancelled'];

export type MentorshipRequestResponseAction = 'accept' | 'decline' | 'cancel';
export const MentorshipRequestResponseActions = ['accept', 'decline', 'cancel'];

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

export type ChatObj = {
  users: ChatObjUserPreviewMap,
  messages: string[],
  lastMessage: MessageObj,
  id: string
};

type ChatObjUserPreviewMap = {
  [userID: string]: {
    username: string,
    fName: string,
    mName?: string,
    lName: string,
    displayPictureURL?: string
  }
};

export type MessageObj = {
  contents: string,
  timestamp: number,
  sender: string,
  chatID: number,
  id: string
}
