const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("join", (username) => {
    socket.username = username;
    io.emit("message", `${username} csatlakozott`);
  });

  socket.on("chatMessage", (msg) => {
    io.emit("message", `${socket.username}: ${msg}`);
  });

  socket.on("disconnect", () => {
    if (socket.username) {
      io.emit("message", `${socket.username} kilépett`);
    }
  });
});

server.listen(3000, () => {
  console.log("Server fut: http://localhost:3000");
});
