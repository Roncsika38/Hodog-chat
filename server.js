const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// 🔥 static fájlok (public mappa)
app.use(express.static(path.join(__dirname, "public")));

// 🔥 amikor valaki csatlakozik
io.on("connection", (socket) => {
  console.log("Felhasználó csatlakozott");

  // üzenet fogadás
  socket.on("chat message", (msg) => {
    io.emit("chat message", msg); // mindenki megkapja
  });

  socket.on("disconnect", () => {
    console.log("Felhasználó kilépett");
  });
});

// 🔥 szerver indítás
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Server fut: " + PORT);
});
