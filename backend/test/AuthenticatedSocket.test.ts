import { expect, it, describe, afterAll } from "vitest";
import { io, ManagerOptions, Socket, SocketOptions } from "socket.io-client";
import { sleep } from "../src/scripts/tools";

import {
  isSocketServerOnline,
  StartSocketServer,
} from "../src/socket/socketServer";

import {
  StartExpressServer,
  isExpressServerOnline,
} from "../src/server/server";
import { DBDeleteWithID, DBGet, DBGetWithID } from "../src/db";
import { ObjectAny } from "../src/types";
import AuthenticatedSocket from "../src/socket/AuthenticatedSocket";

async function ExpectNoUsersWithTestingToken(token: string) {
  const dat = await DBGet("user", [["OAuthSubID", "==", token]]);
  if (dat.length > 0) {
    for (let user of dat) {
      await DBDeleteWithID("user", user.id);
    }
    return false;
  }
  return true;
}

describe("Tests authenticated Socket", () => {
  let socket1: Socket;
  let socket1TestToken = "theGuy";
  let socket1Data: ObjectAny = {};
  const socket1Username = "LaoGui";
  const socket1FName = "Tester";
  const socket1LName = "Tester";

  let socket2: Socket;
  let socket2TestToken = "herobrine";
  let socket2Data: ObjectAny = {};
  const socket2Username = "JudgementKazzy";
  const socket2FName = "Kiryu";
  const socket2LName = "Kazuma";

  function updateState(
    targetSocketData: ObjectAny,
    state: string,
    discriminator: string
  ) {
    console.log("received state update", state, discriminator);
    targetSocketData.state = state;
  }

  const HANDLE_DATA_ERROR_HEADER = "####### HANDLE DATA ERROR #######\n";
  function handleData(
    payload: unknown,
    targetSocketData: ObjectAny,
    discriminator: string
  ) {
    console.log("DATA!", targetSocketData.id, discriminator, payload);
    function printDataError(msg: unknown) {
      console.error(HANDLE_DATA_ERROR_HEADER + msg, payload);
    }
    if (!payload || typeof payload != "object") {
      printDataError("Received invalid payload data");
      return;
    }

    const type = payload["type"];
    const data = payload["data"];
    if (!type || !data) {
      printDataError("Undefined type or data for payload");
      return;
    } else if (type == "userID") {
      if (typeof data != "string") {
        printDataError("Expected userID to be a string");
        return;
      }
      targetSocketData.id = data;
    } else if (type == "users") {
      // ensure userData paylaod is an array of objects, where each object is of type string
      if (!(data instanceof Array)) {
        printDataError("Expected user data to be in array");
        return;
      }

      for (let user of data) {
        if (typeof data != "object") {
          printDataError("Expected user data in array to be objects");
          return;
        }
        const id = user.id;
        if (!id || typeof id != "string") {
          printDataError(
            "Expected user data object to have id or type string."
          );
          return;
        }

        // if user data meets specs, add it to users object.
        if (typeof targetSocketData.user == "object") {
          targetSocketData.users[id] = user;
        } else {
          targetSocketData.users = {
            [id]: user,
          };
        }
      }
    } else if (type == "assessments") {
      if (!targetSocketData.assessments) {
        targetSocketData.assessments = {};
      }
      for (let assessment of data) {
        targetSocketData.assessments[assessment.id] = assessment;
      }
      // targetSocketData.assessments = targetSocketData.assessments ? [...targetSocketData.assessments, ...assessments] : [assessments];
    } else if (type == "mentorshipRequest") {
      if (!(data instanceof Array)) {
        printDataError("Expected mentorshipRequest data to come in array");
        return;
      }

      if (!targetSocketData.mentorshipRequests) {
        targetSocketData.mentorshipRequests = {};
      }

      for (let mentorshipRequest of data) {
        if (typeof(mentorshipRequest) != 'object') {
          printDataError("Expected mentorshipRequest data to be objects");
          continue;
        }
        const { mentorID, menteeID, id, status } = mentorshipRequest;
        if (status) {
          console.log('removing mentorship request for', targetSocketData.id, id, status);
          delete targetSocketData.mentorshipRequests[id];
          continue;
        }

        if (!mentorID || !menteeID) {
          printDataError("Missing some parameters for mentorshipRequest object");
          continue;
        }

        targetSocketData.mentorshipRequests[id] = {
          mentorID, menteeID
        };
      }
    }
  }

  /**
   * This function returns a promise that only resolves if the targetSocketData observes changes that are required for the given state.
   * @param targetSocketData
   * @returns
   */
  function ExpectCorrectDataOnConnect(
    targetSocketData: ObjectAny,
    errorMessage?: string
  ) {
    // deletes any pre-existing data the socket received.
    delete targetSocketData.id;
    delete targetSocketData.users;
    delete targetSocketData.state;
    delete targetSocketData.assessments;

    // expect state to be authed user, and to receive userData and userID.
    return new Promise(async (res, rej) => {
      setTimeout(
        () =>
          rej(
            "did not receive connection parameters fast enough S)Jc9djv, " +
              errorMessage
          ),
        4000
      );

      // waits for data to be updated correctly.
      while (true) {
        if (
          targetSocketData.state == "authed_user" &&
          targetSocketData.id &&
          targetSocketData.users
        ) {
          break;
        } else if (targetSocketData.state == "authed_nouser") {
          break;
        }
        await sleep(100);
      }
      await sleep(500);
      res(true);
    });
  }

  // creates socket that fails to connect without testing token
  function ConnectWithParams(
    succeed: boolean,
    errorMessage: string,
    opts?: ManagerOptions | SocketOptions
  ) {
    return new Promise<Socket>((res, rej) => {
      const tempSocket = io(
        `http://localhost:${process.env.SOCKET_SERVER_PORT}`,
        opts
      );
      tempSocket.on("connect_error", () => {
        succeed ? rej("Expected success |" + errorMessage) : res(tempSocket);
      });
      tempSocket.on("connect", () =>
        succeed ? res(tempSocket) : rej("expected failure | " + errorMessage)
      );
      tempSocket.onAny((param) => {
        console.log("any_", errorMessage, param);
      });
    });
  }

  function CreateUser(
    targetSocket: Socket,
    params: Object | undefined,
    succeed: boolean,
    errorMessage: string
  ) {
    return new Promise((res, rej) => {
      targetSocket.emit("createUser", params, (v: boolean) => {
        v
          ? succeed
            ? res(true)
            : rej("Expected failure" + errorMessage)
          : succeed
          ? rej("Expected success" + errorMessage)
          : res(true);
      });
      setTimeout(
        () =>
          rej(
            "create user request did not respond quick enough, " + errorMessage
          ),
        4000
      );
    });
  }

  function GetMentorshipRequestFromData(targetSocketData: ObjectAny) {
    // so this should get the mentorship request from our data correctly if it exists.
    try {
      return Object.keys(targetSocketData.mentorshipRequests)[0];
    } catch {
      return undefined;
    }
  }

  it("Should activate server correctly", async () => {
    if (!isExpressServerOnline()) {
      try {
        await StartExpressServer();
      } catch (err) {
        console.log(
          "================== Express Server is already online ================ ",
          err
        );
      }
    }

    // ensures socket server is online
    if (!isSocketServerOnline()) {
      try {
        await StartSocketServer();
      } catch {
        console.log(
          "======================== seems server is already online. ======================="
        );
      }
    }
  });

  it("Should have no users with testing tokens", async () => {
    if (!(await ExpectNoUsersWithTestingToken(socket1TestToken))) {
      throw new Error(
        "Expected no users with testing token " +
          socket1TestToken +
          ". Likely clean up function doesn't work as expected."
      );
    }

    if (!(await ExpectNoUsersWithTestingToken(socket2TestToken))) {
      throw new Error(
        "Expected no users with testing token " +
          socket2TestToken +
          ". Likely clean up function doesn't work as expected."
      );
    }
  });

  it(
    "Should only connect if given a valid testing token",
    { timeout: 10000 },
    async () => {
      await ConnectWithParams(false, "ale");
      await ConnectWithParams(false, "ola", {});
      await ConnectWithParams(false, "msi", { auth: undefined });
      await ConnectWithParams(false, "9sxa0", { auth: {} });
      await ConnectWithParams(false, "0C)k30", {
        auth: {
          token: undefined,
        },
      });

      await ConnectWithParams(false, "mimsaid", {
        auth: {
          token: "",
        },
      });

      await ConnectWithParams(false, "restart", {
        auth: {
          token: "nonsense",
        },
      });

      // try connecting with non-sample user access token.
      const realSocket = await ConnectWithParams(
        true,
        "| env SAMPLE_USER_ACCESS_TOKEN is likely expired. Replace it with a real token.",
        {
          auth: {
            token: `Bearer ${process.env.SAMPLE_USER_ACCESS_TOKEN}`,
          },
        }
      );
      realSocket.disconnect();

      const tempSocket = await ConnectWithParams(true, "hamijambi", {
        auth: {
          token: "testing rambutan",
        },
      });
      tempSocket.disconnect();
    }
  );

  it(
    "should see socket1 connect, and observe correct state changes",
    { timeout: 5000 },
    async () => {
      socket1 = await ConnectWithParams(true, "socket1 connect", {
        auth: {
          token: `testing ${socket1TestToken}`,
          deleteAccountAfterDisconnect: true,
        },
      });

      socket1.on("state", (state) => updateState(socket1Data, state, "xs0sx"));
      socket1.on("message", (dat) =>
        console.log("received message for socket1", dat)
      );
      socket1.on("data", (payload) =>
        handleData(payload, socket1Data, "skx0s")
      );

      // reset data
      socket1Data = {};
      // expect to receive authed_nouser state.
      await new Promise((res, rej) => {
        socket1.once("state", (state) => {
          if (state == "authed_user") {
            rej("Got unexpected state from socket1");
          } else if (state == "authed_nouser") {
            res(true);
          }
        });
      });
    }
  );

  describe("Create user, logging in and out, and socket map changes", () => {
    it("should create a user account given correct parameters, and observe state change", async () => {
      // send no params
      await CreateUser(socket1, undefined, false, "iasdnisd");

      // send nonsense params
      await CreateUser(socket1, true, false, "V(O*HY");

      // send empty params
      await CreateUser(socket1, {}, false, "aso9ch8");

      // send object with nonsense
      await CreateUser(
        socket1,
        { hoobie: "Tester", joobie: false },
        false,
        "A)(HV"
      );

      // send valid fName and lName, no username
      await CreateUser(
        socket1,
        { fName: "Tester", lName: "Bester" },
        false,
        ")C(DHc"
      );

      // send valid fName and lName, with undefined username
      await CreateUser(
        socket1,
        { fName: "Tester", lName: "Bester", username: undefined },
        false,
        "24o9842gh"
      );

      // send valid fName and lName, with nonsense username
      await CreateUser(
        socket1,
        { fName: "Tester", lName: "Bester", username: true },
        false,
        ")Hg938h"
      );

      // send valid fName and lName, with valid username
      await CreateUser(
        socket1,
        { fName: socket1FName, lName: socket1LName, username: socket1Username },
        true,
        "_)VE&*7fv"
      );
    });

    it(
      "should have only one socket in socketList with current userID",
      { timeout: 10000 },
      async () => {
        // give server time to add user to update socket map.
        let found = false;
        setTimeout(() => {
          if (!found) {
            throw new Error(
              "socket1 did not appear in socket map in time )D_l2f"
            );
          }
        }, 5000);

        // keep checking socket map to see if socket1 appears
        while (true) {
          const userID = socket1Data.id;
          console.log(
            "socketMap",
            socket1Data.id,
            AuthenticatedSocket.AllSockets
          );
          const users = AuthenticatedSocket.AllSockets.get(userID);
          if (users) {
            expect(users).toBeDefined();
            expect(users!.length).toBe(1);
            expect(users![0].user.username).toBe(socket1Username);
            found = true;
            break;
          }
          await sleep(300);
        }
      }
    );

    it("Should be able to successfully logout of account without deleting it.", async () => {
      const userID = socket1Data.id;
      const userRes = await DBGetWithID("user", userID);
      expect(userRes).toBeDefined();
      // tell it not to delete account after disconnect.
      await new Promise((res, rej) => {
        socket1.emit(
          "setTestingVariable",
          "deleteAccountAfterDisconnect",
          false,
          (v: boolean) => {
            v
              ? res(true)
              : rej("Expected to change testing variable successfully");
          }
        );
      });

      await sleep(500);

      socket1.disconnect();
    });

    it("socket1 should no longer be in AllSockets list", async () => {
      // give server time to add user to update socket map.
      await sleep(1000);
      const userID = socket1Data.id;
      const users = AuthenticatedSocket.AllSockets.get(userID);
      expect(users).toBeUndefined();
    });

    it("Should be able to log back into created account", async () => {
      // connect to server
      socket1 = await ConnectWithParams(true, "mxisbidavd", {
        auth: {
          token: `testing ${socket1TestToken}`,
          deleteAccountAfterDisconnect: true,
        },
      });
      socket1.on("state", (state) =>
        updateState(socket1Data, state, "s0ax0ks")
      );
      socket1.on("message", (msg) => console.log("received message, s1", msg));
      socket1.on("data", (payload) =>
        handleData(payload, socket1Data, "0s0kc")
      );

      socket1Data = {};

      // expect state to be authed user, and to receive data for users and userID.
      await ExpectCorrectDataOnConnect(socket1Data, "__xj9sc");
    });

    it(
      "Should find socket1 should be back in socket map",
      { timeout: 10000 },
      async () => {
        // give server time to add user to update socket map.
        let found = false;
        setTimeout(() => {
          if (!found) {
            throw new Error(
              "socket1 did not appear in socket map in time ((Dj"
            );
          }
        }, 5000);

        // keep checking socket map to see if socket1 appears
        const userID = socket1Data.id;
        while (true) {
          console.log("socketMap2", userID, AuthenticatedSocket.AllSockets);
          const users = AuthenticatedSocket.AllSockets.get(userID);
          if (users) {
            expect(users).toBeDefined();
            expect(users!.length).toBe(1);
            expect(users![0].user.username).toBe(socket1Username);
            found = true;
            break;
          }
          await sleep(300);
        }
      }
    );

    it("Another socket should be able to connect using socket1's credentials while socket1 is connected, observer correct socket map changes, and disconnect", async () => {
      const anotherSocket1 = await ConnectWithParams(true, "barmitsfa", {
        auth: {
          token: `testing ${socket1TestToken}`,
        },
      });

      // give server time to send state and stuff.
      const AnotherSocket1Data = {};
      anotherSocket1.on("state", (state) =>
        updateState(AnotherSocket1Data, state, "scs0as")
      );
      anotherSocket1.on("message", (msg) =>
        console.log("received message, aS1", msg)
      );
      anotherSocket1.on("data", (payload) =>
        handleData(payload, AnotherSocket1Data, "shsisis")
      );

      // expect state to be authed user, and to receive data for users and userID.
      await ExpectCorrectDataOnConnect(AnotherSocket1Data, "asocjspa/?");

      // give server time to add user to update socket map.
      let found = false;
      setTimeout(() => {
        if (!found) {
          throw new Error(
            "socket1 did not appear in socket map in time XNics9"
          );
        }
      }, 5000);

      // keep checking socket map to see if socket1 appears
      while (true) {
        const userID = socket1Data.id;
        console.log("socketMap3", userID, AuthenticatedSocket.AllSockets);
        const users = AuthenticatedSocket.AllSockets.get(userID);
        if (users) {
          expect(users).toBeDefined();
          expect(users!.length).toBe(2);
          expect(users![0].user.username).toBe(socket1Username);
          expect(users![1].user.username).toBe(socket1Username);
          found = true;
          break;
        }
        await sleep(300);
      }

      // disconnect and give server time to update socket map.
      anotherSocket1.disconnect();
      await sleep(1000);

      let found2 = false;
      setTimeout(() => {
        if (!found2) {
          throw new Error(
            "socket1 did not appear in socket map in time X)cj-s"
          );
        }
      }, 5000);

      // keep checking socket map to see if socket1 appears.
      // only 1 socket1 should appear this time.
      while (true) {
        const userID = socket1Data.id;
        console.log("socketMap4", userID, AuthenticatedSocket.AllSockets);
        const users = AuthenticatedSocket.AllSockets.get(userID);
        if (users) {
          expect(users).toBeDefined();
          expect(users!.length).toBe(1);
          expect(users![0].user.username).toBe(socket1Username);
          found2 = true;
          break;
        }
        await sleep(300);
      }
    });
  });

  describe("handleUpdateProfile", () => {
    it("should successfully update the profile with valid data", async () => {
      const validProfileData = {
        fName: "John",
        mName: "A",
        lName: "Doe",
        socials: [{ type: "linkedIn", url: "https://linkedin.com/in/johndoe" }],
        experience: [
          {
            company: "Tech Corp",
            position: "Software Engineer",
            description: "Developed software",
            range: {
              start: [1, 2020],
              end: [12, 2022],
            },
          },
        ],
        education: [
          {
            school: "MIT",
            degree: "BSc Computer Science",
            fieldOfStudy: "Computer Science",
            range: {
              start: [8, 2015],
              end: [5, 2019],
            },
          },
        ],
        certifications: [
          {
            name: "AWS Certified Developer",
            issuingOrg: "Amazon Web Services",
          },
        ],
        projects: [
          {
            name: "AI Chatbot",
            position: "Lead Developer",
            description: "Built a chatbot with AI",
            range: {
              start: [1, 2022],
              end: [12, 2022],
            },
          },
        ],
        softSkills: ["Leadership", "Communication"],
        isMentor: true,
        acceptingMentees: false,
      };

      await new Promise((res, reject) => {
        socket1.emit("updateProfile", validProfileData, (response) => {
          expect(response).toBe(true);
          res(true);
        });
        setTimeout(
          () => reject("did not receive response in time. 9SCJ9#"),
          2000
        );
      });
    });

    it("should fail when experience contains invalid data", async () => {
      const invalidProfileData = {
        fName: "John",
        lName: "Doe",
        experience: [
          {
            company: "",
            position: "Software Engineer",
            description: "Developed software",
            range: {
              start: [1, 2020],
              end: [12, 2022],
            },
          },
        ],
      };

      await new Promise((res, reject) => {
        socket1.emit("updateProfile", invalidProfileData, (response) => {
          // ??X9eh
          expect(response).toBe(false);
          res(true);
        });
        setTimeout(
          () => reject("did not receive response in time. C(J9g9j4"),
          2000
        );
      });
    });

    it("should fail when education contains invalid data", async () => {
      const invalidProfileData = {
        fName: "John",
        lName: "Doe",
        education: [
          {
            school: "",
            degree: "BSc Computer Science",
            fieldOfStudy: "Computer Science",
            range: {
              start: [8, 2015],
              end: [5, 2019],
            },
          },
        ],
      };

      await new Promise((res, reject) => {
        socket1.emit("updateProfile", invalidProfileData, (response) => {
          // X__C0e
          expect(response).toBe(false);
          res(true);
        });
        setTimeout(
          () => reject("did not receive response in time. <c)Cscs>"),
          2000
        );
      });
    });

    it("should fail when projects contain invalid data", async () => {
      const invalidProfileData = {
        fName: "John",
        lName: "Doe",
        projects: [
          {
            name: "",
            position: "Lead Developer",
            description: "Built a chatbot with AI",
            range: {
              start: [1, 2022],
              end: [12, 2022],
            },
          },
        ],
      };

      await new Promise((res, reject) => {
        socket1.emit("updateProfile", invalidProfileData, (response) => {
          // jas4y42
          expect(response).toBe(false);
          res(true);
        });
        setTimeout(
          () => reject("did not receive response in time. ?0dvi23r"),
          2000
        );
      });
    });

    it("should fail when softSkills is not an array", async () => {
      const invalidProfileData = {
        fName: "John",
        lName: "Doe",
        softSkills: "Leadership", // Not an array
      };

      await new Promise((res, reject) => {
        socket1.emit("updateProfile", invalidProfileData, (response) => {
          // x213
          expect(response).toBe(false);
          res(true);
        });
        setTimeout(
          () => reject("did not receive response in time. _)c98Scr"),
          2000
        );
      });
    });

    it("should fail when softSkills contains invalid entries", async () => {
      const invalidProfileData = {
        fName: "John",
        lName: "Doe",
        softSkills: ["Ok", 123, "A"], // Invalid entries (numbers, too short)
      };

      await new Promise((res, reject) => {
        socket1.emit("updateProfile", invalidProfileData, (response) => {
          // jsadi
          expect(response).toBe(false);
          res(true);
        });
        setTimeout(
          () => reject("did not receive response in time. )Z)Kocs-c"),
          2000
        );
      });
    });

    it("should fail when isMentor is not a boolean", async () => {
      const invalidProfileData = {
        fName: "John",
        lName: "Doe",
        isMentor: "yes", // Not a boolean
      };

      await new Promise((res, reject) => {
        socket1.emit("updateProfile", invalidProfileData, (response) => {
          // xaw3
          expect(response).toBe(false);
          res(true);
        });
        setTimeout(
          () => reject("did not receive response in time. XJK_Skj9v"),
          2000
        );
      });
    });

    it("should fail when acceptingMentees is not a boolean", async () => {
      const invalidProfileData = {
        fName: "John",
        lName: "Doe",
        acceptingMentees: "no", // Not a boolean
      };

      await new Promise((res, reject) => {
        socket1.emit("updateProfile", invalidProfileData, (response) => {
          // X)(3)
          expect(response).toBe(false);
          res(true);
        });
        setTimeout(
          () => reject("did not receive response in time. +Er4khj45"),
          2000
        );
      });
    });
  });

  describe("handleGetAllMentors", () => {
    it("should get all mentors correctly.", async () => {
      // first, have socket1 change themselves to a mentor
      await new Promise((res, rej) => {
        socket1.emit("updateProfile", { isMentor: true }, (v: boolean) => {
          // Moc0dk
          v
            ? res(true)
            : rej("Expected profile change to be successful. CNdi0v3");
        });
      });

      // now it is guarenteed we should find ourselves in mentor list.
      await new Promise((res, rej) => {
        socket1.emit("getAllMentors", (mentors: unknown) => {
          // response will not be an array if failed to get all mentors
          if (!(mentors instanceof Array)) {
            rej("Failed to get all mentors " + mentors + " x,OSc0s");
            return;
          }

          let selfLocated = false;
          for (let mentor of mentors) {
            if (typeof mentor != "object") {
              rej(
                "A mentor was not formatted as expected: " +
                  mentor +
                  ". SCS9cj0k3"
              );
              return;
            } else if (!mentor["isMentor"]) {
              rej(
                "A mentor did not have isMentor = true: " + mentor + ". _Xj9cs"
              );
              return;
            }

            if (mentor.id == socket1Data.id) {
              selfLocated = true;
            }
          }

          if (!selfLocated) {
            console.log("mL", mentors);
            rej(
              "Could not locate self within list of mentors, even though we are mentor."
            );
            return;
          }
          res(true);
        });
      });
    });
  });

  describe("handleSubmitAssessment", () => {
    it("should successfully create an assessment when given valid data", async () => {
      const validAssessmentData = {
        action: "create",
        questions: [
          {
            question: "What is your name?",
            inputType: "text",
            answer: "John Doe",
          },
          { question: "What is your age?", inputType: "number", answer: 25 },
          { question: "Do you agree?", inputType: "boolean", answer: true },
        ],
      };

      await new Promise((res, rej) => {
        socket1.emit(
          "submitAssessment",
          validAssessmentData,
          (success: boolean) => {
            success
              ? res(true)
              : rej("Expected assessment creation to be successful.");
          }
        );
      });

      await sleep(500);
    });

    it("should return an error if questions are invalid", async () => {
      const invalidAssessmentData = {
        action: "create",
        questions: [
          { question: "What is your name?", inputType: "text", answer: 123 }, // Invalid answer type
        ],
      };

      await new Promise((res, rej) => {
        socket1.emit(
          "submitAssessment",
          invalidAssessmentData,
          (success: boolean) => {
            if (success) {
              rej(
                "Expected assessment creation to fail due to invalid questions."
              );
            } else {
              res(true);
            }
          }
        );
      });
    });

    it("should successfully edit an existing assessment", async () => {
      const existingAssessmentID =
        socket1Data.users[socket1Data.id].assessments[0];
      // assessment should have been received.
      const existingAssessment = {
        id: existingAssessmentID,
        action: "edit",
        questions: [
          {
            question: "Updated Question?",
            inputType: "text",
            answer: "Updated Answer",
          },
        ],
      };

      await new Promise((res, rej) => {
        socket1.emit(
          "submitAssessment",
          existingAssessment,
          (success: boolean) => {
            success
              ? res(true)
              : rej("Expected assessment edit to be successful.");
          }
        );
      });
    });

    it("should fail to edit an assessment that does not belong to the user", async () => {
      const invalidEditRequest = {
        id: "impossible_id",
        action: "edit",
        questions: [
          {
            question: "Updated Question?",
            inputType: "text",
            answer: "Updated Answer",
          },
        ],
      };

      await new Promise((res, rej) => {
        socket1.emit(
          "submitAssessment",
          invalidEditRequest,
          (success: boolean) => {
            if (success) {
              rej(
                "Expected assessment edit to fail due to ownership restrictions."
              );
            } else {
              res(true);
            }
          }
        );
      });
    });

    it("should successfully publish an assessment", async () => {
      // at this point, this assessment was just created, and initially all assessments are unpublished
      const existingAssessmentID =
        socket1Data.users[socket1Data.id].assessments[0];
      const publishRequest = {
        id: existingAssessmentID,
        action: "publish",
      };

      await new Promise((res, rej) => {
        socket1.emit("submitAssessment", publishRequest, (success: boolean) => {
          success
            ? res(true)
            : rej("Expected assessment publishing to be successful.");
        });
      });
    });

    it("should fail to publish an assessment that is already published", async () => {
      // in the previous test, the assessment was just published.
      const existingAssessmentID =
        socket1Data.users[socket1Data.id].assessments[0];
      const alreadyPublishedRequest = {
        id: existingAssessmentID,
        action: "publish",
      };

      await new Promise((res, rej) => {
        socket1.emit(
          "submitAssessment",
          alreadyPublishedRequest,
          (success: boolean) => {
            if (success) {
              rej(
                "Expected assessment publishing to fail because it is already published."
              );
            } else {
              res(true);
            }
          }
        );
      });
    });

    it("should fail to delete an assessment that does not belong to the user", async () => {
      const invalidDeleteRequest = {
        id: "another-users-assessment",
        action: "delete",
      };

      await new Promise((res, rej) => {
        socket1.emit(
          "submitAssessment",
          invalidDeleteRequest,
          (success: boolean) => {
            if (success) {
              rej(
                "Expected assessment deletion to fail due to ownership restrictions."
              );
            } else {
              res(true);
            }
          }
        );
      });
    });

    it("should successfully delete an existing assessment", async () => {
      const existingAssessmentID =
        socket1Data.users[socket1Data.id].assessments[0];
      const deleteRequest = {
        id: existingAssessmentID,
        action: "delete",
      };

      await new Promise((res, rej) => {
        socket1.emit("submitAssessment", deleteRequest, (success: boolean) => {
          success
            ? res(true)
            : rej("Expected assessment deletion to be successful.");
        });
      });
    });

    it("should return an error when given an invalid action", async () => {
      const invalidActionRequest = {
        id: "some-assessment-id",
        action: "invalid_action",
      };

      await new Promise((res, rej) => {
        socket1.emit(
          "submitAssessment",
          invalidActionRequest,
          (success: boolean) => {
            if (success) {
              rej("Expected failure due to invalid action type.");
            } else {
              res(true);
            }
          }
        );
      });
    });

    it("should return an error when no callback is provided", async () => {
      const validData = {
        action: "create",
        questions: [
          {
            question: "What is your name?",
            inputType: "text",
            answer: "John Doe",
          },
        ],
      };
    });

    it("should return an error when data is not an object", async () => {
      const invalidData = "invalid-data-string";

      await new Promise((res, rej) => {
        socket1.emit("submitAssessment", invalidData, (success: boolean) => {
          if (success) {
            rej("Expected failure due to invalid data type.");
          } else {
            res(true);
          }
        });
      });
    });
  });

  describe("Connecting and Creating socket2 user should be successful", () => {
    it("should connect socket2 successfully", async () => {
      socket2 = await ConnectWithParams(true, "socket2 connect", {
        auth: {
          token: `testing ${socket2TestToken}`,
          deleteAccountAfterDisconnect: true,
        },
      });
      await sleep(1000);
    });

    it("should fail to create user2 if they use an existing username", async () => {
      // send valid fName and lName, with already used username
      await CreateUser(
        socket2,
        { fName: socket2FName, lName: socket2LName, username: socket1Username },
        false,
        "sxSae3"
      );
    });

    it("should create a user account given correct parameters. Should observe state change and socket map change correctly", async () => {
      // send valid fName and lName, with valid username
      await CreateUser(
        socket2,
        { fName: socket2FName, lName: socket2LName, username: socket2Username },
        true,
        "fovo0DJV("
      );

      socket2.on("state", (state) => updateState(socket2Data, state, "hamba"));
      socket2.on("message", (msg) => console.log("received message, s2", msg));
      socket2.on("data", (payload) =>
        handleData(payload, socket2Data, "Csac32")
      );
      await sleep(2000);
    });

    it(
      "should have only one socket in socketList with current socket2's ID",
      { timeout: 10000 },
      async () => {
        // give server time to add user to update socket map.
        let found = false;
        setTimeout(() => {
          if (!found) {
            throw new Error(
              "socket2 did not appear in socket map in time xxzsc"
            );
          }
        }, 5000);

        // keep checking socket map to see if socket2 appears
        while (true) {
          const userID = socket2Data.id;
          // console.log("socketMap5", userID, AuthenticatedSocket.AllSockets);
          const users = AuthenticatedSocket.AllSockets.get(userID);
          if (users) {
            expect(users).toBeDefined();
            expect(users!.length).toBe(1);
            expect(users![0].user.username).toBe(socket2Username);
            found = true;
            break;
          }
          await sleep(300);
        }
      }
    );

    it("Should be able to successfully logout of socket2's account without deleting it.", async () => {
      const userID = socket2Data.id;
      const userRes = await DBGetWithID("user", userID);
      expect(userRes).toBeDefined();
      // tell it not to delete account after disconnect.
      await new Promise((res, rej) => {
        socket2.emit(
          "setTestingVariable",
          "deleteAccountAfterDisconnect",
          false,
          (v: boolean) => {
            v
              ? res(true)
              : rej("Expected to change testing variable successfully");
          }
        );
      });

      await sleep(500);

      socket2.disconnect();
    });

    it("socket2 should no longer be in AllSockets list", async () => {
      // give server time to add user to update socket map.
      await sleep(1000);
      const userID = socket2Data.id;
      const users = AuthenticatedSocket.AllSockets.get(userID);
      expect(users).toBeUndefined();
    });

    it("Should be able to log back into socket2 account", async () => {
      // connect to server
      socket2 = await ConnectWithParams(true, "xdv53", {
        auth: {
          token: `testing ${socket2TestToken}`,
          deleteAccountAfterDisconnect: true,
        },
      });
      socket2.on("state", (state) =>
        updateState(socket2Data, state, "ssa3x0ks")
      );
      socket2.on("message", (msg) => console.log("received message, s2", msg));
      socket2.on("data", (payload) =>
        handleData(payload, socket2Data, "0s0325kc")
      );

      socket2Data = {};

      // expect state to be authed user, and to receive data for users and userID.
      await ExpectCorrectDataOnConnect(socket2Data, "X_-sckj))");
    });

    it(
      "Should find socket2 back in socket map",
      { timeout: 10000 },
      async () => {
        // give server time to add user to update socket map.
        let found = false;
        setTimeout(() => {
          if (!found) {
            throw new Error(
              "socket2 did not appear in socket map in time CD43"
            );
          }
        }, 5000);

        // keep checking socket map to see if socket1 appears
        while (true) {
          const userID = socket2Data.id;
          console.log("socketMap6", userID, AuthenticatedSocket.AllSockets);
          const users = AuthenticatedSocket.AllSockets.get(userID);
          if (users) {
            expect(users).toBeDefined();
            expect(users!.length).toBe(1);
            expect(users![0].user.username).toBe(socket2Username);
            found = true;
            break;
          }
          await sleep(300);
        }
      }
    );

    it("Another socket should be able to connect using socket1's credentials while socket1 is connected, observer correct socket map changes, and disconnect", async () => {
      const anotherSocket1 = await ConnectWithParams(true, "barmitsfa", {
        auth: {
          token: `testing ${socket1TestToken}`,
          deleteAccountAfterDisconnect: true,
        },
      });

      // give server time to send state and stuff.
      const AnotherSocket1Data = {};
      anotherSocket1.on("state", (state) =>
        updateState(AnotherSocket1Data, state, "scs0as")
      );
      anotherSocket1.on("message", (msg) =>
        console.log("received message, aS1", msg)
      );
      anotherSocket1.on("data", (payload) =>
        handleData(payload, AnotherSocket1Data, "shsisis")
      );

      // expect state to be authed user, and to receive data for users and userID.
      await ExpectCorrectDataOnConnect(AnotherSocket1Data, "asocjspa/?");

      // give server time to add user to update socket map.
      let found = false;
      setTimeout(() => {
        if (!found) {
          throw new Error(
            "anotherSocket1 did not appear in socket map in time Xdc43"
          );
        }
      }, 5000);

      // give server some time to respond
      await sleep(500);

      // keep checking socket map to see if socket1 appears
      while (true) {
        const userID = socket1Data.id;
        console.log("socketMap8", userID, AuthenticatedSocket.AllSockets);
        const users = AuthenticatedSocket.AllSockets.get(userID);
        if (users) {
          expect(users).toBeDefined();
          expect(users!.length).toBe(2);
          expect(users![0].user.username).toBe(socket1Username);
          expect(users![1].user.username).toBe(socket1Username);
          found = true;
          break;
        }
        await sleep(300);
      }

      // disconnect and give server time to update socket map.
      anotherSocket1.disconnect();
      await sleep(1000);

      let found2 = false;
      setTimeout(() => {
        if (!found2) {
          throw new Error(
            "anotherSocket1 did not appear in socket map in time X)cj-s"
          );
        }
      }, 5000);

      // keep checking socket map to see if socket1 appears.
      // only 1 socket1 should appear this time.
      while (true) {
        const userID = socket1Data.id;
        console.log("socketMap9", userID, AuthenticatedSocket.AllSockets);
        const users = AuthenticatedSocket.AllSockets.get(userID);
        if (users) {
          expect(users).toBeDefined();
          expect(users!.length).toBe(1);
          expect(users![0].user.username).toBe(socket1Username);
          found2 = true;
          break;
        }
        await sleep(300);
      }
    });
  });

  describe("handleMentorshipRequest", () => {
    function GetOrWaitForMentorshipRequest(errorMessage: string) {
      return new Promise(async (res) => {
        let mentorshipRequestID: string|undefined;
        setTimeout(() => {
          if (mentorshipRequestID) {
            return;
          }
          throw new Error("Did not get mentorship request in time ["+errorMessage+"]");
        }, 2000);
        while (true) {
          mentorshipRequestID = GetMentorshipRequestFromData(socket1Data);
          if (mentorshipRequestID) {
            res(mentorshipRequestID);
            break;
          }
          await sleep(200);
        }
      });
    }
    it("should send a mentorship request successfully", async () => {
      // Ensure socket1 is a mentor accepting mentees
      await new Promise((res, rej) => {
        socket1.emit(
          "updateProfile",
          { isMentor: true, acceptingMentees: true },
          (success: boolean) => {
            success ? res(true) : rej("Failed to update mentor profile. [ER1]");
          }
        );
      });

      // Ensure socket2 is a mentee
      await new Promise((res, rej) => {
        socket1.emit(
          "updateProfile",
          { isMentee: true },
          (success: boolean) => {
            success ? res(true) : rej("Failed to update mentor profile. [ER2]");
          }
        );
      });

      // Send mentorship request
      await new Promise((res, rej) => {
        socket2.emit(
          "mentorshipRequest",
          { action: "send", mentorID: socket1Data.id },
          (success: boolean) => {
            success
              ? res(true)
              : rej("Failed to send mentorship request. [ER3]");
          }
        );
      });
    });

    it("should allow the mentor to decline a mentorship request", async () => {
      let mentorshipRequestID = await GetOrWaitForMentorshipRequest('CJs0as');

      // Decline the mentorship request
      await new Promise((res, rej) => {
        socket1.emit(
          "mentorshipRequest",
          { action: "decline", mentorshipRequestID },
          (success: boolean) => {
            success
              ? res(true)
              : rej("Failed to decline mentorship request. [ER7]");
          }
        );
      });
    });

    it("should allow the mentee to cancel a mentorship request", async () => {
      // Send another mentorship request
      await new Promise((res, rej) => {
        socket2.emit(
          "mentorshipRequest",
          { action: "send", mentorID: socket1Data.id },
          (success: boolean) => {
            success
              ? res(true)
              : rej("Failed to send mentorship request. [ER8]");
          }
        );
      });

      let mentorshipRequestID = await GetOrWaitForMentorshipRequest('Xoak0A');

      // Cancel the mentorship request
      await new Promise((res, rej) => {
        socket2.emit(
          "mentorshipRequest",
          { action: "cancel", mentorshipRequestID },
          (success: boolean) => {
            success
              ? res(true)
              : rej("Failed to cancel mentorship request. [ER10]");
          }
        );
      });
    });

    it("should allow the mentor to accept the mentorship request", async () => {
      await new Promise((res, rej) => {
        socket2.emit(
          "mentorshipRequest",
          { action: "send", mentorID: socket1Data.id },
          (success: boolean) => {
            success
              ? res(true)
              : rej("Failed to send mentorship request. [ER9]");
          }
        );
      });

      let mentorshipRequestID = await GetOrWaitForMentorshipRequest('_ck9o');
      // Accept the mentorship request
      await new Promise((res, rej) => {
        socket1.emit(
          "mentorshipRequest",
          { action: "accept", mentorshipRequestID },
          (success: boolean) => {
            success
              ? res(true)
              : rej("Failed to accept mentorship request. [ER44]");
          }
        );
      });

      // give server time to send both users acceptance message
      await sleep(1000);
    });
  });

  afterAll(async () => {
    // give server time to do any post disconnect processing.
    try {
      socket1.disconnect();
      console.log(
        "======================\n",
        "S1",
        JSON.stringify(socket1Data, null, 2),
        "\n======================"
      );
      socket2.disconnect();
      console.log(
        "======================\n",
        "S2",
        JSON.stringify(socket2Data, null, 2),
        "\n======================"
      );
      // socket2.disconnect();
    } catch {}
    await sleep(3000);
  });
});
