const socket = io();

let username = "";

/* ===== BELÉPÉS ===== */
function join() {
  const input = document.getElementById("name");

  username = input.value.trim();

  if (!username) {
    alert("Írj be nevet!");
    return;
  }

  // UI váltás
  document.getElementById("login").style.display = "none";
  document.getElementById("chat").style.display = "flex";

  // csatlakozás
  socket.emit("join", { username });
}

/* ===== ÜZENET KÜLDÉS ===== */
function send() {
  const input = document.getElementById("msg");
  const text = input.value.trim();

  if (!text) return;

  socket.emit("message", text);

  input.value = "";
}

/* ===== ENTER KÜLDÉS ===== */
document.addEventListener("DOMContentLoaded", () => {
  const msgInput = document.getElementById("msg");

  if (msgInput) {
    msgInput.addEventListener("keypress", function(e) {
      if (e.key === "Enter") {
        send();
      }
    });
  }
});

/* ===== ÜZENET FOGADÁS ===== */
socket.on("message", (m) => {
  const box = document.getElementById("messages");

  const div = document.createElement("div");
  div.innerHTML = `<b>${m.username}:</b> ${m.msg}`;

  box.appendChild(div);

  // auto scroll
  box.scrollTop = box.scrollHeight;
});

/* ===== USER LISTA ===== */
socket.on("users", (list) => {
  const usersDiv = document.getElementById("users");

  usersDiv.innerHTML = "";

  list.forEach(u => {
    const div = document.createElement("div");
    div.textContent = u.username;
    usersDiv.appendChild(div);
  });
});
