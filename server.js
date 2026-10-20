const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const crypto = require("crypto");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

const users = new Map();

function sameSecret(a, b) {
  const x = Buffer.from(String(a || ""));
  const y = Buffer.from(String(b || ""));
  return x.length === y.length &&
    crypto.timingSafeEqual(x, y);
}

io.on("connection", (socket) => {
  socket.on("join", (name) => {
    name = String(name || "").trim().slice(0, 30);
    if (!name) return;

    socket.data.username = name;

    if (!users.has(name)) users.set(name, new Set());
    users.get(name).add(socket.id);
  });

  socket.on("chat message", (data) => {
    if (!socket.data.username) return;
    if (!data || typeof data.message !== "string") return;

    const message = data.message.trim().slice(0, 2000);
    if (!message) return;

    io.emit("chat message", {
      username: socket.data.username,
      message
    });
  });

  socket.on("owner:login", (password, callback) => {
    const secret = process.env.OWNER_PASSWORD;
    const ok = Boolean(secret) && sameSecret(password, secret);

    if (ok) socket.data.isOwner = true;

    if (typeof callback === "function") {
      callback({
        ok,
        error: !secret
          ? "A tulajdonosi jelszó nincs beállítva."
          : ok ? "" : "Hibás jelszó."
      });
    }
  });

  socket.on("kickUser", (name, callback) => {
    if (!socket.data.isOwner) {
      if (typeof callback === "function") {
        callback({ ok: false, error: "Csak a tulajdonos végezheti el ezt a műveletet." });
      }
      return;
    }

    name = String(name || "").trim();
    const ids = users.get(name);

    if (!ids || ids.size === 0) {
      if (typeof callback === "function") {
        callback({ ok: false, error: "A felhasználó nem csatlakozik." });
      }
      return;
    }

    for (const id of ids) {
      const target = io.sockets.sockets.get(id);
      if (target) {
        target.emit("kicked", "A tulajdonos eltávolított a chatből.");
        target.disconnect(true);
      }
    }

    users.delete(name);

    if (typeof callback === "function") {
      callback({ ok: true });
    }
  });

  socket.on("disconnect", () => {
    const name = socket.data.username;
    if (!name) return;

    const ids = users.get(name);
    if (ids) {
      ids.delete(socket.id);
      if (ids.size === 0) users.delete(name);
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Hodog Chat szerver fut:", PORT);
});
