const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let users = {};
let messages = [];

// ADMIN név
const ADMIN_NAME = "admin";

io.on("connection", (socket) => {

    socket.on("join", (username) => {
        socket.username = username;

        users[socket.id] = username;

        // küldjük az eddigi chatet
        socket.emit("chatHistory", messages);

        io.emit("users", Object.values(users));
    });

    socket.on("typing", () => {
        socket.broadcast.emit("typing", socket.username);
    });

    socket.on("message", (data) => {

        // ADMIN COMMANDS
        if (socket.username === ADMIN_NAME) {

            // CLEAR
            if (data.msg === "/clear") {
                messages = [];
                io.emit("clearChat");
                return;
            }

            // KICK
            if (data.msg.startsWith("/kick ")) {
                const target = data.msg.split(" ")[1];

                for (let id in users) {
                    if (users[id] === target) {
                        io.to(id).emit("kicked");
                        delete users[id];
                    }
                }

                io.emit("users", Object.values(users));
                return;
            }
        }

        const msgData = {
            username: socket.username,
            msg: data.msg,
            time: new Date().toLocaleTimeString()
        };

        messages.push(msgData);

        // max 100 üzenet
        if (messages.length > 100) {
            messages.shift();
        }

        io.emit("message", msgData);
    });

    socket.on("disconnect", () => {
        delete users[socket.id];
        io.emit("users", Object.values(users));
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Server fut: " + PORT));
