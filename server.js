const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let bannedUsers = [];

io.on("connection", (socket) => {
  console.log("user connected");

  socket.on("join", (username) => {
    if (bannedUsers.includes(username)) {
      socket.emit("banned");
      return;
    }

    socket.username = username;
    io.emit("chat message", `${username} csatlakozott`);
  });

  socket.on("chat message", (msg) => {
    io.emit("chat message", {
      user: socket.username || "Ismeretlen",
      text: msg,
      id: Date.now()
    });
  });

  socket.on("delete message", (id) => {
    io.emit("delete message", id);
  });

  socket.on("ban user", (username) => {
    bannedUsers.push(username);
    io.emit("chat message", `${username} kitiltva`);
  });
});

// 🔥 EZ A FONTOS RÉSZ (Render fix)
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Server fut a porton:", PORT);
});
server.listen(3000, () => {
  console.log("Server fut a 3000-es porton");
});
