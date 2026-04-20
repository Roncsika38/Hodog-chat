const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const mongoose = require("mongoose");
mongodb+srv://roncsika635:<db_123456>@cluster0.1t1l5j0.mongodb.net/?appName=Cluster0

.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.log(err));
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// 🔥 IDE ÍRD BE A SAJÁT JELSZAVAD
mongoose.connect("mongodb+srv://roncsika635:JELSZOIDE@cluster0.1tl15j0.mongodb.net/chat")
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.log(err));

// USER
const User = mongoose.model("User", {
  username: String,
  password: String,
  role: String
});

// MESSAGE
const Message = mongoose.model("Message", {
  username: String,
  msg: String,
  time: String
});

// REGISTER
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  const exists = await User.findOne({ username });
  if (exists) return res.json({ error: "Van már ilyen user" });

  const role = username === "roncsika38" ? "admin" : "user";

  await User.create({ username, password, role });
  res.json({ success: true });
});

// LOGIN
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username, password });
  if (!user) return res.json({ error: "Hibás adatok" });

  res.json({ success: true, user });
});

// SOCKET
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

// START
server.listen(3000, () => console.log("🚀 Server running"));
