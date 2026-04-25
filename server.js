const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.json());
app.use(cors());

// ===== CONFIG =====
const JWT_SECRET = "secret123";

// ===== DB =====
mongoose.connect("mongodb://127.0.0.1:27017/chat");

// ===== MODELS =====
const User = mongoose.model("User", {
  username: String,
  password: String,
  isAdmin: Boolean
});

const Room = mongoose.model("Room", {
  name: String
});

// ===== AUTH MIDDLEWARE =====
function auth(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) return res.sendStatus(401);

  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.user = data;
    next();
  } catch {
    res.sendStatus(403);
  }
}

// ===== REGISTER =====
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  const exists = await User.findOne({ username });
  if (exists) return res.json({ success: false });

  const hash = await bcrypt.hash(password, 10);
  const isAdmin = username === "admin";

  await User.create({ username, password: hash, isAdmin });

  res.json({ success: true });
});

// ===== LOGIN =====
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) return res.json({ success: false });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.json({ success: false });

  const token = jwt.sign(
    { username: user.username, isAdmin: user.isAdmin },
    JWT_SECRET
  );

  res.json({ success: true, token, isAdmin: user.isAdmin });
});

// ===== ROOMS =====
app.get("/rooms", async (req, res) => {
  const rooms = await Room.find();
  res.json(rooms);
});

// ===== CREATE ROOM (ADMIN) =====
app.post("/create-room", auth, async (req, res) => {
  if (!req.user.isAdmin) {
    return res.sendStatus(403);
  }

  const { name } = req.body;

  const exists = await Room.findOne({ name });
  if (!exists) {
    await Room.create({ name });
  }

  res.json({ success: true });
});

// ===== SOCKET =====
io.on("connection", socket => {
  socket.on("join", room => {
    socket.join(room);
  });

  socket.on("message", ({ room, msg, user }) => {
    io.to(room).emit("message", { user, msg });
  });
});

server.listen(3000, () => {
  console.log("Fut: http://localhost:3000");
});
