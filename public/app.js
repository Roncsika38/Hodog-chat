const socket = io();

let username = "";

function join() {
  username = name.value;

  document.getElementById("login").style.display="none";
  document.getElementById("chat").style.display="flex";

  socket.emit("join", { username });
}

function send() {
  socket.emit("message", msg.value);
  msg.value="";
}

socket.on("message", (m)=>{
  messages.innerHTML += `<div>${m.username}: ${m.msg}</div>`;
});

socket.on("users", (list)=>{
  users.innerHTML="";
  list.forEach(u=>{
    users.innerHTML += `<div>${u.username}</div>`;
  });
});
