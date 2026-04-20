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

/* ======================
   🔥 MONGODB CONNECT
====================== */
mongoose.connect("mongodb+srv://roncsika635:Csicso1987%40%40%40@cluster0.1t1l5jo.mongodb.net/chat")
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.log(err));

/* ======================
   👤 USER MODEL
====================== */
const User = mongoose.model("User", {
  username: String,
  password: String,
  role: String,
  avatar: String
});

/* ======================
   💬 MESSAGE MODEL
====================== */
const Message = mongoose.model("Message", {
  username: String,
  text: String,
  time: String
});

/* ======================
   🔐 REGISTER
====================== */
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  const exists = await User.findOne({ username });
  if (exists) return res.json({ error: "Már létezik!" });

  const role = username === "Predator" ? "admin" : "user";

  await User.create({ username, password, role });

  res.json({ success: true });
});

/* ======================
   🔑 LOGIN
====================== */
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username, password });
  if (!user) return res.json({ error: "Hibás adat!" });

  res.json({ success: true, user });
});

/* ======================
   🔌 SOCKET CHAT
====================== */
io.on("connection", (socket) => {

  socket.on("join", async (username) => {
    socket.username = username;

    const messages = await Message.find().limit(50);
    socket.emit("loadMessages", messages);
  });

  socket.on("message", async (msg) => {
    const data = {
      username: socket.username,
      text: msg,
      time: new Date().toLocaleTimeString()
    };

    await Message.create(data);
    io.emit("message", data);
  });

});

/* ======================
   🚀 SERVER
====================== */
server.listen(process.env.PORT || 3000, () => {
  console.log("🔥 Server fut");
});
