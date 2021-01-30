#!/usr/bin/env node

/**
 * Setup environment variables
 */
import dotenv from "dotenv";
const node_env = process.env.NODE_ENV || "prod";
dotenv.config({ path: `.env.${node_env}` });

/**
 * Module dependencies.
 */
const debug = require("debug")("fitw-server:server");
import app from "./app";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import registerPlayerHandlers from "./playerHandler";

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || "8081");
app.set("port", port);

/**
 * Create HTTP server.
 */

const httpServer = createServer(app);

const io = new Server(httpServer, {
  serveClient: false,
  cors: {
    origin: process.env.DEBUG
      ? "http://localhost:3000"
      : "https://fitw.azurewebsites.net",
    methods: ["GET", "POST"],
  },
  // https://docs.microsoft.com/en-us/azure/app-service/faq-app-service-linux
  perMessageDeflate: false,
});
io.on("connection", (socket: Socket) => {
  registerPlayerHandlers(io, socket);
});

/**
 * Listen on provided port, on all network interfaces.
 */

httpServer.listen(port);
httpServer.on("error", onError);
httpServer.on("listening", onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val: string) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error: { syscall: string; code: any }) {
  if (error.syscall !== "listen") {
    throw error;
  }

  const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = httpServer.address();
  const bind = typeof addr === "string" ? "pipe " + addr : "port " + addr!.port;
  debug("Listening on " + bind);
}
