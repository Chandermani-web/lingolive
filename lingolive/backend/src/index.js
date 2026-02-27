import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import connectDB from "./database/index.db.js";
import dotenv from "dotenv";

dotenv.config();
const PORT = process.env.PORT || 5000;

// Create server and Socket.io instance first
const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: "https://lingolive.onrender.com",
    credentials: true,
  },
});

export let onlineUsers = new Map();

// Handle user connections
io.on("connection", (socket) => {
  ("🟢 User connected:", socket.id);

  socket.on("joinRoom", (userId) => {
    socket.join(userId);
    (`User ${userId} joined their room`);
  });

  socket.on("addUser", (userId) => {
    onlineUsers.set(userId, socket.id);
    ("Online Users:", onlineUsers);
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
  });

  socket.on("disconnect", () => {
    ("🔴 User disconnected:", socket.id);
    for (let [userId, sockId] of onlineUsers.entries()) {
      if (sockId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
  });
});


// Connect DB and start server
connectDB()
  .then(() => {
    server.listen(PORT, () => {
      (`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    ("Failed to connect to DB", err);
  });
