const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// fontos!
app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("join", (username) => {
    socket.username = username;
    io.emit("message", username + " csatlakozott");
  });

  socket.on("chatMessage", (msg) => {
    if (socket.username) {
      io.emit("message", socket.username + ": " + msg);
    }
  });

  socket.on("disconnect", () => {
    if (socket.username) {
      io.emit("message", socket.username + " kilépett");
    }
  });
});

// 🔥 EZ A LÉNYEG (Render kompatibilis)
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Server fut: " + PORT);
});
