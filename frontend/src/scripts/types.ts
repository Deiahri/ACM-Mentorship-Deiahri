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
  action?: MentorshipRequestAction
};
export type MentorshipRequestAction = 'accepted' | 'declined' | 'cancelled';
export const MentorshipRequestActions = ['accepted', 'declined', 'cancelled'];
