import { Socket } from "socket.io";
import { DBCreate, DBDelete, DBGet, DBObj, DBSet, DBSetWithID } from "../db";
import { ObjectAny, SocialTypes } from "../types";
import {
  isValidCertification,
  isValidEducation,
  isValidExperience,
  isValidFirstName,
  isValidLastName,
  isValidMiddleName,
  isValidNames,
  isValidProject,
  isValidSocial,
  isValidUsername,
} from "../scripts/validation";

export type AuthenticatedSocketAdditionalParameters = {
  deleteAccountAfterDisconnect?: boolean;
  testing?: boolean;
};

type AuthenticatedSocketState =
  | "connecting"
  | "authed_nouser"
  | "authed_user"
  | "connect_error";

type UserObj = {
  id?: string;
  OAuthSubID?: string;
};
export default class AuthenticatedSocket {
  socket: Socket;
  state: AuthenticatedSocketState;
  user: UserObj;
  currentSocketStateEvents: { [key: string]: (...args: any[]) => void } = {};
  socketEventTestingVariables: Map<string, unknown> = new Map<
    string,
    unknown
  >();

  constructor(socket: Socket, userSubID: string, additional?: any) {
    this.socket = socket;
    this.user = { OAuthSubID: userSubID };
    this._processAdditionalSettings(additional);
    this._enter_connect_state();
  }

  private _processAdditionalSettings(additional: ObjectAny) {
    if (!additional || typeof additional != "object") {
      return;
    }

    this._enableTestingListeners();
    if (additional.deleteAccountAfterDisconnect) {
      this.socket.on("disconnect", async () => {
        // its possible client changed deleteAccountAfterDisconnect value to false.
        if (!additional.deleteAccountAfterDisconnect) {
          return;
        }
        try {
          await DBDelete("user", [["OAuthSubID", "==", this.user.OAuthSubID]]);
        } catch {
          console.error(
            "_processAdditionalSettings | problem deleting user after disconnect"
          );
        }
      });
    }
  }

  private async _enter_connect_state() {
    const userSubID = this.user.OAuthSubID;
    this._setState("connecting");
    let userData: DBObj;

    try {
      const res = await DBGet("user", [["OAuthSubID", "==", userSubID]]);

      // enter authed no user state if no user data exists for this subID.
      if (!res || res.length == 0) {
        this._enter_authed_nouser_state();
        return;
      }
      userData = res[0];
    } catch (err) {
      // if there is an error getting data, then set state and disconnect.
      this._setState("connect_error");
      this.socket.disconnect();
      return;
    }

    // userData has been retreived at this point.
    this._enter_authed_user_state(userData);
  }

  /**
   * In authed_nouser state we wait for user to submit data to create their user profile.
   * Once this data is received and validated, they can enter the authed_user state.
   * @param userSubID OAuth subID.
   */
  private async _enter_authed_nouser_state() {
    this._cleanupSocketEvents();
    this._setState("authed_nouser");

    this._addStateSocketEvent("createUser", this.handleCreateUser.bind(this));
  }

  private async _enter_authed_user_state(userData: DBObj) {
    this.user = userData;
    this._cleanupSocketEvents();
    this._setState("authed_user");

    this._addStateSocketEvent(
      "updateProfile",
      this.handleUpdateProfile.bind(this)
    );
  }

  private _setState(state: AuthenticatedSocketState) {
    this.state = state;
    this.socket.emit("state", state);
  }

  sendClientMessage(title: string, body: string) {
    this.socket.emit("message", { title, body });
  }

