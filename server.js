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

/* ===== MODEL ===== */
const User = mongoose.model("User", {
  username: String,
  password: String,
  role: String
});

const Message = mongoose.model("Message", {
  username: String,
  msg: String
});

/* ===== AUTH ===== */
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  const exist = await User.findOne({ username });
  if (exist) return res.json({ error: "Létezik" });

  const role = username === "admin" ? "admin" : "user";

  await User.create({ username, password, role });

  res.json({ success: true });
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username, password });
  if (!user) return res.json({ error: "Hibás" });

  res.json({ success: true, user });
});

/* ===== CHAT ===== */
let users = {};

io.on("connection", (socket) => {

  socket.on("join", (user) => {
    users[socket.id] = user;
    socket.username = user.username;
    socket.role = user.role;

    io.emit("users", Object.values(users));
  });

  socket.on("message", async (msg) => {
    const data = {
      username: socket.username,
      msg
    };

    await Message.create(data);

    io.emit("message", data);
  });

  socket.on("disconnect", () => {
    delete users[socket.id];
    io.emit("users", Object.values(users));
  });

});

server.listen(3000);
