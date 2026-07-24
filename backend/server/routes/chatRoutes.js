import express from "express";
import { getChats, sendChat } from "../controllers/chatController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:projectId", protect, getChats);

router.post("/:projectId", protect, sendChat);

export default router;