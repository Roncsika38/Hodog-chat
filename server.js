const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

io.on("connection", (socket) => {

  socket.on("join", (name) => {
    socket.username = name;
  });

  socket.on("chat", (msg) => {
    io.emit("chat", {
      user: socket.username,
      message: msg
    });
  });

});

const PORT = process.env.PORT || 3000;
http.listen(PORT);
