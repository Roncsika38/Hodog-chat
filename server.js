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

/* ================== MONGODB ================== */
mongoose.connect("mongodb+srv://roncsika635:12345678@cluster0.1t115j0.mongodb.net/chat")
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.log(err));

/* ================== MODEL ================== */
const User = mongoose.model("User", {
  username: String,
  password: String,
  role: String
});

const Message = mongoose.model("Message", {
  username: String,
  msg: String,
  time: String
});

/* ================== REGISTER ================== */
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  const role = username === "roncsika38" ? "admin" : "user";

  await User.create({ username, password, role });

  res.json({ success: true });
});

/* ================== LOGIN ================== */
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username, password });

  if (!user) return res.json({ error: "Hibás adatok" });

  res.json({ success: true, user });
});

/* ================== SOCKET ================== */
io.on("connection", (socket) => {

  socket.on("join", async (username) => {
    socket.username = username;

    const messages = await Message.find().limit(50);
    socket.emit("loadMessages", messages);
  });

  socket.on("message", async (msg) => {
    const data = {
      username: socket.username,
      msg,
      time: new Date().toLocaleTimeString()
    };

    await Message.create(data);
    io.emit("message", data);
  });

});

/* ================== SERVER ================== */
server.listen(3000, () => {
  console.log("🚀 Server fut a 3000 porton");
});
