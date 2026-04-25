const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let users = {};

io.on("connection", (socket) => {

  socket.on("join", (username) => {
    socket.username = username;
    users[socket.id] = username;

    io.emit("message", {
      user: "SYSTEM",
      text: username + " csatlakozott"
    });

    io.emit("userList", Object.values(users));
  });

  socket.on("chatMessage", (msg) => {
    if (socket.username) {
      io.emit("message", {
        user: socket.username,
        text: msg
      });
    }
  });

  socket.on("kickUser", (name) => {
    for (let id in users) {
      if (users[id] === name) {
        io.sockets.sockets.get(id)?.disconnect();
      }
    }
  });

  socket.on("disconnect", () => {
    if (socket.username) {
      delete users[socket.id];

      io.emit("message", {
        user: "SYSTEM",
        text: socket.username + " kilépett"
      });

      io.emit("userList", Object.values(users));
    }
  });

});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Server fut:", PORT));
