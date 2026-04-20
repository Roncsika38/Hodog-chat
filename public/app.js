const socket = io();
let currentUser = null;

function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  fetch("/login", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ username, password })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      startChat(username);
    } else {
      alert("Hibás adat");
    }
  });
}

function register() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  fetch("/register", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ username, password })
  })
  .then(res => res.json())
  .then(data => {
    alert("Regisztrálva!");
  });
}

function startChat(username) {
  currentUser = username;

  document.getElementById("auth").style.display = "none";
  document.getElementById("chat").style.display = "flex";

  socket.emit("join", username);
}

function send() {
  const msg = document.getElementById("msg").value;
  socket.emit("message", msg);
  document.getElementById("msg").value = "";
}

socket.on("message", (data) => {
  const div = document.createElement("div");
  div.className = "message";

  if (data.username === "Predator") {
    div.innerHTML = "👑 <b>" + data.username + "</b>: " + data.msg;
  } else {
    div.innerHTML = "<b>" + data.username + "</b>: " + data.msg;
  }

  document.getElementById("messages").appendChild(div);
});
