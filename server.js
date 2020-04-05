const express = require("express");
const app = express();
const path = require('path');

let broadcaster;
const port = process.env.PORT || 4000;

const http = require("http");
const server = http.createServer(app);

let watchers = 0;

const io = require("socket.io")(server);
app.use(express.static(__dirname + "/public"));

app.get('/audio_broadcast', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/audio_broadcast.html'));
});

app.get('/video_broadcast', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/broadcast.html'));
});

app.get('/audio', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/audio.html'));
});

app.get('/video', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/index.html'));
});

io.sockets.on("error", e => console.log(e));
io.sockets.on("connection", socket => {
  socket.on("broadcaster", () => {
    broadcaster = socket.id;
    socket.broadcast.emit("broadcaster");
  });
  socket.on("watcher", () => {
    watchers+=1;
    console.log("watcher watchers " + watchers);
    socket.to(broadcaster).emit("watcher", socket.id);
  });
  socket.on("offer", (id, message) => {
    console.log("offer");
    socket.to(id).emit("offer", socket.id, message);
  });
  socket.on("answer", (id, message) => {
    console.log("answer");
    socket.to(id).emit("answer", socket.id, message);
  });
  socket.on("candidate", (id, message) => {
    console.log("candidate");
    socket.to(id).emit("candidate", socket.id, message);
  });
  socket.on("disconnect", () => {
    watchers-=1;
    console.log("disconnect watchers " + watchers);
    socket.to(broadcaster).emit("disconnectPeer", socket.id);
  });
});
server.listen(port, () => console.log(`Server is running on port ${port}`));
