const socket = io();

let currentUser = null;
let selectedUser = null;

function login() {
  fetch("/login", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      username: username.value,
      password: password.value
    })
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
      username: username.value,
      password: password.value
    })
  }).then(() => alert("Regisztrálva!"));
}

function startChat() {
  auth.style.display = "none";
  chat.style.display = "flex";

  socket.emit("join", currentUser.username);
}

function send() {
  socket.emit("message", {
    msg: msgInput.value,
    to: selectedUser
  });

  msgInput.value = "";
}

/* ÜZENETEK */
socket.on("message", (data) => {
  const div = document.createElement("div");
  div.className = "message";

  let icon = "";

  if (data.username === "Predator") icon = "👑";
  else if (data.username === currentUser.username) icon = "🟢";

  div.innerHTML = `${icon} <b>${data.username}</b>: ${data.msg}`;

  messages.appendChild(div);
});

/* USER LIST */
socket.on("users", (users) => {
  usersList.innerHTML = "";

  users.forEach(u => {
    const li = document.createElement("li");

    li.innerHTML = `<span>${u}</span>`;

    li.onclick = () => {
      selectedUser = u;
    };

    // OWNER PANEL
    if (currentUser.role === "owner") {
      const adminBtn = document.createElement("button");
      adminBtn.innerText = "👑";
      adminBtn.onclick = (e) => {
        e.stopPropagation();
        setRole(u, "admin");
      };

      const modBtn = document.createElement("button");
      modBtn.innerText = "🛡";
      modBtn.onclick = (e) => {
        e.stopPropagation();
        setRole(u, "mod");
      };

      const banBtn = document.createElement("button");
      banBtn.innerText = "🚫";
      banBtn.onclick = (e) => {
        e.stopPropagation();
        socket.emit("ban", u);
      };

      li.appendChild(adminBtn);
      li.appendChild(modBtn);
      li.appendChild(banBtn);
    }

    usersList.appendChild(li);
  });
});

function setRole(username, role) {
  socket.emit("setRole", { username, role });
  alert(username + " -> " + role);
}

socket.on("banned", () => {
  alert("Ki lettél tiltva!");
  location.reload();
});
