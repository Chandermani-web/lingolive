import express from 'express';
import cors from 'cors';
import AuthRouter from './routes/auth.route.js';
import PostRouter from './routes/post.route.js';
import FriendRouter from './routes/friend.route.js'
import notificationRoutes from './routes/notification.route.js';
import messageRoutes from './routes/message.route.js';

import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const _dirname = path.resolve();

const app = express();

app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ["https://lingolive.onrender.com"] 
        : ["http://localhost:5173"],
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from public directory
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads'))); 


app.use("/api/auth", AuthRouter);
app.use("/api/posts", PostRouter);
app.use("/api/friends", FriendRouter);
app.use("/api/notifications", notificationRoutes);
app.use("/api/messages", messageRoutes);


app.use(express.static(path.join(_dirname, "frontend", "dist")));

app.get(/.*/, (req, res) => {
  res.sendFile(path.resolve(_dirname, "frontend", "dist", "index.html"));
});



app.get('/', (req, res) => {
    res.send("API is working");
});

export default app;