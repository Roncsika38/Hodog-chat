const socket = io();

let username = "";

function login() {
    const input = document.getElementById("username");

    if (!input.value.trim()) {
        alert("Adj meg egy felhasználónevet!");
        return;
    }

    username = input.value.trim();

    document.getElementById("chat").style.display = "block";
    input.style.display = "none";

    const btn = document.querySelector("button");
    if (btn) btn.style.display = "none";
}

function sendMessage() {
    const input = document.getElementById("message");

    if (!input.value.trim()) return;

    socket.emit("chat message", {
        username: username,
        message: input.value
    });

    input.value = "";
}

socket.on("chat message", (data) => {
    const messages = document.getElementById("messages");

    const div = document.createElement("div");
    div.innerHTML = "<b>" + data.username + ":</b> " + data.message;

    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
});
