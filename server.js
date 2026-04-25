const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let users = {};
let rooms = {};

io.on("connection", (socket) => {

  socket.on("join", ({ username, room, avatar }) => {
    socket.username = username;
    socket.room = room;
    socket.avatar = avatar;

    socket.join(room);

    users[socket.id] = {
      name: username,
      room,
      avatar
    };

    if (!rooms[room]) rooms[room] = [];

    io.to(room).emit("message", {
      user: "SYSTEM",
      text: username + " belépett a szobába"
    });

    updateUsers(room);
  });

  socket.on("chatMessage", (msg) => {
    if (!socket.username) return;

    io.to(socket.room).emit("message", {
      user: socket.username,
      text: msg,
      avatar: socket.avatar
    });
  });

  socket.on("disconnect", () => {
    const user = users[socket.id];
    if (!user) return;

    io.to(user.room).emit("message", {
      user: "SYSTEM",
      text: user.name + " kilépett"
    });

    delete users[socket.id];
    updateUsers(user.room);
  });

  function updateUsers(room) {
    const list = Object.values(users).filter(u => u.room === room);
    io.to(room).emit("userList", list);
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Fut:", PORT));
