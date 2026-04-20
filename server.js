const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let users = {};
let admins = ["roncsika38"]; // 👑 ide írd a neved

io.on("connection", (socket) => {

    socket.on("join", (username) => {
        socket.username = username;

        users[socket.id] = {
            name: username,
            admin: admins.includes(username)
        };

        io.emit("message", {
            username: "🔔",
            msg: username + " belépett"
        });

        io.emit("users", Object.values(users));
    });

    socket.on("message", (data) => {
        io.emit("message", data);
    });

    socket.on("disconnect", () => {
        const user = users[socket.id];

        if (user) {
            io.emit("message", {
                username: "🔔",
                msg: user.name + " kilépett"
            });
        }

        delete users[socket.id];
        io.emit("users", Object.values(users));
    });

});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log("Server fut: " + PORT);
});
