import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import connectDB from "./database/index.db.js";
import dotenv from "dotenv";
import { registerCallHandlers } from "./services/callSocketHandler.js";

dotenv.config();
const PORT = process.env.PORT || 5000;

// Create server and Socket.io instance first
const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: "https://lingolive.onrender.com",
    credentials: true,
  },
  pingTimeout: 60000, // Increase timeout for mobile devices
  pingInterval: 25000,
});

export let onlineUsers = new Map(); // userId -> socketId

// Handle user connections
io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);
  const userId = socket.handshake.query.userId;

  socket.on("joinRoom", (roomUserId) => {
    socket.join(roomUserId);
    console.log(`User ${roomUserId} joined their room`);
  });

  socket.on("addUser", (addUserId) => {
    onlineUsers.set(addUserId, socket.id);
    console.log("Online Users:", Array.from(onlineUsers.keys()));
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
  });

  // Register call handlers with session management
  registerCallHandlers(io, socket, onlineUsers);

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
    let disconnectedUserId = null;
    
    for (let [uid, sockId] of onlineUsers.entries()) {
      if (sockId === socket.id) {
        disconnectedUserId = uid;
        onlineUsers.delete(uid);
        break;
      }
    }
    
    if (disconnectedUserId) {
      io.emit("userDisconnected", disconnectedUserId);
    }
    
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
  });
});


// Connect DB and start server
connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Failed to connect to DB", err);
  });
