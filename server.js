// =========================
// SIMPLE FULL CHAT APP
// Node.js + Express + MongoDB + Socket.IO
// Features:
// - Register / Login
// - Chat rooms
// - Admin panel
// - Image upload
// - Mobile friendly
// =========================

// ===== 1. INSTALL =====
// npm init -y
// npm install express mongoose bcryptjs jsonwebtoken multer socket.io cors dotenv

// ===== 2. server.js =====
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use(express.static('public'));
// ===== MongoDB =====
mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log('MongoDB connected'))
.catch(err=>console.error(err));

// ===== MODELS =====
const User = mongoose.model('User', {
  username: String,
  password: String,
  isAdmin: { type: Boolean, default: false }
});

const Message = mongoose.model('Message', {
  user: String,
  text: String,
  image: String,
  room: String,
  createdAt: { type: Date, default: Date.now }
});

// ===== AUTH =====
function auth(req,res,next){
  const token = req.headers['authorization'];
  if(!token) return res.sendStatus(401);
  jwt.verify(token, process.env.JWT_SECRET, (err,user)=>{
    if(err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// ===== REGISTER =====
app.post('/register', async (req,res)=>{
  const { username, password } = req.body;
  const hash = await bcrypt.hash(password,10);
  const user = await User.create({ username, password: hash });
  res.json(user);
});

// ===== LOGIN =====
app.post('/login', async (req,res)=>{
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if(!user) return res.sendStatus(404);

  const ok = await bcrypt.compare(password, user.password);
  if(!ok) return res.sendStatus(403);

  const token = jwt.sign({ id:user._id, username:user.username, isAdmin:user.isAdmin }, process.env.JWT_SECRET);
  res.json({ token });
});

// ===== IMAGE UPLOAD =====
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req,file,cb)=>{
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

app.post('/upload', auth, upload.single('image'), (req,res)=>{
  res.json({ url: '/uploads/' + req.file.filename });
});

// ===== ADMIN =====
app.get('/admin/users', auth, async (req,res)=>{
  if(!req.user.isAdmin) return res.sendStatus(403);
  const users = await User.find();
  res.json(users);
});

app.delete('/admin/user/:id', auth, async (req,res)=>{
  if(!req.user.isAdmin) return res.sendStatus(403);
  await User.findByIdAndDelete(req.params.id);
  res.sendStatus(200);
});

// ===== SOCKET CHAT =====
io.on('connection', (socket)=>{
  socket.on('join', room=> socket.join(room));

  socket.on('message', async (msg)=>{
    const saved = await Message.create(msg);
    io.to(msg.room).emit('message', saved);
  });
});

// ===== START =====
const PORT = process.env.PORT || 3000;
server.listen(PORT, ()=>console.log('Server running on ' + PORT));


// ===== 3. .env =====
// MONGO_URI=your_mongodb_url
// JWT_SECRET=supersecret


// ===== 4. SIMPLE FRONTEND (index.html) =====
// Mobile friendly basic UI

/*
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
body{font-family:sans-serif;margin:0}
#chat{height:80vh;overflow:auto;padding:10px}
input,button{padding:10px;margin:5px}
</style>
</head>
<body>

<div id="auth">
<input id="user" placeholder="username">
<input id="pass" type="password" placeholder="password">
<button onclick="login()">Login</button>
<button onclick="register()">Register</button>
</div>

<div id="chatUI" style="display:none">
<div id="chat"></div>
<input id="msg"><button onclick="send()">Send</button>
<input type="file" id="file"><button onclick="upload()">Upload</button>
</div>

<script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
<script>
let token="";
let socket = io("/");
socket.emit('join','global');

socket.on('message', m=>{
  document.getElementById('chat').innerHTML += `<div>${m.user}: ${m.text || ''} ${m.image ? '<img src='+m.image+' width=100>' : ''}</div>`;
});

async function register(){
 await fetch('/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:user.value,password:pass.value})});
 alert('ok');
}

async function login(){
 const res = await fetch('/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:user.value,password:pass.value})});
 const data = await res.json();
 token=data.token;
 document.getElementById('auth').style.display='none';
 document.getElementById('chatUI').style.display='block';
}

function send(){
 socket.emit('message',{user:'me',text:msg.value,room:'global'});
}

async function upload(){
 const file = document.getElementById('file').files[0];
 const form = new FormData();
 form.append('image',file);

 const res = await fetch('/upload',{method:'POST',headers:{Authorization:token},body:form});
 const data = await res.json();

 socket.emit('message',{user:'me',image:data.url,room:'global'});
}
</script>

</body>
</html>
*/
