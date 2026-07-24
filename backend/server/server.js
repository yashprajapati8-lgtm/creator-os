import 'dotenv/config'; // ← bas yeh ek line, baaki sab neeche

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dns from "dns";
import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import sceneRoutes from './routes/sceneRoutes.js';
import { initSocket } from "./socket/socket.js";
import chatRoutes from "./routes/chatRoutes.js";


dns.setServers(["8.8.8.8", "8.8.4.4"]);

import { createServer } from "http";

const app = express();
const server = createServer(app);app.use(cors());
app.use(express.json());
app.use('/api', authRoutes);
app.use("/api/projects", projectRoutes);
app.use('/api', sceneRoutes);
app.get("/", (req, res) => {
  res.send("CreatorOS API Running");
});
app.use("/api/chat", chatRoutes);

mongoose
  .connect(process.env.MONGO_URI, { family: 4 })
  .then(() => {
    console.log("MongoDB Connected");

    initSocket(server);

    server.listen(5000, () => {
      console.log("Server running on port 5000");
    });
  })
  .catch((err) => console.log(err));