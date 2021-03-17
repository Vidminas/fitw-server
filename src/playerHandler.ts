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
import worldModel, { IWorldDocument } from "./models/world";
import userModel, { IUserDocument } from "./models/user";
import { FITWICKS, FitwickTheme } from "./fitwicks";
import { getToday, isSameDay } from "./time";
import {
  adminUpdatePlayerCount,
  adminUpdateWorldCount,
  logServerMessage,
} from "./adminHandler";

interface LivePlayer {
  user: IUserDocument;
  worldId: IWorld["id"];
  userModified: boolean;
}

interface LiveWorld {
  world: IWorldDocument;
  playersInWorld: Socket[];
  worldModified: boolean;
}

// maps socket ID to user/world
export const livePlayers = new Map<Socket["id"], LivePlayer>();
// maps world ID to players currently in that world
export const liveWorlds = new Map<IWorld["id"], LiveWorld>();
// use with caution!!
export const disconnectAll = () => {
  liveWorlds.forEach((liveWorld) => {
    for (const socket of liveWorld.playersInWorld) {
      socket.emit(
        EVENT_MESSAGE,
        "danger",
        "The server administrator has disconnected everyone"
      );
      // TODO: find out if this should close the underlying connection or not
      socket.disconnect();
    }
    if (liveWorld.worldModified) {
      saveWorld(liveWorld);
    }
  });
  liveWorlds.clear();
  adminUpdateWorldCount();

  livePlayers.forEach((livePlayer) => {
    if (livePlayer.userModified) {
      saveUser(livePlayer);
    }
  });
  livePlayers.clear();
  adminUpdatePlayerCount();
};

const logPlayerMessage = (socket: Socket, message: string) => {
  const username = livePlayers.has(socket.id)
    ? livePlayers.get(socket.id)?.user.username
    : socket.id;
  logServerMessage({ username: username!, text: message });
};

