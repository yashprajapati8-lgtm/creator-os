import "dotenv/config";

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dns from "dns";
import { createServer } from "http";

import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/ProjectRoutes.js";
import sceneRoutes from "./routes/sceneRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import { initSocket } from "./socket/socket.js";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const app = express();
const server = createServer(app);

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());

app.use("/api", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api", sceneRoutes);
app.use("/api/chat", chatRoutes);

app.get("/", (req, res) => {
  res.send("CreatorOS API Running");
});

mongoose
  .connect(process.env.MONGO_URI, { family: 4 })
  .then(() => {
    console.log("MongoDB Connected");

    initSocket(server);

    const PORT = process.env.PORT || 5000;

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
