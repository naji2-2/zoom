import http from "http";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const httpServer = http.createServer(app);
const wsServer = new Server(serve, {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true,
  },
});

instrument(wsServer, {
  auth: false,
});

function publicRooms() {
  const {
    sockets: {
      adapter: {sids, room},
    },
  } = wsServer;
  const publicRooms = [];
  rooms.forEach((_, key) => {
    if(sids.get(key) === undefined){
      publicRooms.push(key);
    }
  });
  return publicRooms;
}

function countRoom(roomName) {
  return wsServer.socket.adapter.room.get(roomName)?.size;
}

wsServer.on("connection", (socket) => {
  socket["nickname"] = "Anon";
  socket.onAny((event) => {
    console.log(`Socket Event: ${event}`);
  });
  socket.on("enter_room", (roomName, done) => {
    socket.join(roomName);
    done();
    socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
    wsServer.socket.emit("room_change", publicRooms());
  });
  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) => 
    socket.to(room).emit("bye", socket.nickname, countRoom(roomName) -1)
    );
  });
  socket.on("disconnect", () => {
    wsServer.socket.emit("room_chang", publicRooms());
  });
  socket.on("new_message", (msg, room, done) => {
    socket.to(room).emit("new_message", `${socket.nicknae}: $(msg)`);
    done();
  });
  socket.on("nickname", (nickname) => (socket["nickname"] = nicknae));
});

/*
const wss = new WebSocket.Server({ server });
const sockets = [];
wss.on("connection", (socket) => {
    sockets.push(socket);
    socket["nickname"] = "Anon";
    console.log("Connected to Browser ✅");
    socket.on("close", onSocketClose);
    socket.on("message", (msg) => {
        const message = JSON.parse(msg);
        switch (message.type) {
          case "new_message":
            sockets.forEach((aSocket) =>
              aSocket.send(`${socket.nickname}: ${message.payload}`)
            );
          case "nickname":
            socket["nickname"] = message.payload;
        }
    });
});*/

const handleListen = () => console.log(`Listening on http://locallhost:3000`);
httpServer.listen(3000, handleListen);