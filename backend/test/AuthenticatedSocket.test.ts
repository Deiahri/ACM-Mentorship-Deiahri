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
import { DBDeleteWithID, DBGet } from "../src/db";

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
  let socket1Data = {};

  let socket2: Socket;
  let socket2TestToken = "herobrine";
  let socket2Data = {};

  function updateState(targetSocketData: Object, state: string) {
    console.log("received state update", state);
    targetSocketData["state"] = state;
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
    });
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
        "env SAMPLE_USER_ACCESS_TOKEN is likely expired. Replace it with a real token.",
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
    "should see socket1 connect, and observer correct state changes",
    { timeout: 5000 },
    async () => {
      socket1 = await ConnectWithParams(true, "socket1 connect", {
        auth: {
          token: `testing ${socket1TestToken}`,
          deleteAccountAfterDisconnect: true,
        },
      });

      socket1.on("state", (state) => updateState(socket1Data, state));
      socket1.on("message", (dat) =>
        console.log("received message for socket1", dat)
      );

      // expect to receive authed_nouser state.
      await new Promise((res, rej) => {
        socket1.once("state", (state) => {
          if (state == "authed_user") {
            rej("Got unexpected state from socket1");
          } else if (state == "authed_nouser") {
            res(true);
          }
          setTimeout(
            () => rej("did not receive state fast enough S)Jc9djv"),
            2000
          );
        });
      });
    }
  );

  function CreateUser(
    socket: Socket,
    params: Object | undefined,
    succeed: boolean,
    errorMessage: string
  ) {
    return new Promise((res, rej) => {
      socket.emit("createUser", params, (v: boolean) => {
        v
          ? succeed
            ? res(true)
            : rej("Expected failure" + errorMessage)
          : succeed
          ? rej("Expected success" + errorMessage)
          : res(true);
      });
    });
  }
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
      { fName: "Tester", lName: "Bester", username: "LaoGui" },
      true,
      "_)VE&*7fv"
    );
  });

  it("Should be able to log back into created account", async () => {
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

    socket1.disconnect();

    // connect to server
    socket1 = await ConnectWithParams(true, "mxisbidavd", {
      auth: {
        token: `testing ${socket1TestToken}`,
        deleteAccountAfterDisconnect: true,
      },
    });
    socket1.on("state", (state) => updateState(socket1Data, state));
    socket1.on("message", (msg) => console.log("received message, s1", msg));

    // expect state to be authed user.
    await new Promise((res, rej) => {
      socket1.once("state", (state: string) => {
        if (state == "authed_user") {
          res(true);
        } else if (state == "authed_nouser") {
          rej("expected state1 to be authed_user. )SJCs9ad0jvd");
        }
      });
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
      });
    });
  });

  afterAll(async () => {
    // give server time to do any post disconnect processing.
    try {
      socket1.disconnect();
      // socket2.disconnect();
    } catch {}
    await sleep(3000);
  });
});
