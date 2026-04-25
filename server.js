const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(bodyParser.json());

let users = [];
let rooms = ["general"];

// ===== LOGIN / REGISTER =====
app.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (users.find(u => u.username === username)) {
    return res.json({ success: false, msg: "User exists" });
  }

  const isAdmin = username === "admin";

  users.push({ username, password, isAdmin });
  res.json({ success: true });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    u => u.username === username && u.password === password
  );

  if (!user) return res.json({ success: false });

  res.json({ success: true, isAdmin: user.isAdmin });
});

// ===== ADMIN: CREATE ROOM =====
app.post("/create-room", (req, res) => {
  const { room, username } = req.body;

  const user = users.find(u => u.username === username);

  if (!user || !user.isAdmin) {
    return res.json({ success: false, msg: "No permission" });
  }

  if (!rooms.includes(room)) {
    rooms.push(room);
  }

  res.json({ success: true, rooms });
});

// ===== GET ROOMS =====
app.get("/rooms", (req, res) => {
  res.json(rooms);
});

// ===== SOCKET CHAT =====
io.on("connection", socket => {
  socket.on("join", room => {
    socket.join(room);
  });

  socket.on("message", ({ room, msg, user }) => {
    io.to(room).emit("message", { user, msg });
  });
});

server.listen(3000, () => {
  console.log("Server fut: http://localhost:3000");
});
