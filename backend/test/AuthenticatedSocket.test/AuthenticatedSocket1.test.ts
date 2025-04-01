import { expect, it, describe, afterAll } from "vitest";
import { Socket } from "socket.io-client";
import { sleep } from "../../src/scripts/tools";

import {
  isSocketServerOnline,
  StartServer,
} from "../../src/socket/socketServer";

import { DBDelete, DBDeleteWithID, DBGet, DBGetWithID } from "../../src/db";
import { ObjectAny } from "../../src/types";
import AuthenticatedSocket from "../../src/socket/AuthenticatedSocket";
import { MAX_BIO_LENGTH } from "../../src/scripts/validation";
import { ConnectWithParams, CreateUser, deleteAllTestingObjects, handleData, updateSelf, updateState } from "./_AuthenticatedSocketHelperFunctions.test";

export async function ExpectNoUsersWithTestingTokenOrUsername(
  token: string,
  username: string
) {
  const dat = await DBGet(
    "user",
    [
      ["OAuthSubID", "==", token],
      ["usernameLower", "==", username.toLowerCase()],
    ],
    "or"
  );
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
  const socket1Username = "_testingUsername_LaoGui";
  const socket1FName = "Tester";
  const socket1LName = "Tester";

  let socket2: Socket;
  let socket2TestToken = "herobrine";
  let socket2Data: ObjectAny = {};
  const socket2Username = "_testingUsername_JudgementKazzy";
  const socket2FName = "Kiryu";
  const socket2LName = "Kazuma";

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
    delete targetSocketData.user;
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
          targetSocketData.user
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

  function GetMentorshipRequestFromData(targetSocketData: ObjectAny) {
    // so this should get the mentorship request from our data correctly if it exists.
    try {
      return targetSocketData.user.mentorshipRequests[0];
    } catch {
      return undefined;
    }
  }

  function GetOrWaitForMentorshipRequest(
    targetSocketData: ObjectAny,
    errorMessage: string
  ) {
    return new Promise(async (res) => {
      let mentorshipRequestID: string | undefined;
      setTimeout(() => {
        if (mentorshipRequestID) {
          return;
        }
        throw new Error(
          "Did not get mentorship request in time [" + errorMessage + "]"
        );
      }, 2000);
      while (true) {
        mentorshipRequestID = GetMentorshipRequestFromData(targetSocketData);
        if (mentorshipRequestID) {
          res(mentorshipRequestID);
          break;
        }
        await sleep(200);
      }
    });
  }

  it("Should activate server correctly", async () => {
    // ensures socket server is online
    if (!isSocketServerOnline()) {
      try {
        await StartServer();
      } catch {
        console.log(
          "======================== seems server is already online. ======================="
        );
      }
    }
  });

  it("Should have no users with testing tokens", async () => {
    if (
      !(await ExpectNoUsersWithTestingTokenOrUsername(
        socket1TestToken,
        socket1Username
      ))
    ) {
      throw new Error(
        "Expected no users with testing token " +
          socket1TestToken +
          ". Likely clean up function doesn't work as expected."
      );
    }

    if (
      !(await ExpectNoUsersWithTestingTokenOrUsername(
        socket2TestToken,
        socket2Username
      ))
    ) {
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

      if (process.env.TEST_SKIP_SAMPLE_USER_TOKEN != "true") {
        // try connecting with non-sample user access token.
        const realSocket = await ConnectWithParams(
          true,
          "| env SAMPLE_USER_ACCESS_TOKEN is likely expired. Replace it with a real token. \nYou can skip this test by setting TEST_SKIP_SAMPLE_USER_TOKEN = true",
          {
            auth: {
              token: `Bearer ${process.env.SAMPLE_USER_ACCESS_TOKEN}`,
            },
          }
        );
        realSocket.disconnect();
      }

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

    it("Another socket should be able to connect using socket2's credentials while socket2 is connected, observer correct socket map changes, and disconnect", async () => {
      const anotherSocket2 = await ConnectWithParams(true, "barmitsfa", {
        auth: {
          token: `testing ${socket2TestToken}`,
          deleteAccountAfterDisconnect: false,
        },
      });

      // give server time to send state and stuff.
      const AnotherSocket2Data = {};
      anotherSocket2.on("state", (state) =>
        updateState(AnotherSocket2Data, state, "V)(sdvsa")
      );
      anotherSocket2.on("message", (msg) =>
        console.log("received message, aS2", msg)
      );
      anotherSocket2.on("data", (payload) =>
        handleData(payload, AnotherSocket2Data, "13513dss")
      );

      // expect state to be authed user, and to receive data for users and userID.
      await ExpectCorrectDataOnConnect(AnotherSocket2Data, "asXasf");

      // give server time to add user to update socket map.
      let found = false;
      setTimeout(() => {
        if (!found) {
          throw new Error(
            "anotherSocket2 did not appear in socket map in time xsa023"
          );
        }
      }, 5000);

      // give server some time to respond
      await sleep(1000);

      // keep checking socket map to see if socket1 appears
      while (true) {
        const userID = socket2Data.id;
        console.log("socketMap214", userID, AuthenticatedSocket.AllSockets);
        const users = AuthenticatedSocket.AllSockets.get(userID);
        if (users) {
          expect(users).toBeDefined();
          expect(users!.length).toBe(2);
          expect(users![0].user.username).toBe(socket2Username);
          expect(users![1].user.username).toBe(socket2Username);
          found = true;
          break;
        }
        await sleep(300);
      }

      // disconnect and give server time to update socket map.
      anotherSocket2.disconnect();
      await sleep(1000);

      let found2 = false;
      setTimeout(() => {
        if (!found2) {
          throw new Error(
            "anotherSocket2 did not appear in socket map in time Xdvr53"
          );
        }
      }, 5000);

      // keep checking socket map to see if socket2 appears.
      // only 1 socket2 should appear this time.
      while (true) {
        const userID = socket2Data.id;
        console.log("socketMap53", userID, AuthenticatedSocket.AllSockets);
        const users = AuthenticatedSocket.AllSockets.get(userID);
        if (users) {
          expect(users).toBeDefined();
          expect(users!.length).toBe(1);
          expect(users![0].user.username).toBe(socket2Username);
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
        username: "_test_newUsername_LaoGui",
        fName: "John",
        mName: "A",
        lName: "Doe",
        socials: [{ type: "linkedIn", url: "https://linkedin.com/in/johndoe" }],
        bio: "Macintosh, spankinrosh",
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

    it("should fail when bio is not a string or too long", async () => {
      const validProfileData = {
        bio: "n".repeat(MAX_BIO_LENGTH),
      };

      await new Promise((res, reject) => {
        socket1.emit("updateProfile", validProfileData, (response) => {
          // X)(3)_^7
          expect(response).toBe(true);
          res(true);
        });
        setTimeout(
          () => reject("did not receive response in time. (VJxsd0v)"),
          2000
        );
      });

      const invalidProfileData = {
        bio: "n".repeat(MAX_BIO_LENGTH + 1),
      };

      await new Promise((res, reject) => {
        socket1.emit("updateProfile", invalidProfileData, (response) => {
          // X)(3)
          expect(response).toBe(false);
          res(true);
        });
        setTimeout(
          () => reject("did not receive response in time. (VJd13r0v)"),
          2000
        );
      });

      const invalidProfileData2 = {
        bio: true,
      };

      await new Promise((res, reject) => {
        socket1.emit("updateProfile", invalidProfileData2, (response) => {
          // X)(3)
          expect(response).toBe(false);
          res(true);
        });
        setTimeout(
          () => reject("did not receive response in time. (VJd0caxzv)"),
          2000
        );
      });
    });
  });

  describe("handleGetAllMentors", () => {
    it("should NOT find self in mentor list since we are mentor.", async () => {
      // first, have socket1 change themselves to a mentor
      await new Promise((res, rej) => {
        socket1.emit("updateProfile", { isMentor: false }, (v: boolean) => {
          // Moc0dk
          v
            ? res(true)
            : rej("Expected profile change to be successful. asc9cha9sc");
        });
      });

      // now it is guarenteed we should NOT find ourselves in mentor list.
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
                  ". SCS9cj0kia3"
              );
              return;
            } else if (!mentor["isMentor"]) {
              rej(
                "A mentor did not have isMentor = true: " +
                  JSON.stringify(mentor, null, 2) +
                  ". _Xj9c _As"
              );
              return;
            }

            if (mentor.id == socket1Data.id) {
              selfLocated = true;
            }
          }

          if (selfLocated) {
            console.log("mL _!", mentors);
            rej(
              "Located self within list of mentors, even though we are NOT a mentor."
            );
            return;
          }
          res(true);
        });
      });
    });

    it("should find self in mentor list since we are mentor.", async () => {
      // first, have socket1 change themselves to a mentor
      await new Promise((res, rej) => {
        socket1.emit(
          "updateProfile",
          { isMentor: true, acceptingMentees: true },
          (v: boolean) => {
            // Moc0dk
            v
              ? res(true)
              : rej("Expected profile change to be successful. CNdi0v3");
          }
        );
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
            console.log("mL", socket1Data.id, mentors);
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

  describe("handleMentorshipRequest", () => {
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
      let mentorshipRequestID = await GetOrWaitForMentorshipRequest(
        socket1Data,
        "CJs0as"
      );

      // Decline the mentorship request
      await new Promise((res, rej) => {
        socket1.emit(
          "mentorshipRequest",
          { action: "decline", mentorshipRequestID },
          (success: boolean) => {
            success
              ? res(true)
              : rej(
                  "Failed to decline mentorship request. [ER7] " +
                    mentorshipRequestID
                );
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

      let mentorshipRequestID = await GetOrWaitForMentorshipRequest(
        socket1Data,
        "Xoak0A"
      );

      // Cancel the mentorship request
      await new Promise((res, rej) => {
        socket2.emit(
          "mentorshipRequest",
          { action: "cancel", mentorshipRequestID },
          (success: boolean) => {
            success
              ? res(true)
              : rej(
                  "Failed to cancel mentorship request. [ER10] " +
                    mentorshipRequestID
                );
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

      let mentorshipRequestID = await GetOrWaitForMentorshipRequest(
        socket1Data,
        "ixNS0o"
      );
      await updateSelf(socket1, socket1Data, "s9ajcs0");
      await updateSelf(socket2, socket2Data, "os0ajc");
      console.log("Before Accept", socket1Data, socket2Data);
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

      await updateSelf(socket1, socket1Data, "s9ajcs0");
      await updateSelf(socket2, socket2Data, "os0ajc");
      console.log("After Accept", socket1Data, socket2Data);
      // give server time to send both users acceptance message
      await sleep(1000);
    });

    it("it should allow the mentor to remove a mentee", async () => {
      // Expect it to fail if they tried to remove themselves
      await new Promise((res, rej) => {
        socket1.emit(
          "mentorshipRequest",
          { action: "removeMentee", menteeID: socket1Data.id },
          (success: boolean) => {
            success ? rej("Expected failure. 0Csac32") : res(true);
          }
        );
      });

      // Should pass if they try to remove their mentee
      await new Promise((res, rej) => {
        socket1.emit(
          "mentorshipRequest",
          { action: "removeMentee", menteeID: socket2Data.id },
          (success: boolean) => {
            success ? res(true) : rej("Failed to remove mentee. [ERxs9]");
          }
        );
      });

      await updateSelf(socket1, socket1Data, "s9ajcs0");
      await updateSelf(socket2, socket2Data, "os0ajc");
      console.log("Remove Mentee", socket1Data, socket2Data);
    });

    it("it should allow the mentee to remove the mentor", async () => {
      // first reestablish a mentorship relationship
      // mentor: socket2, mentee: socket1

      // make sure socket2 is a mentor
      await new Promise((res, rej) => {
        socket2.emit(
          "updateProfile",
          { isMentor: true, acceptingMentees: true },
          (success: boolean) => {
            success
              ? res(true)
              : rej("Failed to update mentor profile. [ERax9sj921]");
          }
        );
      });

      await new Promise((res, rej) => {
        socket1.emit(
          "mentorshipRequest",
          { action: "send", mentorID: socket2Data.id },
          (success: boolean) => {
            success
              ? res(true)
              : rej("Failed to send mentorship request. [ER2124d]");
          }
        );
      });

      let mentorshipRequestID = await GetOrWaitForMentorshipRequest(
        socket2Data,
        "Xs3151"
      );
      // Accept the mentorship request
      await new Promise((res, rej) => {
        socket2.emit(
          "mentorshipRequest",
          { action: "accept", mentorshipRequestID },
          (success: boolean) => {
            success
              ? res(true)
              : rej("Failed to accept mentorship request. [ERxSa2]");
          }
        );
      });

      await updateSelf(socket1, socket1Data, "s9ajcs0");
      await updateSelf(socket2, socket2Data, "os0ajc");
      console.log(
        "Accepted mentor socket2 mentee socket1",
        socket1Data,
        socket2Data
      );

      // Should pass if they try to remove their mentor
      await new Promise((res, rej) => {
        socket1.emit(
          "mentorshipRequest",
          { action: "removeMentor" },
          (success: boolean) => {
            success ? res(true) : rej("Failed to remove mentee. [ERxs9]");
          }
        );
      });

      await updateSelf(socket1, socket1Data, "s9ajcs0");
      await updateSelf(socket2, socket2Data, "os0ajc");
      console.log("Remove Mentor", socket1Data, socket2Data);
    });
  });

  describe("handleGetUser", () => {
    it("should return user data when provided with a valid userID and callback", async () => {
      await new Promise((res, rej) => {
        socket1.emit("getUser", socket1Data.id, (data: unknown) => {
          if (!data || typeof data !== "object") {
            rej("Expected user data but got: " + JSON.stringify(data));
            return;
          }
          res(true);
        });
      });
    });

    it("should return an error when no callback is provided", async () => {
      await new Promise((res, rej) => {
        socket1.emit("getUser", socket1Data.id, undefined); // No callback function
        // give server time to not send anything back.
        setTimeout(() => {
          res(true);
        }, 1000);
      });
    });

    it("should return an error when userID is missing", async () => {
      await new Promise((res, rej) => {
        socket1.emit("getUser", null, (success: boolean) => {
          if (success !== false) {
            rej("Expected failure due to missing userID, but got success.");
            return;
          }
          res(true);
        });
      });
    });

    it("should return an error when userID is not a string", async () => {
      await new Promise((res, rej) => {
        socket1.emit("getUser", 12345, (success: boolean) => {
          if (success !== false) {
            rej(
              "Expected failure due to invalid userID type, but got success."
            );
            return;
          }
          res(true);
        });
      });
    });

    it("should return an error when GetUserData throws an error", async () => {
      await new Promise((res, rej) => {
        socket1.emit("getUser", "nonExistentUserID", (success: boolean) => {
          if (success !== false) {
            rej("Expected failure due to GetUserData error, but got success.");
            return;
          }
          res(true);
        });
      });
    });
  });

  describe("handleSubmitAssessment", () => {
    // by this point, we can freely use the getUser event (and thus updateSelf).
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
          (success: string | boolean) => {
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
      // first, get an updated copy of socket1 user data.
      await updateSelf(socket1, socket1Data, "0sadjs0aid");

      // then retrieve socket1 assessmentID from there.
      const existingAssessmentID = Object.keys(socket1Data.user.assessments)[0];
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
      await updateSelf(socket1, socket1Data, "asc0C_acs");
      const existingAssessmentID = Object.keys(socket1Data.user.assessments)[0];
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
      await updateSelf(socket1, socket1Data, "o)S)Cisasc");
      const existingAssessmentID = Object.keys(socket1Data.user.assessments)[0];
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
      await updateSelf(socket1, socket1Data, "as0cja0sckas");
      const existingAssessmentID = Object.keys(socket1Data.user.assessments)[0];
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

  describe("handleGetAssessment", () => {
    it("should successfully get assessment if owner is the requesting party", async () => {
      // submit an assessment that we'll reference to later
      const validAssessmentData = {
        action: "create",
        questions: [
          {
            question: "WHAT FROM DONW UNS?",
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
          (success: string | boolean) => {
            success
              ? res(true)
              : rej("Expected assessment creation to be successful.");
          }
        );
      });

      await updateSelf(socket1, socket1Data, "D*AH0d9v");

      // then retrieve socket1 assessmentID from there.
      const existingAssessmentID = Object.keys(socket1Data.user.assessments)[0];
      const assessment = await new Promise((res, rej) => {
        socket1.emit(
          "getAssessment",
          existingAssessmentID,
          (v: Object | undefined) => {
            v ? res(v) : rej("expected success oamsc0iskjc)A");
          }
        );
      });
      if (!assessment || typeof assessment != "object") {
        throw new Error("Expected to get assessment, but no: " + assessment);
      }
      if (assessment["id"] != existingAssessmentID) {
        throw new Error(
          "Requested assessment (" +
            existingAssessmentID +
            ") does not match received assessment: " +
            JSON.stringify(assessment, null, 2)
        );
      }
    });

    it("should allow socket2 to mentor socket1 in preparation of requesting assessments", async () => {
      await new Promise((res, rej) => {
        socket1.emit(
          "mentorshipRequest",
          { action: "send", mentorID: socket2Data.id },
          (success: boolean) => {
            success
              ? res(true)
              : rej("Failed to send mentorship request. [ER9]");
          }
        );
      });

      let mentorshipRequestID = await GetOrWaitForMentorshipRequest(
        socket1Data,
        "XOIUSC)"
      );
      // Accept the mentorship request
      await new Promise((res, rej) => {
        socket2.emit(
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
      await sleep(500);
    });

    it("should successfully allow socket2 to get socket1 assessments, as they are mentor of socket1", async () => {
      await updateSelf(socket2, socket2Data, "LarryC_C_");

      // then retrieve socket1 assessmentID from there.
      const existingAssessmentID = Object.keys(socket1Data.user.assessments)[0];
      const assessment = await new Promise((res, rej) => {
        socket2.emit(
          "getAssessment",
          existingAssessmentID,
          (v: Object | undefined) => {
            v ? res(v) : rej("expected success asf42g4A " + v);
          }
        );
      });

      if (!assessment || typeof assessment != "object") {
        throw new Error("Expected to get assessment, but no: " + assessment);
      }
      if (assessment["id"] != existingAssessmentID) {
        throw new Error(
          "Requested assessment (" +
            existingAssessmentID +
            ") does not match received assessment: " +
            JSON.stringify(assessment, null, 2)
        );
      }
    });

    it("should allow socket1 to remove socket2 as mentor, and socket1 to mentor socket2 in preparation for assessment request", async () => {
      await new Promise((res, rej) => {
        socket1.emit(
          "mentorshipRequest",
          { action: "removeMentor" },
          (success: boolean) => {
            success
              ? res(true)
              : rej("Failed to send remove mentor. [ER9acs9uj]");
          }
        );
      });

      await new Promise((res, rej) => {
        socket2.emit(
          "mentorshipRequest",
          { action: "send", mentorID: socket1Data.id },
          (success: boolean) => {
            success
              ? res(true)
              : rej("Failed to send mentorship request. [Eefaf39]");
          }
        );
      });

      let mentorshipRequestID = await GetOrWaitForMentorshipRequest(
        socket1Data,
        "Sasd31g4"
      );
      // Accept the mentorship request
      await new Promise((res, rej) => {
        socket1.emit(
          "mentorshipRequest",
          { action: "accept", mentorshipRequestID },
          (success: boolean) => {
            success
              ? res(true)
              : rej("Failed to accept mentorship request. [ER4hn4]");
          }
        );
      });
      // give server time to send both users acceptance message
      await sleep(500);
    });

    it("should deny socket2 to get socket1 assessments, as they are not mentor of socket1", async () => {
      await updateSelf(socket2, socket2Data, "LarryC_C_");

      // then retrieve socket1 assessmentID, but fail because lack permissions
      const existingAssessmentID = Object.keys(socket1Data.user.assessments)[0];
      await new Promise((res, rej) => {
        socket2.emit(
          "getAssessment",
          existingAssessmentID,
          (v: Object | undefined) => {
            v ? rej("expected failure 0asjc0as " + v) : res(v);
          }
        );
      });
    });

    it("should allow socket2 to remove socket1 as mentor in preparation for assessment request", async () => {
      await new Promise((res, rej) => {
        socket2.emit(
          "mentorshipRequest",
          { action: "removeMentor" },
          (success: boolean) => {
            success
              ? res(true)
              : rej("Failed to send remove mentor. [Ecas45y32]");
          }
        );
      });
    });

    it("should deny socket2 to get socket1 assessments, as they are not mentor nor mentee of socket1", async () => {
      await updateSelf(socket2, socket2Data, "LarryC_C_");

      // then retrieve socket1 assessmentID, but fail because lack permissions
      const existingAssessmentID = Object.keys(socket1Data.user.assessments)[0];
      await new Promise((res, rej) => {
        socket2.emit(
          "getAssessment",
          existingAssessmentID,
          (v: Object | undefined) => {
            v ? rej("expected failure daef31fe " + v) : res(v);
          }
        );
      });
    });
  });

  describe("handleSubmitGoal", () => {
    it("should return an error when no callback is provided", async () => {
      await new Promise((res, rej) => {
        socket1.emit("submitGoal", { action: "create", goal: {} }, undefined); // No callback function
        setTimeout(() => {
          res(true);
        }, 1000);
      });
    });

    it("should return an error when data parameter is missing", async () => {
      await new Promise((res, rej) => {
        socket1.emit("submitGoal", null, (success: boolean) => {
          if (success !== false) {
            rej(
              "Expected failure due to missing data parameter, but got success."
            );
            return;
          }
          res(true);
        });
      });
    });

    it("should return an error when action is invalid", async () => {
      await new Promise((res, rej) => {
        socket1.emit(
          "submitGoal",
          { action: "invalid_action" },
          (success: boolean) => {
            if (success !== false) {
              rej("Expected failure due to invalid action, but got success.");
              return;
            }
            res(true);
          }
        );
      });
    });

    it("should return an error when creating a goal without goal data", async () => {
      await new Promise((res, rej) => {
        socket1.emit("submitGoal", { action: "create" }, (success: boolean) => {
          if (success !== false) {
            rej("Expected failure due to missing goal data, but got success.");
            return;
          }
          res(true);
        });
      });
    });

    let existingGoalID: string; // should be set after the following test
    it("should successfully create a goal when valid data is provided", async () => {
      await new Promise((res, rej) => {
        console.log("GVD", `{ name: "New Goal", tasks: [] }`);
        socket1.emit(
          "submitGoal",
          { action: "create", goal: { name: "New Goal", tasks: [] } },
          (goalID: string | boolean) => {
            if (!goalID || typeof goalID !== "string") {
              rej("Expected goal ID but got: " + JSON.stringify(goalID));
              return;
            }
            existingGoalID = goalID;
            res(true);
          }
        );
      });
    });

    it("should return an error when editing a goal without required parameters", async () => {
      await new Promise((res, rej) => {
        console.log("GVD", `{ action: "edit", goal: {} }`);
        socket1.emit(
          "submitGoal",
          { action: "edit", goal: {} },
          (success: boolean) => {
            if (success !== false) {
              rej("Expected failure due to missing goal ID, but got success.");
              return;
            }
            res(true);
          }
        );
      });
    });

    it("should return an error when editing a non-existent goal", async () => {
      await new Promise((res, rej) => {
        const nonEx = {
          action: "edit",
          id: "nonExistentID",
          goal: { name: "Updated Goal", tasks: [] },
        };
        console.log("GVD", JSON.stringify(nonEx, null, 2));
        socket1.emit("submitGoal", nonEx, (success: boolean) => {
          if (success !== false) {
            rej("Expected failure due to non-existent goal, but got success.");
            return;
          }
          res(true);
        });
      });
    });

    it("should successfully edit an existing goal", async () => {
      await updateSelf(socket1, socket1Data, "0askc0Kca");
      const goalID = Object.keys(socket1Data.user.goals)[0];
      await new Promise((res, rej) => {
        socket1.emit(
          "submitGoal",
          {
            action: "edit",
            id: goalID,
            goal: { name: "Updated Goal", tasks: [] },
          },
          (success: boolean) => {
            if (success !== true) {
              rej("Expected success but got failure [Hakcusnda].");
              return;
            }
            res(true);
          }
        );
      });
    });

    it("should return an error when deleting a goal without an ID", async () => {
      await new Promise((res, rej) => {
        socket1.emit("submitGoal", { action: "delete" }, (success: boolean) => {
          if (success !== false) {
            rej("Expected failure due to missing goal ID, but got success.");
            return;
          }
          res(true);
        });
      });
    });

    it("should successfully delete a goal when a valid ID is provided", async () => {
      await updateSelf(socket1, socket1Data, "asc0aKSPCa");
      const goalID = Object.keys(socket1Data.user.goals)[0];
      await new Promise((res, rej) => {
        socket1.emit(
          "submitGoal",
          { action: "delete", id: goalID },
          (success: boolean) => {
            if (success !== true) {
              rej("Expected success but got failure [as0cjas].");
              return;
            }
            res(true);
          }
        );
      });
    });

    it("should return an error when goal name is too short", async () => {
      await new Promise((res, rej) => {
        socket1.emit(
          "submitGoal",
          { action: "create", goal: { name: "ab", tasks: [] } },
          (success: boolean) => {
            if (success !== false) {
              rej("Expected failure due to short goal name, but got success.");
              return;
            }
            res(true);
          }
        );
      });
    });

    it("should return an error when a task has an invalid completion date", async () => {
      await new Promise((res, rej) => {
        const invld = {
          action: "create",
          goal: {
            name: "Valid Goal",
            tasks: [
              {
                name: "Task 1",
                description: "Desc",
                completitionDate: "invalidDate __??",
              },
            ],
          },
        };
        socket1.emit("submitGoal", invld, (success: boolean) => {
          if (success !== false) {
            rej(
              "Expected failure due to invalid completion date, but got success."
            );
            return;
          }
          res(true);
        });
      });
    });

    let meeMeeGoalID: string; // used in test after the following
    const meeMeeGoal = {
      action: "create",
      goal: {
        name: "Valid Goal",
        tasks: [
          {
            name: "Task500",
            description: "Descrpeasid",
          },
        ],
      },
    };
    it("should succeed if a task has an valid date, name, and description", async () => {
      await new Promise((res, rej) => {
        const validSubmitPayload = {
          action: "create",
          goal: {
            name: "Valid Goal ICh9sc",
            tasks: [
              {
                name: "Task500??0sj0",
                description: "De_____asid",
                completitionDate: Date.now(),
              },
            ],
          },
        };
        socket1.emit("submitGoal", validSubmitPayload, (success: boolean) => {
          if (!success) {
            rej("Expected success asd9j2d");
            return;
          }
          res(true);
        });
      });

      // date can be undefined too
      await new Promise((res, rej) => {
        socket1.emit("submitGoal", meeMeeGoal, (success: string | boolean) => {
          if (typeof success == "boolean") {
            rej("Expected success. [-sC)k3]");
            return;
          }
          meeMeeGoalID = success;
          res(true);
        });
      });
    });

    it("should get existing goal using getGoal", async () => {
      await new Promise((res, rej) => {
        socket1.emit("getGoal", meeMeeGoalID, (v: boolean | ObjectAny) => {
          if (typeof v == "boolean") {
            rej("expected to get goal data successfully [asd0i]");
            return;
          }
          console.log("getGoalRes", v);
          const goal = v;
          if (!goal || typeof goal != "object") {
            rej(
              "Goal was not formatted as expected. [0asd] " +
                JSON.stringify(goal, null, 2)
            );
            return;
          }

          console.log("rec_", goal);
          console.log("meme_", meeMeeGoal.goal);
          const { name, tasks } = goal;
          expect(name).toBe(meeMeeGoal.goal.name);
          expect(tasks.length).toBe(meeMeeGoal.goal.tasks.length);
          for (let taskIndex in tasks) {
            expect(tasks[taskIndex].name).toBe(
              meeMeeGoal.goal.tasks[taskIndex].name
            );
            expect(tasks[taskIndex].description).toBe(
              meeMeeGoal.goal.tasks[taskIndex].description
            );
            expect(tasks[taskIndex].completionDate).toBe(
              meeMeeGoal.goal.tasks[taskIndex].completionDate
            );
          }
          res(true);
        });
      });
    });
  });

  afterAll(async () => {
    // delete everything with testing

    // give server time to finalize actions
    // await updateSelf(socket1, socket1Data, "LarryC_C_sxas");
    // await updateSelf(socket2, socket2Data, "LarryC_C_sxa");
    await sleep(2000);

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

      await deleteAllTestingObjects();
    } catch {}
    // give server time to handle disconnections
    await sleep(4000);
  }, 50000);
});
