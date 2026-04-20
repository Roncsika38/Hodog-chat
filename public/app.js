import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onChildAdded } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// 🔥 IDE MÁSOLD A SAJÁT CONFIGOD
const firebaseConfig = {
  apiKey: "IDE",
  authDomain: "IDE",
  databaseURL: "IDE",
  projectId: "IDE",
  storageBucket: "IDE",
  messagingSenderId: "IDE",
  appId: "IDE"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let username = "";

window.login = function() {
  username = document.getElementById("username").value;
  if (!username) return;

  document.getElementById("login").classList.add("hidden");
  document.getElementById("chat").classList.remove("hidden");

  loadMessages();
}

window.sendMessage = function() {
  const input = document.getElementById("messageInput");
  if (!input.value) return;

  push(ref(db, "messages"), {
    name: username,
    text: input.value
  });

  input.value = "";
}

function loadMessages() {
  const messagesRef = ref(db, "messages");

  onChildAdded(messagesRef, (data) => {
    const msg = data.val();

    const div = document.createElement("div");
    div.classList.add("message");

    if (msg.name === username) {
      div.classList.add("me");
    } else {
      div.classList.add("other");
    }

    div.innerText = msg.name + ": " + msg.text;

    document.getElementById("messages").appendChild(div);
  });
}
