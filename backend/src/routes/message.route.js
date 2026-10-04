import express from "express";
import { sendMessage, getMessages, deleteMessage, getConversations } from "../controllers/message.controller.js";
import { isLoggedIn } from "../middlewares/isLoggedIn.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

router.get("/conversations", isLoggedIn, getConversations);
router.post("/", isLoggedIn, upload.fields([{ name: "image", maxCount: 1 }, { name: "video", maxCount: 1 }, { name: "audio", maxCount: 1 }, { name: "file", maxCount: 1 }]), sendMessage);
router.delete("/:messageId", isLoggedIn, deleteMessage);

router.get("/:userId", isLoggedIn, getMessages);

export default router;
