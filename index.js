import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors"
import fs from "fs"

const app = express();
const httpServer = createServer(app);

app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  credentials: true
}))

let players = {
  "Player1": false,
  "Player2": false
}

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
    // console.log("new message", data);
    io.emit("message", data);
  })

  socket.on("messageUnity", (data) => {
    // console.log("UNITY - NEW MESSAGE", data);
    socket.broadcast.emit("messageUnity", data);
  })

  const read = () => {
    try {
      const data = fs.readFileSync("./data.json", 'utf8');
      return JSON.parse(data);
    } catch (err) {
      console.error("Error reading file:", err);
      return null;
    }
  };

  const write = (data) => {
    try {
      fs.writeFileSync("data.json", JSON.stringify(data, null, 2), 'utf8');
      console.log("Data successfully written to file");
    } catch (err) {
      console.error("Error writing to file:", err);
    }
  };

  socket.on("newUser", async (data) => {
      const _data = read()
      console.log(_data);
      
      if(!_data) return console.log("PAS DE DATA")
      if(!_data["Player1"]) socket.playerName = "Player1"
      else if(!_data["Player2"]) socket.playerName = "Player2";
      _data[socket.playerName] = true
      write(_data)
      
      

      console.log(socket.playerName + " Connected");
      io.emit("newUser", socket.playerName)
  });

  socket.on("disconnect", () => {
    const _data = read()
    if(!_data) return console.log("PAS DE DATA");
    _data[socket.playerName] = false
    write(_data)
    console.log(socket.playerName + " Disconnected");
    
    // console.log(socket.username + " has disconnected");
    io.emit("message", {
      content: socket.handshake.query.username + " left the chat",
      author: "Server",
      date: new Date()
    })
  });
});

httpServer.listen(3000);
console.log("Server launched on port 3000");