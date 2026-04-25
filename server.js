const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // belépés szobába
  socket.on("joinRoom", (room) => {
    socket.join(room);
    socket.room = room;
    console.log(`${socket.id} joined ${room}`);
  });

  // üzenet küldés
  socket.on("message", ({ room, text }) => {
    io.to(room).emit("message", {
      text,
      id: socket.id,
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
