import { ClientDataPayloadType, ClientDataPayloadTypes, ClientSocketState, ClientSocketStates, SubmitAssessmentAction, SubmitAssessmentActions } from "../features/ClientSocket/ClientSocket";
import { Assessment, AssessmentQuestion, AssessmentQuestionInputTypes, MentorshipRequestAction, MentorshipRequestActions, MentorshipRequestObj, Month, Months, ObjectAny, SocialType, SocialTypes } from "./types";

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

export function isSubmitAssessmentAction(s: string): s is SubmitAssessmentAction {
  return SubmitAssessmentActions.includes(s);
}

export function isAssessment(s: object): s is Assessment {
  if (!s || typeof(s) != 'object') {
    return false;
  }
  const sConv: ObjectAny = s;
  const { date, published, questions, userID } = sConv;
  if (!date || typeof(date) != 'number') {
    return false;
  } else if (typeof(published) != 'boolean') {
    return false;
  } else if (!userID || typeof(userID) != 'string') {
    return false;
  } else if (!questions || !(questions instanceof Array) || !isAssessmentQuestions(questions)) {
    return false;
  }
  return true;
}

export function isSocialType(s: string): s is SocialType {
  return SocialTypes.includes(s);
}

export function isMonth(s: string): s is Month {
  return Months.includes(s);
}

export function isMentorshipRequestObject(s: unknown): s is MentorshipRequestObj {
  if (!s || typeof(s) != 'object') {
    return false;
  }

  const mentorshipRequest = s as MentorshipRequestObj; // Type assertion after checks

  const { mentorID, menteeID, action, id } = mentorshipRequest; // Destructure here

  if (!id || typeof id !== 'string') {
    return false;
  }

  if (!mentorID || typeof mentorID !== 'string') {
    return false;
  }

  if (!menteeID || typeof menteeID !== 'string') {
    return false;
  }

  if (action && !isMentorshipRequestAction(action)) {
    return false;
  }

  return true;
}

export function isMentorshipRequestAction(s: unknown): s is MentorshipRequestAction {
  if (!s || typeof(s) != 'string') {
    return false;
  }
  return MentorshipRequestActions.includes(s);
}

