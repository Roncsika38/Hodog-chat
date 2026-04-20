const socket = io();
let user;

function login() {
  fetch("/login", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({
      username: user.value,
      password: pass.value
    })
  })
  .then(r=>r.json())
  .then(data=>{
    if(data.error) return alert(data.error);

    user = data;
    document.getElementById("login").style.display="none";
    document.getElementById("chat").style.display="flex";

    socket.emit("join", user);
  });
}

function register() {
  fetch("/register", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({
      username: user.value,
      password: pass.value
    })
  });
}

function send() {
  socket.emit("message", input.value);
  input.value="";
}

socket.on("message", (msg)=>{
  const li = document.createElement("li");
  li.innerHTML = msg.username + ": " + msg.text + 
    ` <button onclick="like('${msg._id}')">👍 ${msg.likes}</button>`;
  messages.appendChild(li);
});

function like(id){
  socket.emit("like", id);
}
