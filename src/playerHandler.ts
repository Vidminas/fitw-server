import { Server, Socket } from "socket.io";
import {
  EVENT_DISCONNECT,
  EVENT_FITWICK_NEW,
  EVENT_SELF_IDENTIFY,
} from "./events";
import { IUser } from "./models/user";
const debug = require("debug")("fitw-server:server");

interface Message {
  readonly username: string;
  readonly date: string;
  readonly text: string;
}

export const messages: Message[] = [];
export let numPlayers: number = 0;
const identifiedUsers = new Map<string, IUser>();

const logMessage = (socket: Socket, message: string) => {
  const currentDate = new Date().toLocaleString();
  const username = identifiedUsers.has(socket.id)
    ? identifiedUsers.get(socket.id)?.username
    : socket.id;
  debug(`[${currentDate}] ${username}: ${message}`);
  messages.unshift({ username: username!, date: currentDate, text: message });
};

const registerPlayerHandlers = (io: Server, socket: Socket) => {
  // the connection event here is implicit:
  // this function is called when a client connects in server.ts
  logMessage(socket, "connected");
  numPlayers++;

  socket.on(EVENT_SELF_IDENTIFY, (user: IUser) => {
    if (user) {
      logMessage(socket, `self identified as ${user.username}`);
      identifiedUsers.set(socket.id, user);
    } else {
      logMessage(socket, "attempted to self identify with null user");
    }
  });

  socket.on(EVENT_DISCONNECT, () => {
    logMessage(socket, "disconnected");
    numPlayers--;
  });

  socket.on(EVENT_FITWICK_NEW, (fitwickName: string) => {
    logMessage(socket, fitwickName);
  });

  socket.on("message", (message: string) => {
    logMessage(socket, message);
  });
};

export default registerPlayerHandlers;
