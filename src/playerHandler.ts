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
  EVENT_DONE_FITWICK_DELETE,
  EVENT_MESSAGE,
} from "./api/events";
import worldModel from "./models/world";
import userModel from "./models/user";
import { FITWICKS, FitwickTheme } from "./fitwicks";
const debug = require("debug")("fitw-server:server");

interface Message {
  readonly username: string;
  readonly date: string;
  readonly text: string;
}

interface LivePlayer {
  user: IUser;
  world: IWorld;
  userModified: boolean;
}

interface LiveWorld {
  playersInWorld: Socket[];
  worldModified: boolean;
}

export const messages: Message[] = [];
// maps socket ID to user/world
export const livePlayers = new Map<Socket["id"], LivePlayer>();
// maps world ID to players currently in that world
export const liveWorlds = new Map<IWorld["id"], LiveWorld>();

const logMessage = (socket: Socket, message: string) => {
  const currentDate = new Date().toLocaleString();
  const username = livePlayers.has(socket.id)
    ? livePlayers.get(socket.id)?.user.username
    : socket.id;
  debug(`[${currentDate}] ${username}: ${message}`);
  messages.unshift({ username: username!, date: currentDate, text: message });
};

const modifyPlayerWorld = (
  socket: Socket,
  handler: (world: IWorld) => void,
  announcementForOthers: ((username: string) => string) | null,
  event: string,
  ...args: any[]
) => {
  if (!livePlayers.has(socket.id)) {
    logMessage(
      socket,
      `Non live player ${socket.id} attempted to modify world!`
    );
    return;
  }

  const livePlayer = livePlayers.get(socket.id)!;

  if (!liveWorlds.has(livePlayer.world.id)) {
    logMessage(
      socket,
      `Player ${livePlayer.user.username} attempted to modify non-live world!`
    );
    return;
  }

  const liveWorld = liveWorlds.get(livePlayer.world.id)!;
  liveWorld.worldModified = true;
  handler(livePlayer.world);

  for (const otherPlayer of liveWorld.playersInWorld) {
    if (otherPlayer.id !== socket.id) {
      if (announcementForOthers) {
        otherPlayer.emit(
          EVENT_MESSAGE,
          "primary",
          announcementForOthers(livePlayer.user.username)
        );
      }

      otherPlayer.emit(event, ...args);
    }
  }
};

const findFitwick = (world: IWorld, fitwick: IFitwick) => {
  return world.fitwicks.find(
    (worldFitwick) => worldFitwick.worldId === fitwick.worldId
  );
};

const saveWorld = async (player: LivePlayer) => {
  try {
    const worldInDB = await worldModel.findById(player.world.id);
    if (worldInDB) {
      await worldInDB.updateOne(player.world);
      debug(`Updated world "${player.world.name}" in DB`);
    } else {
      const newWorld = new worldModel({
        _id: player.world.id,
        ...player.world,
      });
      await newWorld.save();
      debug(`Created new world "${player.world.name}" in DB`);
    }
  } catch (error) {
    debug(`Error saving world "${player.world.name}" to DB: ${error}`);
  }
};

const saveUser = async (player: LivePlayer) => {
  try {
    const userInDB = await userModel.findById(player.user.id);
    if (userInDB) {
      await userInDB.updateOne(player.user);
    }
    player.userModified = false;
    debug(`Saved user "${player.user.username}" to DB`);
  } catch (error) {
    debug(`Error saving user "${player.user.username}" to DB: ${error}`);
  }
};

