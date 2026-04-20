const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

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
        let user = users[socket.id];

        io.emit("message", {
            username: user.name,
            role: user.role,
            msg: data.msg,
            time: new Date().toLocaleTimeString()
        });
    });

    socket.on("clear", () => {
        let user = users[socket.id];
        if (user.role === "admin") {
            io.emit("clear");
        }
    });

    socket.on("disconnect", () => {
        delete users[socket.id];
        io.emit("users", Object.values(users));
    });
});

http.listen(3000);
