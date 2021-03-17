import { Server, Socket } from "socket.io";
import { EVENT_DISCONNECT } from "./api/events";
import { livePlayers, liveWorlds } from "./playerHandler";
import {
  SERVER_EVENT_LOG_MESSAGE,
  SERVER_EVENT_PLAYER_COUNT_CHANGED,
  SERVER_EVENT_TOMORROW,
  SERVER_EVENT_WORLD_COUNT_CHANGED,
  SERVER_EVENT_YESTERDAY,
} from "./serverEvents";
import { getToday, makeItTomorrow, makeItYesterday } from "./time";
const debug = require("debug")("fitw-server:admin");

interface Message {
  username: string;
  date?: string;
  text: string;
}

export const serverLogMessages: Message[] = [];
let adminSocket: Socket | undefined = undefined;

export const logServerMessage = (message: Message) => {
  if (!message.date) {
    const currentDate = new Date();
    const serverDate = getToday();
    currentDate.setFullYear(serverDate.getFullYear());
    currentDate.setMonth(serverDate.getMonth());
    currentDate.setDate(serverDate.getDate());
    message.date = currentDate.toLocaleString();
  }
  debug(`[${message.date}] ${message.username}: ${message.text}`);
  serverLogMessages.unshift(message);

  if (adminSocket) {
    adminSocket.emit(SERVER_EVENT_LOG_MESSAGE, message);
  }
};

export const adminUpdatePlayerCount = () => {
  if (adminSocket) {
    adminSocket.emit(SERVER_EVENT_PLAYER_COUNT_CHANGED, livePlayers.size);
  }
};

export const adminUpdateWorldCount = () => {
  if (adminSocket) {
    adminSocket.emit(SERVER_EVENT_WORLD_COUNT_CHANGED, liveWorlds.size);
  }
};

const registerAdminHandlers = (io: Server, socket: Socket) => {
  // this function is called when a client connects in server.ts
  // one of these clients is the admin interface and here we
  // can exchange data with the server
  if (!socket.handshake.xdomain) {
    debug("admin connected");
    adminSocket = socket;

    socket.on(EVENT_DISCONNECT, () => {
      adminSocket = undefined;
    });

    socket.on(SERVER_EVENT_TOMORROW, (callback: (today: string) => void) => {
      makeItTomorrow();
      const newDateString = getToday().toLocaleDateString();
      debug(`admin changed server time to ${newDateString}`);
      callback(newDateString);
    });

    socket.on(SERVER_EVENT_YESTERDAY, (callback: (today: string) => void) => {
      makeItYesterday();
      const newDateString = getToday().toLocaleDateString();
      debug(`admin changed server time to ${newDateString}`);
      callback(newDateString);
    });
  }
};

export default registerAdminHandlers;
