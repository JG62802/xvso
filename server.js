// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let waitingPlayer = null;

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  if (waitingPlayer) {
    const room = `room-${waitingPlayer.id}-${socket.id}`;
    socket.join(room);
    waitingPlayer.join(room);

    io.to(room).emit("startGame", {
      room,
      symbol: "O",
      opponent: waitingPlayer.id,
    });

    waitingPlayer.emit("startGame", {
      room,
      symbol: "X",
      opponent: socket.id,
    });

    waitingPlayer = null;
  } else {
    waitingPlayer = socket;
    socket.emit("waiting");
  }

  socket.on("makeMove", ({ room, x, y, symbol }) => {
    socket.to(room).emit("opponentMove", { x, y, symbol });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    if (waitingPlayer === socket) waitingPlayer = null;
  });
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
