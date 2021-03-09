import { Types } from "mongoose";
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
  EVENT_FITWICK_PICK_UP,
  EVENT_FITWICK_DELETE,
} from "./api/events";
import worldModel from "./models/world";
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

const addFitwick = (socket: Socket, fitwick: IFitwick) => {
  // TODO: verify fitwick properties
  if (livePlayers.has(socket.id)) {
    livePlayers.get(socket.id)!.world.fitwicks.push(fitwick);
  }
};

const findFitwick = (socket: Socket, fitwick: IFitwick) => {
  if (livePlayers.has(socket.id)) {
    return livePlayers
      .get(socket.id)!
      .world.fitwicks.find((worldFitwick) => worldFitwick.id === fitwick.id);
  }
  return undefined;
};

const deleteFitwick = (socket: Socket, fitwick: IFitwick) => {
  if (livePlayers.has(socket.id)) {
    const fitwicksArr = livePlayers.get(socket.id)!.world.fitwicks;
    fitwicksArr.splice(
      fitwicksArr.findIndex((worldFitwick) => worldFitwick.id === fitwick.id),
      1
    );
  }
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

  socket.on(EVENT_WORLD_EXIT, () => {
    logMessage(socket, "left the world");
  });

  socket.on(EVENT_DISCONNECT, async () => {
    logMessage(socket, "disconnected");
    if (livePlayers.has(socket.id)) {
      const playerWorld = livePlayers.get(socket.id)!.world;
      const playersInWorld = liveWorlds.get(playerWorld.id) || 1;
      if (playersInWorld === 1) {
        try {
          const worldInDB = await worldModel.findById(playerWorld.id);
          if (worldInDB) {
            await worldInDB.updateOne({
              name: playerWorld.name,
              background: playerWorld.background,
              fitwicks: playerWorld.fitwicks,
            });
          } else {
            const newWorld = new worldModel(playerWorld);
            await newWorld.save();
          }
          debug(`Saved world ${playerWorld.name} to DB`);
        } catch (error) {
          debug(`Error saving world ${playerWorld.name} to DB: ${error}`);
        }

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
    addFitwick(socket, fitwick);
  });

  socket.on(EVENT_FITWICK_MOVE, (fitwick: IFitwick) => {
    // don't log fitwick moves because they are very many
    // logMessage(
    //   socket,
    //   `moved fitwick ${fitwick.name} to [${fitwick.x},${fitwick.y}]`
    // );
    const fitwickRef = findFitwick(socket, fitwick);
    if (fitwickRef) {
      fitwickRef.x = fitwick.x;
      fitwickRef.y = fitwick.y;
    }
  });

  socket.on(EVENT_DONE_FITWICK_PLACE, (fitwick: IFitwick) => {
    logMessage(
      socket,
      `placed fitwick ${fitwick.name} at [${fitwick.x},${fitwick.y}]`
    );
    const fitwickRef = findFitwick(socket, fitwick);
    if (fitwickRef) {
      fitwickRef.state = "rest";
    }
  });

  socket.on(EVENT_FITWICK_PICK_UP, (fitwick: IFitwick) => {
    logMessage(
      socket,
      `picked up fitwick ${fitwick.name} from [${fitwick.x},${fitwick.y}]`
    );
    const fitwickRef = findFitwick(socket, fitwick);
    if (fitwickRef) {
      fitwickRef.state = "move";
    }
  });

  socket.on(EVENT_FITWICK_DELETE, (fitwick: IFitwick) => {
    logMessage(
      socket,
      `deleted fitwick ${fitwick.name} at [${fitwick.x},${fitwick.y}]`
    );
    deleteFitwick(socket, fitwick);
  });

  socket.on("message", (message: string) => {
    logMessage(socket, message);
  });
};

export default registerPlayerHandlers;
