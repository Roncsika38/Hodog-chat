const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Frontend kiszolgálása
app.use(express.static(path.join(__dirname, "public")));

// TEST API
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  console.log("Login:", username);

  res.json({ success: true, message: "Bejelentkezve" });
});

app.post("/create-room", (req, res) => {
  console.log("Szoba létrehozva");
  res.json({ success: true });
});

app.post("/send-message", (req, res) => {
  const { message } = req.body;
  console.log("Üzenet:", message);

  res.json({ success: true });
});

// PORT (EZ A LÉNYEG!)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server fut a porton:", PORT);
});
