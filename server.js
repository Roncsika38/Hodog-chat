const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));
app.use(express.json());

mongoose.connect("mongodb+srv://roncsika635:12345678@cluster0.1t115j0.mongodb.net/chat");

const Message = mongoose.model("Message", {
  username: String,
  msg: String
});

let users = {};

io.on("connection", (socket) => {

  socket.on("join", (user) => {
    users[socket.id] = user;
    io.emit("users", Object.values(users));
  });

  socket.on("message", async (msg) => {
    const user = users[socket.id];

    const data = { username: user.username, msg };

    await Message.create(data);

    io.emit("message", data);
  });

  socket.on("disconnect", () => {
    delete users[socket.id];
    io.emit("users", Object.values(users));
  });

});

server.listen(3000);
