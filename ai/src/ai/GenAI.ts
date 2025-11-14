import { GoogleGenAI } from "@google/genai";
import { SocialTypes, UserObj } from "@shared/types/general";
import { validateUserObj } from "@shared/validation/user";
import env from "../env/env";

const genAI = new GoogleGenAI({
  apiKey: env.AI_API_KEY,
});


const ExampleUserObj: UserObj = {
  fName: "Jane",
  mName: "Optional",
  lName: "Doe",
  bio: "AI engineer.",
  softSkills: ["communication"],
  education: [
    {
      degree: "B.Sc. CS",
      school: "Tech Univ",
      fieldOfStudy: "AI",
      range: { start: [2020, 9], end: [2024, 6] },
    },
  ],
  experience: [
    {
      position: "Intern",
      company: "Innovatech",
      description: "Web dev.",
      range: { start: [2022, 1], end: [2022, 8] },
    },
    {
      position: "Developer",
      company: "Innovatech",
      description: "Web dev.",
      range: { start: [2023, 1], end: null },
    },
  ],
  certifications: [{ name: "AWS Cloud", issuingOrg: "Amazon" }],
  projects: [
    {
      name: "Mentorship Platform",
      description: "Mentor app.",
      position: "Lead Dev",
      range: { start: [2023, 3], end: [2023, 12] },
    },
  ],
  socials: [{ type: "github", url: "https://github.com/janedoe" }],
};

const maxRetries = 3;
export const generateText = async (
  userResumeData: string,
  combineWithData?: string
): Promise<UserObj | undefined> => {
  // Build prompt// Build prompt for AI
  const TotalPrompt = [
    `\n\n
    Example User Profile Structure:\n${JSON.stringify(ExampleUserObj)}`,
    combineWithData
      ? `Combine this profile with additional existing user data:\n${combineWithData}`
      : "",
    userResumeData ? `This is the user's resume data:\n${userResumeData}` : "",
    `social profiles should use the following types: ${Object.values(
      SocialTypes
    ).join(", ")}. If a type is not applicable, omit it.`,
    "IMPORTANT: Return only a valid JSON object. Do not include any markdown, explanations, or extra text.",
  ]
    .filter(Boolean)
    .join("\n\n");
  // const TotalPrompt = `${env.AI_SYSTEM_PROMPT}\n${ExampleUserObj}\n${ImportantPoints}\n${combineWithData ? `Combine with ${combineWithData}\n` : ''}${userResumeData}`;
  let currentPromptStart = env.AI_SYSTEM_PROMPT;
  let response = "";
  let attempts = 0;
  let satisfied = false;
  while (attempts < maxRetries && !satisfied) {
    try {
      const contents = currentPromptStart + TotalPrompt;
      console.log("Attempting generation with prompt:", contents);
      response =
        (
          await genAI.models.generateContent({
            model: env.AI_MODEL_NAME,
            contents: contents,
          })
        ).text || "";
      response = response.replace(/```json|```/g, "").trim();
      validateUserObj(JSON.parse(response));
      satisfied = true; // If validation passes, we are satisfied
    } catch (error) {
      currentPromptStart = `The previous response was invalid because: ${
        (error as Error).message
      }\nPrevious Response: ${response}\nPlease provide a valid UserObj in JSON format. Here is the original prompt:\n`;
      attempts++;
      if (attempts >= maxRetries) {
        throw new Error(
          "Failed to generate valid UserObj after multiple attempts"
        );
      }
    }
  }

  if (!satisfied) {
    return undefined;
  }

  try {
    return JSON.parse(response);
  } catch {
    return undefined;
  }
};
