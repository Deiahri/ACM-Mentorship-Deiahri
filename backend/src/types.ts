export type ObjectAny = { [key: string]: any };

export type SocialType =
  | "instagram"
  | "twitter"
  | "youtube"
  | "linkedIn"
  | "indeed"
  | "discord";
export const SocialTypes = [
  "instagram",
  "twitter",
  "youtube",
  "linkedIn",
  "indeed",
  "discord",
];
export type SocialObj = {
  type: SocialType;
  url: string;
};