const registerPlayerHandlers = (io: Server, socket: Socket) => {
  // the connection event here is implicit:
  // this function is called when a client connects in server.ts
  logMessage(socket, "connected");

  socket.on(EVENT_WORLD_ENTER, (user: IUser, world: IWorld) => {
    if (!user || !world) {
      logMessage(
        socket,
        `attempted to enter ${world?.name} as ${user?.username}`
      );
      return;
    }

    logMessage(socket, `${user.username} entered ${world.name}`);
    livePlayers.set(socket.id, {
      user,
      world,
      userModified: !world.id,
    });

    // generate a new world ID for newly created worlds
    if (!world.id) {
      user.stats.createdWorlds++;
      world.id = Types.ObjectId();
      liveWorlds.set(world.id, {
        playersInWorld: [socket],
        // ensure that the new world is saved back even if empty
        // because it gets added to user worlds
        worldModified: true,
      });
    } else if (liveWorlds.has(world.id)) {
      const liveWorld = liveWorlds.get(world.id)!;
      for (const otherPlayer of liveWorld.playersInWorld) {
        otherPlayer.emit(
          EVENT_MESSAGE,
          "primary",
          `${user.username} joined the world!`
        );
      }
      liveWorld.playersInWorld.push(socket);
    } else {
      liveWorlds.set(world.id, {
        playersInWorld: [socket],
        worldModified: false,
      });
    }
  });

  socket.on(EVENT_WORLD_EXIT, () => {
    logMessage(socket, "left the world");
    if (livePlayers.has(socket.id)) {
      const livePlayer = livePlayers.get(socket.id)!;
      if (!livePlayer.user.worlds.includes(livePlayer.world.id)) {
        logMessage(
          socket,
          `Added world "${livePlayer.world.name}" to ${livePlayer.user.username}'s worlds`
        );
        livePlayer.user.worlds.push(livePlayer.world.id);
        livePlayer.userModified = true;
      }

      const liveWorld = liveWorlds.get(livePlayer.world.id)!;
      for (const otherPlayer of liveWorld.playersInWorld) {
        if (otherPlayer.id !== socket.id) {
          otherPlayer.emit(
            EVENT_MESSAGE,
            "primary",
            `${livePlayer.user.username} left the world!`
          );
        }
      }
    }
  });

  socket.on(EVENT_DISCONNECT, async () => {
    logMessage(socket, "disconnected");
    if (livePlayers.has(socket.id)) {
      const player = livePlayers.get(socket.id)!;
      const liveWorld = liveWorlds.get(player.world.id);

      if (liveWorld) {
        if (liveWorld.worldModified) {
          saveWorld(player);
        }

        if (
          !liveWorld.playersInWorld ||
          liveWorld.playersInWorld[0].id === socket.id
        ) {
          liveWorlds.delete(player.world.id);
        } else {
          liveWorld.playersInWorld.splice(
            liveWorld.playersInWorld.findIndex(
              (playerSocket) => playerSocket.id === socket.id
            ),
            1
          );
        }
      }

      if (player.userModified) {
        saveUser(player);
      }

      livePlayers.delete(socket.id);
    }
  });

  socket.on(EVENT_WORLD_CHANGE_BACKGROUND, (newBackgroundTexture: string) => {
    logMessage(socket, `changed background to ${newBackgroundTexture}`);
    modifyPlayerWorld(
      socket,
      (world: IWorld) => {
        world.background = newBackgroundTexture;
      },
      (username: string) => `${username} changed the world background!`,
      EVENT_WORLD_CHANGE_BACKGROUND,
      newBackgroundTexture
    );
  });

  socket.on(EVENT_DONE_FITWICK_NEW, (fitwick: IFitwick) => {
    logMessage(
      socket,
      `created new fitwick ${fitwick.name} at [${fitwick.x},${fitwick.y}]`
    );
    if (livePlayers.has(socket.id)) {
      const livePlayer = livePlayers.get(socket.id)!;
      livePlayer.user.stats.createdTotalObjects++;
      livePlayer.userModified = true;

      if (!livePlayer.user.uniqueObjectList) {
        livePlayer.user.uniqueObjectList = [fitwick.name];
      } else if (!livePlayer.user.uniqueObjectList.includes(fitwick.name)) {
        livePlayer.user.uniqueObjectList.push(fitwick.name);
        livePlayer.user.stats.createdUniqueObjects++;

        if (FITWICKS.has(fitwick.name)) {
          const fitwickThemes = FITWICKS.get(fitwick.name)!;
          if (fitwickThemes.includes(FitwickTheme.COOKING)) {
            livePlayer.user.stats.createdUniqueCookingObjects++;
          }
          if (fitwickThemes.includes(FitwickTheme.DESERT)) {
            livePlayer.user.stats.createdUniqueDesertObjects++;
          }
          if (fitwickThemes.includes(FitwickTheme.ELETRONICS)) {
            livePlayer.user.stats.createdUniqueElectronicsObjects++;
          }
          if (fitwickThemes.includes(FitwickTheme.TOOLS)) {
            livePlayer.user.stats.createdUniqueToolObjects++;
          }
          if (fitwickThemes.includes(FitwickTheme.TREES)) {
            livePlayer.user.stats.createdUniqueTreeObjects++;
          }
          if (fitwickThemes.includes(FitwickTheme.WINTER)) {
            livePlayer.user.stats.createdUniqueWinterObjects++;
          }
        }
      }
    }

    // TODO: verify fitwick properties
    modifyPlayerWorld(
      socket,
      (world: IWorld) => {
        world.fitwicks.push(fitwick);
      },
      null,
      EVENT_DONE_FITWICK_NEW,
      fitwick
    );
  });

  socket.on(EVENT_FITWICK_MOVE, (fitwick: IFitwick) => {
    // don't log fitwick moves because they are very many
    // logMessage(
    //   socket,
    //   `moved fitwick ${fitwick.name} to [${fitwick.x},${fitwick.y}]`
    // );
    modifyPlayerWorld(
      socket,
      (world: IWorld) => {
        const fitwickRef = findFitwick(world, fitwick);
        if (fitwickRef) {
          fitwickRef.x = fitwick.x;
          fitwickRef.y = fitwick.y;
        }
      },
      null,
      EVENT_FITWICK_MOVE,
      fitwick
    );
  });

  socket.on(EVENT_DONE_FITWICK_PLACE, (fitwick: IFitwick) => {
    logMessage(
      socket,
      `placed fitwick ${fitwick.name} at [${fitwick.x},${fitwick.y}]`
    );
    modifyPlayerWorld(
      socket,
      (world: IWorld) => {
        const fitwickRef = findFitwick(world, fitwick);
        if (fitwickRef) {
          fitwickRef.x = fitwick.x;
          fitwickRef.y = fitwick.y;
        }
      },
      null,
      EVENT_DONE_FITWICK_PLACE,
      fitwick
    );
  });

  socket.on(EVENT_FITWICK_PICK_UP, (fitwick: IFitwick) => {
    logMessage(
      socket,
      `picked up fitwick ${fitwick.name} from [${fitwick.x},${fitwick.y}]`
    );

    modifyPlayerWorld(
      socket,
      (world: IWorld) => undefined,
      null,
      EVENT_FITWICK_PICK_UP,
      fitwick
    );
  });

  socket.on(EVENT_DONE_FITWICK_DELETE, (fitwick: IFitwick) => {
    logMessage(
      socket,
      `deleted fitwick ${fitwick.name} at [${fitwick.x},${fitwick.y}]`
    );
    modifyPlayerWorld(
      socket,
      (world: IWorld) => {
        world.fitwicks.splice(
          world.fitwicks.findIndex(
            (worldFitwick) => worldFitwick.worldId === fitwick.worldId
          ),
          1
        );
      },
      null,
      EVENT_DONE_FITWICK_DELETE,
      fitwick
    );
  });
};

export default registerPlayerHandlers;
