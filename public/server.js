const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("message", (msg) => {
    io.emit("message", msg);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("🔥 Server fut a porton: " + PORT);
});
