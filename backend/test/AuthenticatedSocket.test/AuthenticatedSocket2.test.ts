import { Socket } from "socket.io-client";
import { describe, it, expect, afterAll } from "vitest";
import { ObjectAny } from "../../src/types";
import { sleep } from "../../src/scripts/tools";
import {
  isSocketServerOnline,
  StartServer,
} from "../../src/socket/socketServer";
import {
  ConnectWithParams,
  CreateUser,
  deleteAllTestingObjects,
  handleData,
  updateSelf,
  updateState,
} from "./_AuthenticatedSocketHelperFunctions.test";

export let socket3: Socket;
let socket3TestToken = "Sookeet";
export let socket3Data: ObjectAny = {};
const socket3Username = "_testing_bruh_55";
const socket3FName = "Mister";
const socket3LName = "Foxx";

export let socket4: Socket;
let socket4TestToken = "Ksksksks";
export let socket4Data: ObjectAny = {};
const socket4Username = "NotKiryu43";
const socket4FName = "John";
const socket4LName = "Yakuza";

export let socket5: Socket;
let socket5TestToken = "Socratees";
export let socket5Data: ObjectAny = {};
const socket5Username = "_beebee_minecraft";
const socket5FName = "Steve";
const socket5LName = "Minecraft";

async function SendMessage(
  sendingSocket: Socket,
  params: object | undefined,
  expectedResponse: boolean | string | "string",
  receivingSockets: Socket[],
  nonReceivingSockets: Socket[],
  errorMessage: string
) {
  const { contents } = (params || {}) as ObjectAny;
  let counter = 0;
  const reqCount = receivingSockets.length + 1;
  let receivedResponse: string | boolean | undefined = undefined;
  let done = false;
  sendingSocket.emit("sendMessage", params, (v: boolean | string) => {
    receivedResponse = v;
    if (expectedResponse == "string" && typeof v == "string") {
      counter++;
      return;
    }
    if (v == expectedResponse) {
      counter++;
      return;
    }
    throw new Error(
      'Expected "' +
        expectedResponse +
        '", but got: ' +
        v +
        " | " +
        errorMessage
    );
  });

  receivingSockets.forEach((s) => {
    s.once("data", (payload) => {
      if (!payload || typeof payload != "object") {
        throw new Error("Expected payload to be an object. " + errorMessage);
      }
      const { type, data } = payload;
      if (type != "chat") {
        throw new Error("Unexpected chat type [" + errorMessage + "]: " + type);
      }
      if (!data || typeof data != "object") {
        throw new Error(
          "unexpected data format [" + errorMessage + "]: " + data
        );
      }
      const { lastMessage } = data;
      if (
        !lastMessage ||
        typeof lastMessage != "object" ||
        lastMessage.contents != contents
      ) {
        throw new Error(
          "Last message sent in chatObj was not as expected [" +
            errorMessage +
            "] " +
            JSON.stringify(lastMessage, null, 2)
        );
      }
      counter++;
    });
  });

  nonReceivingSockets.forEach((s, socketIndex) => {
    s.once("data", (payload) => {
      if (done) {
        return;
      }

      if (!payload || typeof payload != "object") {
        throw new Error("Expected payload to be an object. " + errorMessage);
      }
      const { type } = payload;
      if (type == "chat") {
        throw new Error(
          "Did not expect to get message for this socket [" +
            errorMessage +
            "] [" +
            socketIndex +
            "]"+ ' | '+ JSON.stringify(payload, null, 2)
        );
      }
    });
  });

  setTimeout(() => {
    if (counter != reqCount) {
      throw new Error(
        "Did not receive all messages on time [" +
          errorMessage +
          "] [" +
          counter +
          ", " +
          reqCount +
          "]"
      );
    }
  }, 3000);
  while (counter != reqCount) {
    await sleep(100);
  }
  done = true;
  if (receivedResponse != undefined) {
    return receivedResponse;
  }
  return undefined;
}


