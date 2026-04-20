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
   🔥 MONGODB CONNECT
======================= */
mongoose.connect("IDE_IRD_A_MONGODB_LINKED")
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

/* =======================
   🔥 DEFAULT ADMIN
======================= */
async function createAdmin() {
  const admin = await User.findOne({ username: "Predator" });

  if (!admin) {
    await User.create({
      username: "Predator",
      password: "Csicso1987@@@",
      role: "admin"
    });

    console.log("🔥 Admin kész: Predator / Csicso1987@@@");
  }
}
createAdmin();

/* =======================
   🔥 AUTH
======================= */

// REGISTER
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  const exists = await User.findOne({ username });
  if (exists) return res.status(400).send("User exists");

  const user = await User.create({
    username,
    password,
    role: "user"
  });

  res.send(user);
});

// LOGIN
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username, password });
  if (!user) return res.status(401).send("Hibás adat");

  res.send(user);
});

/* =======================
   🔥 ADMIN PANEL API
======================= */

// összes user
app.get("/users", async (req, res) => {
  const users = await User.find();
  res.send(users);
});

// szerep módosítás
app.post("/set-role", async (req, res) => {
  const { username, role } = req.body;

  await User.updateOne({ username }, { role });
  res.send("OK");
});

// törlés
app.post("/delete-user", async (req, res) => {
  const { username } = req.body;

  await User.deleteOne({ username });
  res.send("Deleted");
});

/* =======================
   🔥 CHAT (socket)
======================= */
io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("chat message", (msg) => {
    io.emit("chat message", msg);
  });
});

/* =======================
   🔥 SERVER
======================= */
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("🔥 Server fut: " + PORT);
});
