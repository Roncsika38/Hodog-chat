// LOGIN
async function login() {
  const res = await fetch("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      username: "test",
      password: "1234"
    })
  });

  const data = await res.json();
  alert(data.message);
}

// SZOBA
async function createRoom() {
  await fetch("/create-room", {
    method: "POST"
  });

  alert("Szoba létrehozva");
}

// ÜZENET
async function sendMessage() {
  const message = document.querySelector("input").value;

  await fetch("/send-message", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ message })
  });

  alert("Elküldve");
}
