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

// 👉 MONGO (IDE A SAJÁTOD)
mongoose.connect("mongodb+srv://roncsika635:Csicso1987%40%40%40@cluster0.1t1l5jo.mongodb.net/chat");

console.log("Mongo connected");

// MODEL
const User = mongoose.model("User", {
  username: String,
  password: String,
  role: String,
  avatar: String
});

const Message = mongoose.model("Message", {
  username: String,
  text: String,
  likes: { type: Number, default: 0 }
});

// 👉 FŐ ADMIN (AUTO)
async function createAdmin() {
  const exists = await User.findOne({ username: "Zoltan" });
  if (!exists) {
    await User.create({
      username: "Zoltan",
      password: "1234",
      role: "owner"
    });
    console.log("Admin created");
  }
}
createAdmin();

// REGISTER
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  const exists = await User.findOne({ username });
  if (exists) return res.json({ error: "Létezik" });

  await User.create({
    username,
    password,
    role: "user"
  });

  res.json({ success: true });
});

// LOGIN
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username, password });
  if (!user) return res.json({ error: "Hibás adat" });

  res.json(user);
});

// SOCKET
io.on("connection", (socket) => {
  socket.on("join", async (user) => {
    socket.user = user;

    const messages = await Message.find().limit(50);
    socket.emit("messages", messages);
  });

  socket.on("message", async (msg) => {
    const data = {
      username: socket.user.username,
      text: msg
    };

    const saved = await Message.create(data);
    io.emit("message", saved);
  });

  socket.on("like", async (id) => {
    const msg = await Message.findById(id);
    msg.likes++;
    await msg.save();

    io.emit("update", msg);
  });
});

server.listen(process.env.PORT || 3000, () => {
  console.log("Server fut");
});
