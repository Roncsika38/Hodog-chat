const socket = io();

let username = "";

function login() {
  const user = document.getElementById("user").value;
  const pass = document.getElementById("pass").value;

  fetch("/login", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({username:user,password:pass})
  })
  .then(res=>res.json())
  .then(data=>{
    if(data.success){
      username = user;
      startChat();
    } else alert(data.error);
  });
}

function register(){
  const user = document.getElementById("user").value;
  const pass = document.getElementById("pass").value;

  fetch("/register", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({username:user,password:pass})
  })
  .then(res=>res.json())
  .then(data=>{
    alert(data.success ? "Siker!" : data.error);
  });
}

function startChat(){
  document.getElementById("login").style.display="none";
  document.getElementById("chat").style.display="flex";
  document.getElementById("username").innerText=username;

  socket.emit("join", username);
}

function send(){
  const msg = document.getElementById("msg").value;
  socket.emit("message", msg);
  document.getElementById("msg").value="";
}

socket.on("message", (data)=>{
  const div = document.createElement("div");
  div.className="msg";
  div.innerText = data.username + ": " + data.text;
  document.getElementById("messages").appendChild(div);
});

socket.on("loadMessages", (msgs)=>{
  msgs.forEach(m=>{
    const div = document.createElement("div");
    div.className="msg";
    div.innerText = m.username + ": " + m.text;
    document.getElementById("messages").appendChild(div);
  });
});

function logout(){
  location.reload();
}
