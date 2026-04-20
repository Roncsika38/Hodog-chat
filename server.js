let users = {};

io.on("connection", (socket) => {

  socket.on("join", (username) => {
    socket.username = username;

    users[socket.id] = {
      name: username,
      role: username === "roncsika38" ? "admin" : "user"
    };

    io.emit("users", Object.values(users));
  });

  socket.on("message", (data) => {
    const user = users[socket.id];

    io.emit("message", {
      username: user.name,
      role: user.role,
      msg: data.msg,
      time: new Date().toLocaleTimeString()
    });
  });

  socket.on("disconnect", () => {
    delete users[socket.id];
    io.emit("users", Object.values(users));
  });

});