  /**
   * This function is called when state = authed_nouser.
   * @param dataRaw should contain fName, lName, username, and optionally mName.
   * @param callback callback that is used to tell client if successful or not.
   * @returns nada
   */
  async handleCreateUser(dataRaw: unknown, callback: unknown) {
    const createUserSubject = "Fatal error while creating user: ";
    try {
      if (!callback || typeof callback != "function") {
        this.sendClientMessage(
          "Error",
          createUserSubject + "No callback function was provided."
        );
        return;
      } else if (!dataRaw || typeof dataRaw != "object") {
        callback(false);
        this.sendClientMessage(
          "Error",
          createUserSubject + "No data was provided."
        );
        return;
      }

      const data: ObjectAny = dataRaw;
      const { fName, mName, lName, username } = data;

      // verify names are useable
      try {
        isValidNames(fName, mName, lName);
      } catch (err: unknown) {
        if (err instanceof Error) {
          callback(false);
          this.sendClientMessage("Error", createUserSubject + err.message);
          return;
        }
      }

      // verify username is available
      try {
        await isValidUsername(username);
      } catch (err: unknown) {
        if (err instanceof Error) {
          callback(false);
          this.sendClientMessage("Error", createUserSubject + err.message);
          return;
        }
      }

      // stuff is valid, create user.
      let userID: string;
      const userSubID = this.user.OAuthSubID;
      try {
        const userData = {
          username,
          fName,
          mName: mName || null,
          lName,
          OAuthSubID: userSubID,
        };
        userID = await DBCreate("user", userData);
        this.user = {
          ...userData,
          id: userID,
        };
      } catch (err) {
        if (err instanceof Error) {
          callback(false);
          this.sendClientMessage("Error", createUserSubject + err.message);
          return;
        }
      }
      callback(true);
    } catch (err) {
      if (err instanceof Error) {
        this.sendClientMessage("Error", createUserSubject + err.message);
        return;
      }
    }
  }

  async handleUpdateProfile(dataRaw: unknown, callback: unknown) {
    const handleUpdateProfileSubject = "Error while updating profile: ";
    try {
      if (!callback || typeof callback != "function") {
        this.sendClientMessage(
          "Error",
          handleUpdateProfileSubject + "No callback function was provided."
        );
        return;
      } else if (!dataRaw || typeof dataRaw != "object") {
        callback(false);
        this.sendClientMessage(
          "Error",
          handleUpdateProfileSubject + "No data was provided."
        );
        return;
      }

      const data: ObjectAny = dataRaw;
      // extract all possible updates
      const {
        fName,
        mName,
        lName,
        socials,
        experience,
        education,
        certifications,
        projects,
        softSkills,
        isMentor,
        acceptingMentees,
      } = data;
      const newUserObj = { ...JSON.parse(JSON.stringify(this.user)) };

      // process fName, mName, and lName
      try {
        if (fName || typeof fName == "string") {
          isValidFirstName(fName);
          newUserObj.fName = fName;
        }
        if (mName || typeof mName == "string") {
          isValidMiddleName(mName);
          newUserObj.mName = mName || null;
        }
        if (lName || typeof lName == "string") {
          isValidLastName(lName);
          newUserObj.fName = lName;
        }
      } catch (err) {
        if (err instanceof Error) {
          this.sendClientMessage(
            "Error",
            handleUpdateProfileSubject + err.message
          );
        }
        callback(false);
        return;
      }

      // process socials
      if (socials) {
        if (!(socials instanceof Array)) {
          this.sendClientMessage(
            "Error",
            handleUpdateProfileSubject + "Socials are not formatted correctly."
          );
          callback(false);
          return;
        }

        // ensure all socials are valid.
        for (let social of socials) {
          try {
            isValidSocial(social);
          } catch (err) {
            if (err instanceof Error) {
              this.sendClientMessage(
                "Error",
                handleUpdateProfileSubject + err.message
              );
            }
            callback(false);
            return;
          }
        }

        newUserObj.socials = socials;
      }

      if (experience) {
        if (!(experience instanceof Array)) {
          this.sendClientMessage(
            "Error",
            handleUpdateProfileSubject +
              "Experiences are not formatted correctly."
          );
          callback(false);
          return;
        }

        // ensure all experiences are valid.
        for (let currentExperience of experience) {
          try {
            isValidExperience(currentExperience);
          } catch (err) {
            if (err instanceof Error) {
              this.sendClientMessage(
                "Error",
                handleUpdateProfileSubject + err.message
              );
            }
            callback(false);
            return;
          }
        }
        newUserObj.experience = JSON.stringify(experience);
      }

      if (education) {
        if (!(education instanceof Array)) {
          this.sendClientMessage(
            "Error",
            handleUpdateProfileSubject +
              "Educations are not formatted correctly."
          );
          callback(false);
          return;
        }

        // ensure all experiences are valid.
        for (let currentEducation of education) {
          try {
            isValidEducation(currentEducation);
          } catch (err) {
            if (err instanceof Error) {
              this.sendClientMessage(
                "Error",
                handleUpdateProfileSubject + err.message
              );
            }
            callback(false);
            return;
          }
        }
        newUserObj.education = education;
      }

      if (certifications) {
        if (!(certifications instanceof Array)) {
          this.sendClientMessage(
            "Error",
            handleUpdateProfileSubject +
              "Educations are not formatted correctly."
          );
          callback(false);
          return;
        }

        // ensure all experiences are valid.
        for (let certification of certifications) {
          try {
            isValidCertification(certification);
          } catch (err) {
            if (err instanceof Error) {
              this.sendClientMessage(
                "Error",
                handleUpdateProfileSubject + err.message
              );
            }
            callback(false);
            return;
          }
        }
        newUserObj.certifications = certifications;
      }

      if (projects) {
        if (!(projects instanceof Array)) {
          this.sendClientMessage(
            "Error",
            handleUpdateProfileSubject +
              "Experiences are not formatted correctly."
          );
          callback(false);
          return;
        }

        // ensure all experiences are valid.

        for (let project of projects) {
          try {
            isValidProject(project);
          } catch (err) {
            if (err instanceof Error) {
              this.sendClientMessage(
                "Error",
                handleUpdateProfileSubject + err.message
              );
            }
            callback(false);
            return;
          }
        }
        newUserObj.projects = projects;
      }

      if (softSkills) {
        if (!(softSkills instanceof Array)) {
          this.sendClientMessage(
            "Error",
            handleUpdateProfileSubject +
              "Soft skills are not correctly formatted."
          );
          callback(false);
          return;
        }
        for (let softSkill of softSkills) {
          if (typeof softSkill != "string" || softSkill.length < 3) {
            this.sendClientMessage(
              "Error",
              handleUpdateProfileSubject +
                "Soft skill "+softSkill+" is not valid."
            );
            callback(false);
            return;
          }
        }

        newUserObj.softSkills = softSkills;
      }

      if (typeof(isMentor) == 'boolean') {
        newUserObj.isMentor = isMentor;
      } else if (isMentor) {
        this.sendClientMessage(
          "Error",
          handleUpdateProfileSubject +
            "isMentor value is invalid."
        );
        callback(false);
        return;
      }

      if (typeof(acceptingMentees) == 'boolean') {
        newUserObj.acceptingMentees = acceptingMentees;
      } else if (acceptingMentees) {
        this.sendClientMessage(
          "Error",
          handleUpdateProfileSubject +
            "acceptingMentees value is not valid."
        );
        callback(false);
        return;
      }

      // everything valid, write to profile
      try {
        await DBSetWithID("user", this.user.id, newUserObj, false);
      } catch (err) {
        if (err instanceof Error) {
          this.sendClientMessage(
            "Error",
            handleUpdateProfileSubject + err.message
          );
        }
        callback(false);
        return;
      }

      callback(true);
    } catch (err) {
      if (err instanceof Error) {
        this.sendClientMessage(
          "Error",
          handleUpdateProfileSubject + err.message
        );
        return;
      }
    }
  }

