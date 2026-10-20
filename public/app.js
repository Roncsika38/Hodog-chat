const socket = io();

let username = "";

function login() {
  const input = document.getElementById("username");
  const name = input.value.trim();

  if (!name) {
    alert("Adj meg egy felhasználónevet!");
    return;
  }

  username = name;

  document.getElementById("login").style.display = "none";
  document.getElementById("chat").style.display = "flex";
  document.getElementById("message").focus();
}

function sendMessage() {
  const input = document.getElementById("message");
  const message = input.value.trim();

  if (!message || !username) return;

  socket.emit("chat message", {
    username: username,
    message: message
  });

  input.value = "";
  input.focus();
}

document.getElementById("message-form").addEventListener("submit", function (event) {
  event.preventDefault();
  sendMessage();
});

socket.on("chat message", function (data) {
  const messages = document.getElementById("messages");

  const row = document.createElement("div");
  row.className = "message";

  const avatar = document.createElement("div");
  avatar.className = "message-avatar";
  avatar.textContent = (data.username || "?").charAt(0).toUpperCase();
  avatar.setAttribute("aria-label", "Profilkép helye");

  const content = document.createElement("div");
  content.className = "message-content";

  const name = document.createElement("span");
  name.className = "message-username";
  name.textContent = data.username || "Ismeretlen";

  const text = document.createElement("div");
  text.className = "message-text";
  text.textContent = data.message || "";

  content.appendChild(name);
  content.appendChild(text);
  row.appendChild(avatar);
  row.appendChild(content);
  messages.appendChild(row);

  messages.scrollTop = messages.scrollHeight;
});
