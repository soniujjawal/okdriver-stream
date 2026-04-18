import http from "http";
import { Server } from "socket.io";

const server = http.createServer();

const io = new Server(server, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  socket.on("offer", (data) => socket.broadcast.emit("offer", data));
  socket.on("answer", (data) => socket.broadcast.emit("answer", data));
  socket.on("ice-candidate", (data) =>
    socket.broadcast.emit("ice-candidate", data)
  );
});

server.listen(5000, () => {
  console.log("Signaling server running on 5000");
});
