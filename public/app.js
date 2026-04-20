const socket = io();

function sendMsg() {
  const input = document.getElementById("msg");
  socket.emit("chat message", input.value);
  input.value = "";
}

socket.on("chat message", msg => {
  const div = document.createElement("div");
  div.innerText = msg;
  document.getElementById("messages").appendChild(div);
});
