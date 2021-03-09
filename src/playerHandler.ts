import { Schema, Types } from "mongoose";
import { Server, Socket } from "socket.io";
import IFitwick from "./api/fitwick";
import IUser from "./api/user";
import IWorld from "./api/world";
import {
  EVENT_DISCONNECT,
  EVENT_DONE_FITWICK_NEW,
  EVENT_DONE_FITWICK_PLACE,
  EVENT_FITWICK_MOVE,
  EVENT_WORLD_ENTER,
  EVENT_WORLD_CHANGE_BACKGROUND,
  EVENT_WORLD_EXIT,
} from "./events";
const debug = require("debug")("fitw-server:server");

interface Message {
  readonly username: string;
  readonly date: string;
  readonly text: string;
}

interface Player {
  user: IUser;
  world: IWorld;
  // {
  //   name: string;
  //   fitwicks: IFitwick[];
  // };
}

export const messages: Message[] = [];
// maps socket ID to user/world
export const livePlayers = new Map<Socket["id"], Player>();
// maps world ID to number of players in that world
export const liveWorlds = new Map<IWorld["id"], number>();

const logMessage = (socket: Socket, message: string) => {
  const currentDate = new Date().toLocaleString();
  const username = livePlayers.has(socket.id)
    ? livePlayers.get(socket.id)?.user.username
    : socket.id;
  debug(`[${currentDate}] ${username}: ${message}`);
  messages.unshift({ username: username!, date: currentDate, text: message });
};

const registerPlayerHandlers = (io: Server, socket: Socket) => {
  // the connection event here is implicit:
  // this function is called when a client connects in server.ts
  logMessage(socket, "connected");

  socket.on(EVENT_WORLD_ENTER, (user: IUser, world: IWorld) => {
    if (user && world) {
      // generate a new world ID for newly created worlds
      if (!world.id) {
        world.id = Types.ObjectId();
      }
      logMessage(socket, `${user.username} entered ${world.name}`);
      livePlayers.set(socket.id, {
        user,
        world,
      });
      liveWorlds.set(world.id, (liveWorlds.get(world.id) || 0) + 1);
    } else {
      logMessage(
        socket,
        `attempted to enter ${world?.name} as ${user?.username}`
      );
    }
  });

  socket.on(EVENT_DISCONNECT, () => {
    logMessage(socket, "disconnected");
    if (livePlayers.has(socket.id)) {
      const playerWorld = livePlayers.get(socket.id)!.world;
      const playersInWorld = liveWorlds.get(playerWorld.id) || 1;
      if (playersInWorld === 1) {
        // TODO: save back to database
        // remember that some worlds will be newly generated
        liveWorlds.delete(playerWorld.id);
      } else {
        liveWorlds.set(playerWorld.id, playersInWorld - 1);
      }
      livePlayers.delete(socket.id);
    }
  });

  socket.on(EVENT_WORLD_CHANGE_BACKGROUND, (newBackgroundTexture: string) => {
    logMessage(socket, `changed background to ${newBackgroundTexture}`);
    if (livePlayers.has(socket.id)) {
      livePlayers.get(socket.id)!.world.background = newBackgroundTexture;
    }
  });

  socket.on(EVENT_DONE_FITWICK_NEW, (fitwick: IFitwick) => {
    logMessage(
      socket,
      `created new fitwick ${fitwick.name} at [${fitwick.x},${fitwick.y}]`
    );
    // TODO: verify fitwick properties
    if (livePlayers.has(socket.id)) {
      livePlayers.get(socket.id)!.world.fitwicks.push(fitwick);
    }
  });
  socket.on(
    EVENT_FITWICK_MOVE,
    (
      fitwickName: string,
      oldX: number,
      oldY: number,
      newX: number,
      newY: number
    ) => {
      logMessage(
        socket,
        `moved fitwick ${fitwickName} from [${oldX},${oldY}] to [${newX},${newY}]`
      );
      if (livePlayers.has(socket.id)) {
        const fitwickRef = livePlayers
          .get(socket.id)!
          .world.fitwicks.find(
            (fitwick) =>
              fitwick.name === fitwickName &&
              fitwick.x === oldX &&
              fitwick.y === oldY
          );
        if (fitwickRef) {
          fitwickRef.x = newX;
          fitwickRef.y = newY;
        }
      }
    }
  );
  socket.on(EVENT_DONE_FITWICK_PLACE, (fitwick: IFitwick) => {
    logMessage(
      socket,
      `placed fitwick ${fitwick.name} at [${fitwick.x},${fitwick.y}]`
    );
    if (livePlayers.has(socket.id)) {
      const fitwickRef = livePlayers
        .get(socket.id)!
        .world.fitwicks.find(
          (worldFitwick) =>
            worldFitwick.name === fitwick.name &&
            worldFitwick.x === fitwick.x &&
            worldFitwick.y === fitwick.y
        );
      if (fitwickRef) {
        fitwickRef.state = "rest";
      }
    }
  });

  socket.on(EVENT_WORLD_EXIT, () => {
    logMessage(socket, "left the world");
  });

  socket.on("message", (message: string) => {
    logMessage(socket, message);
  });
};

export default registerPlayerHandlers;
