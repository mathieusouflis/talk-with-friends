import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors"

const app = express();
const httpServer = createServer(app);

app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  credentials: true
}))

const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.get("/", (req, res) => {
  res.send("Hello World");
});

io.on("connection", (socket) => {
  console.log("A user connected to the Socket");
  io.emit("message", {
    content: socket.handshake.query.username + " joined the chat",
    author: "Server",
    date: new Date()
  })

  socket.on("message", (data) => {
    console.log("new message", data);
    io.emit("message", data);
  })

  socket.on("disconnect", () => {
    console.log(socket.username + " has disconnected");
    io.emit("message", {
      content: socket.handshake.query.username + " left the chat",
      author: "Server",
      date: new Date()
    })
  });
});

httpServer.listen(3000);
console.log("Server launched on port 3000");