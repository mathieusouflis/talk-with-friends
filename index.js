import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.emit("message", {
    content : "Someone Just Connect!",
    author : "Server",
    date : new Date()
  })

  socket.on("message", (data) => {
    console.log("new message", data);
    io.emit("message", data);
  })

});

httpServer.listen(3000);
console.log("Server launched on port 3000");