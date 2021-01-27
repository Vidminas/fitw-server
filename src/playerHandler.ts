import { Server, Socket } from "socket.io";
const debug = require("debug")("fitw-server:server");

interface Message {
  readonly userId: string;
  readonly date: string;
  readonly text: string;
}

export const messages: Message[] = [];
export let numPlayers: number = 0;

const logMessage = (socket: Socket, message: string) => {
  const currentDate = new Date().toLocaleString();
  debug(`[${currentDate}] user ${socket.id}: ${message}`);
  messages.unshift({ userId: socket.id, date: currentDate, text: message });
};

const registerPlayerHandlers = (io: Server, socket: Socket) => {
  logMessage(socket, "connected");
  numPlayers++;

  socket.on("disconnect", () => {
    logMessage(socket, "disconnected");
    numPlayers--;
  });

  socket.on("message", (message: string) => {
    logMessage(socket, message);
  });
};

export default registerPlayerHandlers;
