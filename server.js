const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));
app.use(express.json());

/* ===== MONGODB ===== */
mongoose.connect("mongodb+srv://chatuser:12345678@cluster0.1t115j0.mongodb.net/chat")
.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err));

/* ===== MODELS ===== */
const User = mongoose.model("User", {
  username: String,
  password: String,
  role: String
});

const Message = mongoose.model("Message", {
  username: String,
  msg: String
});

/* ===== AUTO USER ===== */
async function createDefaultUser() {
  const exist = await User.findOne({ username: "Predator" });

  if (!exist) {
    await User.create({
      username: "Predator",
      password: "1234",
      role: "admin"
    });
    console.log("Predator user created");
  }
}

createDefaultUser();

/* ===== AUTH ===== */
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username, password });

  if (!user) return res.json({ error: "Hibás adatok" });

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

server.listen(3000, () => console.log("Server running"));
