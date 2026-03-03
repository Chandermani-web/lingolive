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
  console.log("🟢 User connected:", socket.id);

  socket.on("joinRoom", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });

  socket.on("addUser", (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log("Online Users:", onlineUsers);
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
    for (let [userId, sockId] of onlineUsers.entries()) {
      if (sockId === socket.id) {
        onlineUsers.delete(userId);
        // Notify other user if in call
        io.emit("userDisconnected", userId);
        break;
      }
    }
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
  });

  // Call User - Initiate a call
  socket.on("callUser", ({ to, offer, callType, callerName, callerAvatar }) => {
    console.log("📞 CallUser event triggered");
    console.log("Calling to:", to, "Type:", callType);
    
    const targetSocketId = onlineUsers.get(to);
    if (targetSocketId) {
      io.to(targetSocketId).emit("incomingCall", {
        from: socket.handshake.query.userId,
        offer,
        callType,
        callerName,
        callerAvatar,
      });
    } else {
      socket.emit("callFailed", { message: "User is offline" });
    }
  });

  // Answer Call - Accept incoming call
  socket.on("answerCall", ({ to, answer }) => {
    console.log("✅ answerCall event triggered to:", to);
    const targetSocketId = onlineUsers.get(to);
    if (targetSocketId) {
      io.to(targetSocketId).emit("callAccepted", { answer });
    }
  });

  // Reject Call
  socket.on("rejectCall", ({ to }) => {
    console.log("❌ rejectCall event triggered");
    const targetSocketId = onlineUsers.get(to);
    if (targetSocketId) {
      io.to(targetSocketId).emit("callRejected");
    }
  });

  // End Call
  socket.on("endCall", ({ to }) => {
    console.log("📵 endCall event triggered");
    const targetSocketId = onlineUsers.get(to);
    if (targetSocketId) {
      io.to(targetSocketId).emit("callEnded");
    }
  });

  // ICE Candidate Exchange
  socket.on("iceCandidate", ({ to, candidate }) => {
    console.log("🧊 ICE candidate sent to:", to);
    const targetSocketId = onlineUsers.get(to);
    if (targetSocketId) {
      io.to(targetSocketId).emit("iceCandidate", { candidate });
    }
  });

  // Call Busy - User is already in a call
  socket.on("callBusy", ({ to }) => {
    console.log("📵 User is busy");
    const targetSocketId = onlineUsers.get(to);
    if (targetSocketId) {
      io.to(targetSocketId).emit("callBusy");
    }
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
