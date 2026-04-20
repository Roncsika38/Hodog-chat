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

/* =======================
   🔥 MONGODB
======================= */
mongoose.connect("IDE_IRD_A_MONGO_LINKED")
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.log(err));

/* =======================
   🔥 MODEL
======================= */
const User = mongoose.model("User", {
  username: String,
  password: String,
  role: String
});

const Message = mongoose.model("Message", {
  username: String,
  text: String,
  likes: { type: Number, default: 0 }
});

/* =======================
   🔥 ADMIN
======================= */
async function createAdmin() {
  const admin = await User.findOne({ username: "Predator" });

  if (!admin) {
    await User.create({
      username: "Predator",
      password: "Csicso1987@@@",
      role: "admin"
    });

    console.log("🔥 Admin kész");
  }
}
createAdmin();

/* =======================
   🔥 AUTH
======================= */
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  const exists = await User.findOne({ username });
  if (exists) return res.status(400).send("Exists");

  const user = await User.create({
    username,
    password,
    role: "user"
  });

  res.send(user);
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username, password });
  if (!user) return res.status(401).send("Hiba");

  res.send(user);
});

/* =======================
   🔥 ADMIN API
======================= */
app.get("/users", async (req, res) => {
  const users = await User.find();
  res.send(users);
});

/* =======================
   🔥 SOCKET CHAT + LIKE
======================= */
io.on("connection", (socket) => {

  socket.on("chat message", async (msg) => {
    const message = await Message.create(msg);
    io.emit("chat message", message);
  });

  socket.on("like", async (id) => {
    const msg = await Message.findById(id);
    if (!msg) return;

    msg.likes++;
    await msg.save();

    io.emit("update likes", msg);
  });

});

/* =======================
   🔥 SERVER
======================= */
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("🔥 Fut: " + PORT);
});
