import { DBDeleteWithID, DBGetWithID, DBSetWithID } from "../../db";
import { SendClientsDataWithUserID } from "../AuthenticatedSocket";

export async function RemoveOutgoingMentorshipRequestsFromUser(userID: string) {
  const userData = await DBGetWithID("user", userID);
  const { mentorshipRequests } = userData;

  if (!mentorshipRequests || !(mentorshipRequests instanceof Array)) {
    return;
  }

  for (let mentorshipRequestID of mentorshipRequests) {
    try {
      const mentorshipRequestObj = await DBGetWithID(
        "mentorshipRequest",
        mentorshipRequestID
      );
      if (!mentorshipRequestID) {
        continue;
      }
      const { mentorID, menteeID } = mentorshipRequestObj;
      if (!mentorID || !menteeID) {
        continue;
      }

      if (menteeID != userID) {
        continue;
      }
      await RemoveMentorshipRequest(mentorshipRequestID, "cancelled");
    } catch (err) {
      console.error("[0scaj0s] RemoveOutgoingMentorshipRequests: " + err);
    }
  }
}

export async function RemoveMentorshipRequest(
  mentorshipRequestID: string,
  alertStatus: string
) {
  if (!mentorshipRequestID) {
    return;
  }

  const mentorshipRequestObj = await DBGetWithID(
    "mentorshipRequest",
    mentorshipRequestID
  );
  if (!mentorshipRequestObj || typeof mentorshipRequestObj != "object") {
    return;
  }

  await DBDeleteWithID("mentorshipRequest", mentorshipRequestID);

  const { mentorID, menteeID } = mentorshipRequestObj;
  if (!mentorID || !menteeID) {
    console.error(
      "Something was wrong with the mentorship request",
      JSON.stringify(mentorshipRequestObj)
    );
    return;
  }

  await RemoveMentorshipRequestFromUser(mentorshipRequestID, mentorID);
  await RemoveMentorshipRequestFromUser(mentorshipRequestID, menteeID);

  SendClientsDataWithUserID([mentorID, menteeID], "mentorshipRequest", {
    ...mentorshipRequestObj,
    id: mentorshipRequestID,
    status: alertStatus,
  });
}

export async function RemoveMentorshipRequestFromUser(
  mentorshipRequestID: string,
  userID: string
) {
  if (!userID) {
    return;
  }

  const userData = await DBGetWithID("user", userID);
  if (!userData) {
    return;
  }

  const { mentorshipRequests } = userData;
  if (!mentorshipRequests) {
    return;
  }

  if (!(mentorshipRequests instanceof Array)) {
    console.error(`Mentorship request for ${userID} is invalid.`);
    return;
  }

  try {
    mentorshipRequests.splice(mentorshipRequests.indexOf(mentorshipRequestID));
    await DBSetWithID("user", userID, { mentorshipRequests }, true);
  } catch (err) {
    console.error(
      "Tried to remove mentorship request from user, but they did not have it. " +
        err.message
    );
  }
}
