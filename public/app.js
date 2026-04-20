const socket = io();
let currentUser = null;
let selectedUser = null;

function login() {
  const username = usernameInput.value;
  const password = passwordInput.value;

  fetch("/login", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ username, password })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      currentUser = data.user;
      startChat();
    } else {
      alert(data.error);
    }
  });
}

function register() {
  fetch("/register", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      username: usernameInput.value,
      password: passwordInput.value
    })
  }).then(() => alert("Regisztrálva!"));
}

function startChat() {
  auth.style.display = "none";
  chat.style.display = "flex";

  socket.emit("join", currentUser.username);
}

function send() {
  const msg = msgInput.value;

  socket.emit("message", {
    msg,
    to: selectedUser
  });

  msgInput.value = "";
}

socket.on("message", (data) => {
  const div = document.createElement("div");

  if (data.to !== "all" && data.to !== currentUser.username) return;

  let admin = data.username === "Predator" ? "👑" : "";

  div.innerHTML = `${admin} <b>${data.username}</b>: ${data.msg}`;
  messages.appendChild(div);
});

socket.on("users", (users) => {
  usersList.innerHTML = "";

  users.forEach(u => {
    const li = document.createElement("li");
    li.innerText = u;

    li.onclick = () => {
      selectedUser = u;
      alert("Privát chat: " + u);
    };

    if (currentUser.role === "admin") {
      const btn = document.createElement("button");
      btn.innerText = "🚫";
      btn.onclick = () => socket.emit("ban", u);
      li.appendChild(btn);
    }

    usersList.appendChild(li);
  });
});

socket.on("banned", () => {
  alert("Ki lettél tiltva!");
  location.reload();
});