  /**
   * adds event function pair to socket.
   * also adds it to `currentSocketStateEvents` to keep track of current socket events (used by ``_cleanupSocketEvents``).
   * @param event
   * @param func
   */
  private _addStateSocketEvent(event: string, func: (...args: any[]) => void) {
    this.currentSocketStateEvents[event] = func;
    this.socket.on(event, func);
  }

  /**
   * Remove all socket events listed in ```this.currentSocketStateEvents``` from the socket.
   */
  private _cleanupSocketEvents() {
    for (let key in this.currentSocketStateEvents) {
      this.socket.removeListener(key, this.currentSocketStateEvents[key]);
    }
  }

  /**
   * Enables a socket event that allows client to update a variable
   */
  private _enableTestingListeners() {
    const errorHeader = "Cannot set testing variable, ";
    this.socket.on(
      "setTestingVariable",
      (variable: string, val: unknown, callback: (...args: any[]) => void) => {
        if (!callback || typeof callback != "function") {
          this.sendClientMessage(
            "Error",
            errorHeader + "no callback was provided"
          );
          return;
        } else if (!variable || typeof variable != "string") {
          this.sendClientMessage(
            "Error",
            errorHeader + "invalid variable name provided"
          );
          return;
        }
        this.socketEventTestingVariables.set(variable, val);
        callback(true);
      }
    );
  }
}
