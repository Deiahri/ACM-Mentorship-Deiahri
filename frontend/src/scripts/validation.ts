import { ClientDataPayloadType, ClientDataPayloadTypes, ClientSocketState, ClientSocketStates } from "../features/ClientSocket/ClientSocket";
import { AssessmentQuestion, AssessmentQuestionInputTypes, ObjectAny } from "./types";

export function isClientSocketState(s: string): s is ClientSocketState {
  return ClientSocketStates.includes(s);
}

export function isClientDataPayloadType(s: string): s is ClientDataPayloadType {
  return ClientDataPayloadTypes.includes(s);
}

export function isAssessmentQuestion(q: object): q is AssessmentQuestion {
  if (!q || typeof(q) != 'object') {
    return false;
  }
  const qAny = q as ObjectAny;
  const { question, inputType } = qAny;
  if (!question || typeof(question) != 'string') {
    return false;
  } else if (!inputType || !AssessmentQuestionInputTypes.includes(inputType)) {
    return false;
  }
  return true;
}

export function isAssessmentQuestions(qArr: object[]): qArr is AssessmentQuestion[] {
  if (!qArr||!(qArr instanceof Array)) {
    return false;
  }
  for (let q of qArr) {
    if (!q || typeof(q) != 'object') {
      return false;
    }
    const qAny = q as ObjectAny;
    const { question, inputType } = qAny;
    if (!question || typeof(question) != 'string') {
      return false;
    } else if (!inputType || !AssessmentQuestionInputTypes.includes(inputType)) {
      return false;
    }
  }
  return true;
}