const sentChatMessage1 = 'EebeeOoboo Meemee Moomoo';
const sentChatMessage2 = 'Hooboo Hoomoo';
describe("Tests authenticated Socket (batch 2)", () => {
  describe("ensures server is online", async () => {
    await sleep(500);
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
  });

  describe("create socket3", { timeout: 20000 }, () => {
    it("Should login as socket3", async () => {
      socket3 = await ConnectWithParams(true, "asojc0asc", {
        auth: {
          token: `testing ${socket3TestToken}`,
        },
      });
      socket3.on("data", (payload) =>
        handleData(payload, socket3Data, "asojcas0")
      );
      socket3.on("state", (state) =>
        updateState(socket3Data, state, "socket3")
      );
    });

    it("Should wait for authed no user state", async () => {
      setTimeout(() => {
        if (!socket3Data.state) {
          throw new Error("Expected a state update by now socket3");
        }
      }, 2000);
      while (socket3Data.state != "authed_nouser") {
        await sleep(100);
      }
    });

    it("Should create socket3's account", async () => {
      await CreateUser(
        socket3,
        { fName: socket3FName, lName: socket3LName, username: socket3Username },
        true,
        "djo)dasd"
      );
    });
  });

  describe("create socket4", { timeout: 20000 }, () => {
    it("Should login as socket4", async () => {
      socket4 = await ConnectWithParams(true, "pO(HDV(a", {
        auth: {
          token: `testing ${socket4TestToken}`,
        },
      });
      socket4.on("data", (payload) =>
        handleData(payload, socket4Data, "OV0ava")
      );
      socket4.on("state", (state) =>
        updateState(socket4Data, state, "socket4")
      );
    });

    it("Should wait for authed no user state", async () => {
      setTimeout(() => {
        if (!socket4Data.state) {
          throw new Error("Expected a state update by now socket4");
        }
      }, 2000);
      while (socket4Data.state != "authed_nouser") {
        await sleep(100);
      }
    });

    it("Should create socket4's account", async () => {
      await CreateUser(
        socket4,
        { fName: socket4FName, lName: socket4LName, username: socket4Username },
        true,
        "ccascv42a"
      );
    });
  });

  describe("create socket5", { timeout: 20000 }, () => {
    it("Should login as socket5", async () => {
      socket5 = await ConnectWithParams(true, "DOha9c", {
        auth: {
          token: `testing ${socket5TestToken}`,
        },
      });
      socket5.on("data", (payload) =>
        handleData(payload, socket5Data, "acsoias")
      );
      socket5.on("state", (state) =>
        updateState(socket5Data, state, "socket5")
      );
    });

    it("Should wait for authed no user state", async () => {
      setTimeout(() => {
        if (!socket5Data.state) {
          throw new Error("Expected a state update by now socket5");
        }
      }, 2000);
      while (socket5Data.state != "authed_nouser") {
        await sleep(100);
      }
    });

    it("Should create socket5's account", async () => {
      await CreateUser(
        socket5,
        { fName: socket5FName, lName: socket5LName, username: socket5Username },
        true,
        "cS_As0dias"
      );
    });
  });

  describe("socket3 create chat and message message socket4",{ timeout: 20000 },() => {
      let firstCreatedChatID: string | undefined;
      it("should send message to socket3 successfully", async () => {
        await sleep(1000); // give sockets time to receive their data
        const targetUserID = socket4Data.id;
        firstCreatedChatID = await SendMessage(
          socket3,
          {
            action: "create",
            contents: sentChatMessage1,
            targetUserIDs: [targetUserID],
          },
          "string",
          [socket3, socket4],
          [socket5],
          "as0cja0s"
        );
      });

      it("Should return the sae chatID, to avoid creating", async () => {
        const targetUserID = socket4Data.id;
        const returnedChatID = await SendMessage(
          socket3,
          {
            action: "create",
            contents: 'asicnhaj0sd',
            targetUserIDs: [targetUserID],
          },
          "string",
          [],
          [socket3, socket4, socket5],
          "AIOHDVa"
        );
        expect(returnedChatID).toBe(firstCreatedChatID);
      });
    }
  );

  describe("socket3 fail create message under circumstances", () => {
    it("Should fail without params", async () => {
      await SendMessage(
        socket3,
        undefined,
        false,
        [],
        [socket3, socket4, socket5],
        "Micamooota"
      );
    });

    it("Should fail with empty params", async () => {
      await SendMessage(
        socket3,
        {},
        false,
        [],
        [socket3, socket4, socket5],
        "iasjc"
      );
    });

    it("Should fail with invalid action", async () => {
      await SendMessage(
        socket3,
        {
          action: "nonsense",
        },
        false,
        [],
        [socket3, socket4, socket5],
        "VDI(*Ady0v"
      );
    });
    it("Should fail to create with invalid contents", async () => {
      await SendMessage(
        socket3,
        {
          action: "create",
          contents: false,
        },
        false,
        [],
        [socket3, socket4, socket5],
        "asvadv42"
      );

      await SendMessage(
        socket3,
        {
          action: "create",
          contents: "",
        },
        false,
        [],
        [socket3, socket4, socket5],
        "asvadv42"
      );
    });

    it("Should fail without valid targetUserIDs", async () => {
      // no targets
      await SendMessage(
        socket3,
        {
          action: "create",
          contents: "BVAD_)uv",
          targetUserIDs: [],
        },
        false,
        [],
        [socket3, socket4, socket5],
        "cja9-0vdu"
      );

      // nonsense targets
      await SendMessage(
        socket3,
        {
          action: "create",
          contents: "Hold up",
          targetUserIDs: true,
        },
        false,
        [],
        [socket3, socket4, socket5],
        "+asc9has9c"
      );

      // non-existant target
      await SendMessage(
        socket3,
        {
          action: "create",
          contents: "Hold up",
          targetUserIDs: ["NonsenseID"],
        },
        false,
        [],
        [socket3, socket4, socket5],
        "+asc9has9c"
      );

      // 2 non-existant targets
      await SendMessage(
        socket3,
        {
          action: "create",
          contents: "Hold up",
          targetUserIDs: ["NonsenseID", "AnotherNonsenseID"],
        },
        false,
        [],
        [socket3, socket4, socket5],
        "0JO)Jdv"
      );
    });
  });

  describe("socket3 and 4 succeed sending messages to existing chat", () => {
    let targetChatID: string; 
    it ('should request self and acquire targetChatID', async () => {
      await updateSelf(socket3, socket3Data, '0aCJas0id');
      targetChatID = socket3Data.user.chats[0];
      expect(targetChatID).toBeDefined();
    });

    it('socket3 send message to socket4', async () => {
      await SendMessage(socket3, {
        action: 'send',
        chatID: targetChatID,
        contents: sentChatMessage1
      }, true, [socket3, socket4], [socket5], '9jvD(idv0a');
    });

    it('socket3 send message to socket4', async () => {
      await SendMessage(socket4, {
        action: 'send',
        chatID: targetChatID,
        contents: sentChatMessage2
      }, true, [socket3, socket4], [socket5], 'hudvha9');
    });
  });

  describe("socket3 and 4 should fail to communicate with each other", () => {
    let targetChatID: string; 
    it('should request self and acquire targetChatID', async () => {
      await updateSelf(socket4, socket4Data, '(A)CJa09s');
      targetChatID = socket4Data.user.chats[0];
      expect(targetChatID).toBeDefined();
    });

    it('should fail to send message without contents or chatID', async () => {
      await SendMessage(socket4, {
        action: 'send'
      }, false, [], [socket3, socket4, socket5], 'iASCh9h');
    });

    it('should fail to send message with invalid contents', async () => {
      await SendMessage(socket4, {
        action: 'send',
        contents: true,
        chatID: targetChatID
      }, false, [], [socket3, socket4, socket5], 'iVd9hv');

      await SendMessage(socket4, {
        action: 'send',
        contents: {},
        chatID: targetChatID
      }, false, [], [socket3, socket4, socket5], 'oDV0uadv');

      await SendMessage(socket4, {
        action: 'send',
        contents: '',
        chatID: targetChatID
      }, false, [], [socket3, socket4, socket5], '(A0dvjad)');
    });

    it('should fail to send message with invalid contents', async () => {
      await SendMessage(socket4, {
        action: 'send',
        contents: true,
        chatID: targetChatID
      }, false, [], [socket3, socket4, socket5], 'iVd9hv');

      await SendMessage(socket4, {
        action: 'send',
        contents: {},
        chatID: targetChatID
      }, false, [], [socket3, socket4, socket5], 'oDV0uadv');

      await SendMessage(socket4, {
        action: 'send',
        contents: '',
        chatID: targetChatID
      }, false, [], [socket3, socket4, socket5], '(A0dvjad)');
    });

    it('should fail to send message with invalid chatID', async () => {
      await SendMessage(socket4, {
        action: 'send',
        contents: 'asicasj',
        chatID: null
      }, false, [], [socket3, socket4, socket5], 'b35bt');

      await SendMessage(socket4, {
        action: 'send',
        contents: 'asicasj',
        chatID: 'invalid-chatID'
      }, false, [], [socket3, socket4, socket5], 'vs hy5');

      await SendMessage(socket4, {
        action: 'send',
        contents: 'asicasj',
        chatID: 942194
      }, false, [], [socket3, socket4, socket5], 'dc(*ADyv89');
    });
  });

  describe("socket3 and 4 should be able to fetch chat, but no one else.", () => {
    let chatID: string;
    function chatCheck(v: ObjectAny) {
      expect(v.id).toBe(chatID);
      expect(v.users).toBeDefined();
      const userIDs = Object.keys(v.users);
      expect(userIDs.includes(socket3Data.id)).toBe(true);
      expect(userIDs.includes(socket4Data.id)).toBe(true);
      expect(userIDs.includes(socket5Data.id)).toBe(false);
    }

    it('should getChatID', () => {
      chatID = socket3Data.user.chats[0];
      expect(chatID).toBeDefined
    });

    it('should allow socket3 to fetch chat', async () => {
      new Promise((res) => {
        socket3.emit('getChat', chatID, (v: ObjectAny) => {
          // only returns true if successful
          chatCheck(v);
          res(true);
        });
      });
    });

    it('should allow socket4 to fetch chat', async () => {
      new Promise((res) => {
        socket4.emit('getChat', chatID, (v: ObjectAny) => {
          // only returns true if successful
          chatCheck(v);
          res(true);
        });
      });
    });

    it('should allow socket5 to NOT fetch chat', async () => {
      new Promise((res, rej) => {
        socket5.emit('getChat', chatID, (v: ObjectAny) => {
          v ? rej('Expected failure [a9csjasc]') : res(true)
        });
      });
    });
  });

  describe("should get messages given messageID", async () => {
    let chatID: string;
    let chatObj: ObjectAny;
    it('should getChatID, then obj', async () => {
      chatID = socket3Data.user.chats[0];
      expect(chatID).toBeDefined
      chatObj = await new Promise((res, rej) => {
        socket3.emit('getChat', chatID, (v: unknown) => {
          if (v && typeof(v) == 'object') { 
            res(v);
          }
          rej('Expected to get chat asidda9sfj');
        });
      });
    });

    it('should allow messages to be retrieved and same as when I got them.', async () => {
      // messages = [sentMessage1, sentMessage1, setMessage2]
      const { messages, lastMessage } = chatObj;
      console.log(JSON.stringify(lastMessage, null, 2));
      console.log(JSON.stringify(messages, null, 2));
      expect(typeof(lastMessage)).toBe('object');
      expect(lastMessage.contents.toLowerCase().includes(sentChatMessage2.toLowerCase())).toBe(true);

      expect(messages instanceof Array).toBe(true);
      expect(messages.length).toBe(3);

      const messageObjs = await new Promise((res, rej) => {
        socket3.emit('getMessages', messages, (v: object[]) => {
          if (!(v instanceof Array)) {
            rej('expected to get messages successfully: '+JSON.stringify(v));
            return;
          }
          res(v);
        })
      }) as ObjectAny[];
      console.log('msgObjs', JSON.stringify(messageObjs, null, 2));
      expect(messageObjs.length).toBe(3);

      const message1 = messageObjs[0];
      console.log('m1', JSON.stringify(message1, null, 2));
      
      expect(typeof(message1)).toBe('object');
      expect(message1.contents.toLowerCase().includes(sentChatMessage1.toLowerCase())).toBe(true);

      const message2 = messageObjs[1];
      console.log('m2', JSON.stringify(message2, null, 2));
      expect(typeof(message2)).toBe('object');
      expect(message2.contents.toLowerCase().includes(sentChatMessage1.toLowerCase())).toBe(true);

      const message3 = messageObjs[2];
      console.log('m3', JSON.stringify(message3, null, 2));
      expect(typeof(message3)).toBe('object');
      expect(message3.contents.toLowerCase().includes(sentChatMessage2.toLowerCase())).toBe(true);
    });
  });

  describe("tests handleGetChats", () => {
    let chatIDs: string[] = [];
    it('Should get chatIDs', async () => {
      chatIDs = socket3Data.user.chats;
      expect(chatIDs).toBeDefined();
      expect(chatIDs.length > 0).toBe(true);
    });

    it('should succeed to get all chats that belong to the user', async () => {
      //socket3 and 4 should get, socket5 should not
      const chatObjsSocket3: ObjectAny[] = await new Promise((res, rej) => {
        socket3.emit('getChats', chatIDs, (v: ObjectAny[]) => {
          if (!(v instanceof Array)) {
            rej('Expected v to be an array');
          }
          res(v);
        });
      });
      expect(chatObjsSocket3.length).toBe(chatIDs.length);

      const chatObjsSocket4: ObjectAny[] = await new Promise((res, rej) => {
        socket4.emit('getChats', chatIDs, (v: ObjectAny[]) => {
          if (!(v instanceof Array)) {
            rej('Expected v to be an array');
          }
          res(v);
        });
      });
      expect(chatObjsSocket4.length).toBe(chatIDs.length);

      const chatObjsSocket5: ObjectAny[] = await new Promise((res, rej) => {
        socket5.emit('getChats', chatIDs, (v: ObjectAny[]) => {
          if (!(v instanceof Array)) {
            rej('Expected v to be an array');
          }
          res(v);
        });
      });
      expect(chatObjsSocket5.length).toBe(0);
    }); 
  });

  afterAll(async () => {
    socket3.disconnect();
    try {
      socket3.disconnect();
    } catch {}
    console.log("Socket3============", JSON.stringify(socket3Data, null, 2));
    try {
      socket4.disconnect();
    } catch {}
    console.log("Socket4============", JSON.stringify(socket4Data, null, 2));
    try {
      socket5.disconnect();
    } catch {}
    console.log("Socket5============", JSON.stringify(socket5Data, null, 2));
    await deleteAllTestingObjects();
    await sleep(3000);
  }, 20000);
});
