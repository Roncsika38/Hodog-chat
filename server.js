const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// 🔥 FONTOS: Render port
const PORT = process.env.PORT || 3000;

const ADMIN_PASSWORD = "1234";

// ✅ STATIC MAPPa javítva
app.use(express.static(path.join(__dirname, "public")));

// ✅ FŐOLDAL FIX (Cannot GET / megoldva)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

io.on("connection", (socket) => {

  socket.on("join", ({ username, password }) => {
    socket.username = username || "Anon";
    socket.isAdmin = password === ADMIN_PASSWORD;

    socket.emit("isAdmin", socket.isAdmin);

    io.emit("message", {
      user: "SYSTEM",
      text: `${socket.username} csatlakozott`
    });
  });

  socket.on("message", (text) => {
    io.emit("message", {
      user: socket.username,
      text
    });
  });

  socket.on("kick", (id) => {
    if (!socket.isAdmin) return;

    const target = io.sockets.sockets.get(id);
    if (target) {
      io.emit("message", {
        user: "ADMIN",
        text: `${target.username} ki lett rúgva`
      });
      target.disconnect();
    }
  });

  socket.on("disconnect", () => {
    if (socket.username) {
      io.emit("message", {
        user: "SYSTEM",
        text: `${socket.username} kilépett`
      });
    }
  });

});

// ✅ Render kompatibilis indítás
server.listen(PORT, () => {
  console.log("Server fut a porton:", PORT);
});
