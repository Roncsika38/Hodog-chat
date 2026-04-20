const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let users = [];

io.on("connection", (socket) => {

  socket.on("join", (username) => {
    socket.username = username;
    users.push(username);
    io.emit("users", users);
  });

  socket.on("message", (data) => {
    io.emit("message", data);
  });

  socket.on("disconnect", () => {
    users = users.filter(u => u !== socket.username);
    io.emit("users", users);
  });

});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
