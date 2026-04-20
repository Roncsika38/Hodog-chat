const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let users = {};
let messages = [];
let banned = [];

const ADMINS = ["roncsika38"];

io.on("connection", (socket) => {

    socket.on("join", (username) => {

        if (banned.includes(username)) {
            socket.emit("banned");
            return;
        }

        socket.username = username;
        users[socket.id] = username;

        socket.emit("chatHistory", messages);
        io.emit("users", Object.values(users));
    });

    socket.on("message", (data) => {

        if (ADMINS.includes(socket.username)) {

            if (data.msg === "/clear") {
                messages = [];
                io.emit("clearChat");
                return;
            }

            if (data.msg.startsWith("/kick ")) {
                let target = data.msg.split(" ")[1];

                for (let id in users) {
                    if (users[id] === target) {
                        io.to(id).emit("kicked");
                        delete users[id];
                    }
                }

                io.emit("users", Object.values(users));
                return;
            }

            if (data.msg.startsWith("/ban ")) {
                let target = data.msg.split(" ")[1];
                banned.push(target);

                for (let id in users) {
                    if (users[id] === target) {
                        io.to(id).emit("banned");
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
        if (messages.length > 100) messages.shift();

        io.emit("message", msgData);
    });

    socket.on("disconnect", () => {
        delete users[socket.id];
        io.emit("users", Object.values(users));
    });
});

server.listen(process.env.PORT || 3000);