const modifyPlayerWorld = (
  socket: Socket,
  handler: (world: IWorld) => void,
  announcementForOthers: ((username: string) => string) | null,
  event: string,
  ...args: any[]
) => {
  if (!livePlayers.has(socket.id)) {
    logPlayerMessage(
      socket,
      `Non live player ${socket.id} attempted to modify world!`
    );
    return;
  }

  const livePlayer = livePlayers.get(socket.id)!;

  if (!liveWorlds.has(livePlayer.worldId)) {
    logPlayerMessage(
      socket,
      `Player ${livePlayer.user.username} attempted to modify non-live world!`
    );
    return;
  }

  const liveWorld = liveWorlds.get(livePlayer.worldId)!;
  liveWorld.worldModified = true;
  handler(liveWorld.world);

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

const createWorld = async (worldName: string) => {
  try {
    const newWorld = new worldModel({
      name: worldName,
      background: "",
      fitwicks: [],
    });
    await newWorld.save();
    logServerMessage({
      username: "server",
      text: `Created new world "${worldName}" in DB`,
    });
    return newWorld;
  } catch (error) {
    logServerMessage({
      username: "server",
      text: `Error creating new world "${worldName}" in DB: ${error}`,
    });
  }
  return undefined;
};

const loadWorld = async (worldId: IWorld["id"]) => {
  try {
    return await worldModel.findById(worldId);
  } catch (error) {
    logServerMessage({
      username: "server",
      text: `Error loading world with ID ${worldId} from DB: ${error}`,
    });
  }
  return undefined;
};

const saveWorld = async (liveWorld: LiveWorld) => {
  try {
    await liveWorld.world.save();
    logServerMessage({
      username: "server",
      text: `Updated world "${liveWorld.world.name}" in DB`,
    });
    liveWorld.worldModified = false;
  } catch (error) {
    logServerMessage({
      username: "server",
      text: `Error saving world "${liveWorld.world.name}" to DB: ${error}`,
    });
  }
};

const loadUser = async (userId: IUser["id"]) => {
  try {
    return await userModel.findById(userId);
  } catch (error) {
    logServerMessage({
      username: "server",
      text: `Error loading user with ID ${userId} from DB: ${error}`,
    });
  }
  return undefined;
};

const saveUser = async (player: LivePlayer) => {
  try {
    await player.user.save();
    logServerMessage({
      username: "server",
      text: `Saved user "${player.user.username}" to DB`,
    });
    player.userModified = false;
  } catch (error) {
    logServerMessage({
      username: "server",
      text: `Error saving user "${player.user.username}" to DB: ${error}`,
    });
  }
};

const registerPlayerHandlers = (io: Server, socket: Socket) => {
  // the connection event here is implicit:
  // this function is called when a client connects in server.ts
  if (!socket.handshake.xdomain) {
    // the socket comes from the same domain - this is the admin front-end interface
    return;
  }

  logPlayerMessage(socket, "connected");

  socket.on(
    EVENT_WORLD_ENTER,
    async (
      userId: IUser["id"],
      worldId: IWorld["id"],
      worldName: string,
      callback
    ) => {
      if (!userId || !worldName) {
        logPlayerMessage(
          socket,
          `attempted to enter world ${worldName} with user ID ${userId}`
        );
        return;
      }

      const user = await loadUser(userId);
      if (!user) {
        logPlayerMessage(socket, `no user with ID ${userId} found in DB!`);
        return;
      }

      let world: IWorldDocument | null | undefined = undefined;

      if (!worldId || !liveWorlds.has(worldId)) {
        if (!worldId) {
          user.stats.createdWorlds++;
          world = await createWorld(worldName);
        } else {
          world = await loadWorld(worldId);
        }

        if (!world) {
          logPlayerMessage(socket, `no world with ID ${worldId} found in DB!`);
          return;
        }
        liveWorlds.set(world.id, {
          world,
          playersInWorld: [socket],
          worldModified: false,
        });
        adminUpdateWorldCount();
      } else {
        const liveWorld = liveWorlds.get(worldId)!;
        world = liveWorld.world;

        if (world.name === worldName) {
          for (const otherPlayer of liveWorld.playersInWorld) {
            otherPlayer.emit(
              EVENT_MESSAGE,
              "primary",
              `${user.username} joined the world!`
            );
          }
        } else {
          world.name = worldName;
          liveWorld.worldModified = true;
          for (const otherPlayer of liveWorld.playersInWorld) {
            otherPlayer.emit(
              EVENT_MESSAGE,
              "primary",
              `${user.username} joined the world and changed its name to ${worldName}!`
            );
          }
        }

        liveWorld.playersInWorld.push(socket);
      }

      // only set up a live player if successfully loaded both user and world
      livePlayers.set(socket.id, {
        user,
        worldId,
        // if the world was new (no ID), it gets added to the user worlds list
        userModified: !worldId,
      });
      adminUpdatePlayerCount();

      callback(world.toJSON());
      logPlayerMessage(socket, `${user.username} entered ${worldName}`);
    }
  );

  socket.on(EVENT_WORLD_EXIT, () => {
    if (!livePlayers.has(socket.id)) {
      logPlayerMessage(socket, "non-live player attempted to leave the world!");
      return;
    }
    const livePlayer = livePlayers.get(socket.id)!;

    if (!liveWorlds.has(livePlayer.worldId)) {
      logPlayerMessage(
        socket,
        `attempted to leave non-live world with ID ${livePlayer.worldId}!`
      );
      return;
    }
    const liveWorld = liveWorlds.get(livePlayer.worldId)!;

    if (!livePlayer.user.worlds.includes(livePlayer.worldId)) {
      logPlayerMessage(
        socket,
        `Added world "${liveWorld.world.name}" to ${livePlayer.user.username}'s worlds`
      );
      livePlayer.user.worlds.push(livePlayer.worldId);
      livePlayer.userModified = true;
    }

    for (const otherPlayer of liveWorld.playersInWorld) {
      if (otherPlayer.id !== socket.id) {
        otherPlayer.emit(
          EVENT_MESSAGE,
          "primary",
          `${livePlayer.user.username} left the world!`
        );
      }
    }

    logPlayerMessage(socket, "left the world");
  });

  socket.on(EVENT_DISCONNECT, async () => {
    if (!livePlayers.has(socket.id)) {
      logPlayerMessage(socket, "non-live player disconnected!");
      return;
    }
    const livePlayer = livePlayers.get(socket.id)!;

    const liveWorld = liveWorlds.get(livePlayer.worldId);
    if (liveWorld) {
      if (liveWorld.worldModified) {
        saveWorld(liveWorld);
      }

      if (
        !liveWorld.playersInWorld.length ||
        (liveWorld.playersInWorld.length === 1 &&
          liveWorld.playersInWorld[0].id === socket.id)
      ) {
        liveWorlds.delete(livePlayer.worldId);
        adminUpdateWorldCount();
      } else {
        liveWorld.playersInWorld.splice(
          liveWorld.playersInWorld.findIndex(
            (playerSocket) => playerSocket.id === socket.id
          ),
          1
        );
      }
    }

    if (livePlayer.userModified) {
      saveUser(livePlayer);
    }

    livePlayers.delete(socket.id);
    adminUpdatePlayerCount();
    logPlayerMessage(socket, "disconnected");
  });

  socket.on(EVENT_WORLD_CHANGE_BACKGROUND, (newBackgroundTexture: string) => {
    logPlayerMessage(socket, `changed background to ${newBackgroundTexture}`);
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
    logPlayerMessage(
      socket,
      `created new fitwick ${fitwick.name} at [${fitwick.x},${fitwick.y}]`
    );
    if (livePlayers.has(socket.id)) {
      const livePlayer = livePlayers.get(socket.id)!;
      livePlayer.user.stats.createdTotalObjects++;
      livePlayer.userModified = true;

      const updatePoints = (pointsEarned: number) => {
        // datePoints are [date, points collected on that date] pairs
        if (
          !livePlayer.user.datesPoints ||
          !livePlayer.user.datesPoints.length
        ) {
          livePlayer.user.datesPoints = [
            { date: getToday(), points: pointsEarned },
          ];
        } else {
          // by nature, datePoints are always sorted, so last element is most recent date
          // if it is today, no need to add a new element, just increment points
          const lastDatePoints =
            livePlayer.user.datesPoints[livePlayer.user.datesPoints.length - 1];
          if (isSameDay(getToday(), lastDatePoints.date)) {
            lastDatePoints.points += pointsEarned;
          } else {
            livePlayer.user.datesPoints.push({
              date: getToday(),
              points: pointsEarned,
            });
          }
        }
      };

      if (!livePlayer.user.createdFitwicks) {
        // the map consists of pairs of [fitwick name, times this fitwick has been placed]
        livePlayer.user.createdFitwicks = new Map<string, number>();
      }

      const fitwickCreateCount = livePlayer.user.createdFitwicks.get(
        fitwick.name
      );
      // whether it's 0 or undefined, the same applies (it should never be 0 though)
      if (!fitwickCreateCount) {
        livePlayer.user.createdFitwicks.set(fitwick.name, 1);
        updatePoints(10);

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
      } else {
        // the player has placed this fitwick before
        livePlayer.user.createdFitwicks.set(
          fitwick.name,
          fitwickCreateCount + 1
        );
        // a simple decay function -> 1-6 fitwicks give some points, 7-20 fitwicks give 1 point, 21+ give no points
        updatePoints(Math.round(10.0 / (1 + fitwickCreateCount)));
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
    logPlayerMessage(
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
    logPlayerMessage(
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
    logPlayerMessage(
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
