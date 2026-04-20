const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

mongoose.connect("IDE_IRD_A_MONGO_LINKED")
.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err));

// ===== MODELS =====
const User = mongoose.model("User", {
  username: String,
  password: String,
  role: String,
  avatar: String,
  banned: { type: Boolean, default: false }
});

const Message = mongoose.model("Message", {
  username: String,
  msg: String,
  to: String,
  time: String
});

// ===== AUTH =====
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  const role = username === "Predator" ? "admin" : "user";

  await User.create({
    username,
    password,
    role,
    avatar: "",
    banned: false
  });

  res.json({ success: true });
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username, password });

  if (!user) return res.json({ error: "Hibás adat" });
  if (user.banned) return res.json({ error: "Tiltva vagy!" });

  res.json({ success: true, user });
});

// ===== SOCKET =====
let onlineUsers = {};

io.on("connection", (socket) => {

  socket.on("join", async (username) => {
    socket.username = username;
    onlineUsers[username] = socket.id;

    io.emit("users", Object.keys(onlineUsers));

    const messages = await Message.find().limit(50);
    socket.emit("loadMessages", messages);
  });

  socket.on("message", async (data) => {
    const msgData = {
      username: socket.username,
      msg: data.msg,
      to: data.to || "all",
      time: new Date().toLocaleTimeString()
    };

    await Message.create(msgData);

    if (data.to && onlineUsers[data.to]) {
      io.to(onlineUsers[data.to]).emit("message", msgData);
    } else {
      io.emit("message", msgData);
    }
  });

  socket.on("ban", async (username) => {
    await User.updateOne({ username }, { banned: true });
    if (onlineUsers[username]) {
      io.to(onlineUsers[username]).emit("banned");
    }
  });

  socket.on("disconnect", () => {
    delete onlineUsers[socket.username];
    io.emit("users", Object.keys(onlineUsers));
  });

});

server.listen(3000, () => console.log("Server megy 🚀"));
