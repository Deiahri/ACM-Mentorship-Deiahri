import { Socket } from "socket.io-client";
import { describe, it, expect } from "vitest";
import { ObjectAny } from "../../src/types";
import { ConnectWithParams, CreateUser } from "./AuthenticatedSocket1.test";

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

describe("Tests authenticated Socket (batch 2)", () => {
  describe("create socket3", () => {
    it("Should login as socket3", async () => {
      socket3 = await ConnectWithParams(true, "asojc0asc", {
        auth: {
          token: `Bearer ${socket3TestToken}`,
        },
      });
    });

    it("Should create socket3's account", async () => {
      await CreateUser(
        socket3,
        { fName: socket3FName, lName: socket3LName, username: socket3Username },
        true,
        'djo)dasd'
      );
    });
  });

  describe("create socket4", () => {
    it("Should login as socket4", async () => {
      socket4 = await ConnectWithParams(true, "pO(HDV(a", {
        auth: {
          token: `Bearer ${socket4TestToken}`,
        },
      });
    });

    it("Should create socket4's account", async () => {
      await CreateUser(
        socket4,
        { fName: socket4FName, lName: socket4LName, username: socket4Username },
        true,
        'ccascv42a'
      );
    });
  });

  describe("create socket5", () => {
    it("Should login as socket5", async () => {
      socket4 = await ConnectWithParams(true, "DOha9c", {
        auth: {
          token: `Bearer ${socket5TestToken}`,
        },
      });
    });

    it("Should create socket5's account", async () => {
      await CreateUser(
        socket5,
        { fName: socket5FName, lName: socket5LName, username: socket5Username },
        true,
        'cS_As0dias'
      );
    });
  });

  describe("socket3 message socket4", async () => {
    
  });
});
