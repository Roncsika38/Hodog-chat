const socket = io();

const messages = document.getElementById("messages");
const form = document.getElementById("form");
const input = document.getElementById("input");

let user = JSON.parse(localStorage.getItem("user"));

// küldés
form.addEventListener("submit", (e) => {
  e.preventDefault();

  socket.emit("chat message", {
    username: user.username,
    text: input.value
  });

  input.value = "";
});

// megjelenítés
socket.on("chat message", (msg) => {
  const li = document.createElement("li");

  li.innerHTML = `
    <b>${msg.username}</b>: ${msg.text}
    <button onclick="like('${msg._id}')">👍 ${msg.likes}</button>
  `;

  li.id = msg._id;
  messages.appendChild(li);
});

// like frissítés
socket.on("update likes", (msg) => {
  const li = document.getElementById(msg._id);
  if (li) {
    li.innerHTML = `
      <b>${msg.username}</b>: ${msg.text}
      <button onclick="like('${msg._id}')">👍 ${msg.likes}</button>
    `;
  }
});

function like(id) {
  socket.emit("like", id);
}
