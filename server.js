const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const ADMIN_PASSWORD = "1234";

app.use(express.static(__dirname));

io.on("connection", (socket) => {

  socket.on("join", ({ username, password }) => {
    socket.username = username || "Anon";
    socket.isAdmin = password === ADMIN_PASSWORD;

    socket.emit("isAdmin", socket.isAdmin);

    io.emit("message", {
      user: "SYSTEM",
      text: `${socket.username} csatlakozott`
    });
  });

  socket.on("message", (text) => {
    io.emit("message", {
      user: socket.username,
      text
    });
  });

  socket.on("kick", (id) => {
    if (!socket.isAdmin) return;

    const target = io.sockets.sockets.get(id);
    if (target) {
      io.emit("message", {
        user: "ADMIN",
        text: `${target.username} ki lett rúgva`
      });
      target.disconnect();
    }
  });

  socket.on("disconnect", () => {
    if (socket.username) {
      io.emit("message", {
        user: "SYSTEM",
        text: `${socket.username} kilépett`
      });
    }
  });

});

server.listen(3000, () => {
  console.log("Server fut: http://localhost:3000");
});
