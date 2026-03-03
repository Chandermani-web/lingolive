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

export let onlineUsers = new Map(); // userId -> socketId
export let busyUsers = new Set(); // Users currently in a call
export let pendingCalls = new Map(); // userId -> [array of pending calls]

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

    // Send any pending calls to this user
    if (pendingCalls.has(userId)) {
      const userPendingCalls = pendingCalls.get(userId);
      console.log(`📬 Sending ${userPendingCalls.length} pending calls to user ${userId}`);
      
      userPendingCalls.forEach((call) => {
        io.to(socket.id).emit("incomingCall", call);
      });
      
      // Clear pending calls after sending
      pendingCalls.delete(userId);
    }
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
    let disconnectedUserId = null;
    
    for (let [userId, sockId] of onlineUsers.entries()) {
      if (sockId === socket.id) {
        disconnectedUserId = userId;
        onlineUsers.delete(userId);
        busyUsers.delete(userId); // Remove from busy users
        break;
      }
    }
    
    if (disconnectedUserId) {
      // Notify other user if in call
      io.emit("userDisconnected", disconnectedUserId);
    }
    
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
  });

  // Call User - Initiate a call
  socket.on("callUser", ({ to, offer, callType, callerName, callerAvatar }) => {
    console.log("📞 CallUser event triggered");
    console.log("Calling to:", to, "Type:", callType);
    
    const callerId = socket.handshake.query.userId;
    
    // Check if target user is busy
    if (busyUsers.has(to)) {
      socket.emit("callBusy", { message: "User is currently on another call" });
      return;
    }
    
    const targetSocketId = onlineUsers.get(to);
    const callData = {
      from: callerId,
      offer,
      callType,
      callerName,
      callerAvatar,
      timestamp: Date.now(),
    };
    
    if (targetSocketId) {
      // User is online, send immediately
      io.to(targetSocketId).emit("incomingCall", callData);
    } else {
      // User is offline, queue the call
      console.log(`📭 User ${to} is offline, queueing call`);
      
      if (!pendingCalls.has(to)) {
        pendingCalls.set(to, []);
      }
      
      pendingCalls.get(to).push(callData);
      
      // Clean up old pending calls (older than 5 minutes)
      setTimeout(() => {
        if (pendingCalls.has(to)) {
          const calls = pendingCalls.get(to);
          const filtered = calls.filter(
            (call) => Date.now() - call.timestamp < 5 * 60 * 1000
          );
          
          if (filtered.length === 0) {
            pendingCalls.delete(to);
          } else {
            pendingCalls.set(to, filtered);
          }
        }
      }, 5 * 60 * 1000);
      
      socket.emit("callQueued", { 
        message: "User is offline. Call will be delivered when they come online." 
      });
    }
  });

  // Answer Call - Accept incoming call
  socket.on("answerCall", ({ to, answer }) => {
    console.log("✅ answerCall event triggered to:", to);
    
    const userId = socket.handshake.query.userId;
    
    // Mark both users as busy
    busyUsers.add(userId);
    busyUsers.add(to);
    
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
    
    const userId = socket.handshake.query.userId;
    
    // Free both users from busy state
    busyUsers.delete(userId);
    busyUsers.delete(to);
    
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
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Failed to connect to DB", err);
  });
