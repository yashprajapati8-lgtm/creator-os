import { Server } from "socket.io";

let io;

const projectUsers = {};

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Client Connected:", socket.id);
    socket.on("join-scene", (sceneId) => {
      socket.join(sceneId);
      console.log(`${socket.id} joined ${sceneId}`);
    });

    socket.on("leave-scene", (sceneId) => {
      socket.leave(sceneId);
      console.log(`${socket.id} left ${sceneId}`);
    });

    socket.on("script-update", ({ sceneId, blocks }) => {
      console.log("Received update:", sceneId);
      socket.to(sceneId).emit("script-receive", blocks);
    });

    socket.on("asset-update", ({ sceneId, scene }) => {
      socket.to(sceneId).emit("asset-receive", scene);
    });

    socket.on("disconnect", () => {
      const projectId = socket.projectId;

      if (projectId && projectUsers[projectId]) {
        projectUsers[projectId].delete(socket.id);

        io.to(projectId).emit("online-count", projectUsers[projectId].size);

        if (projectUsers[projectId].size === 0) {
          delete projectUsers[projectId];
        }
      }

      console.log("Client Disconnected:", socket.id);
    });

    socket.on("scene-created", ({ projectId, scene }) => {
      socket.to(projectId).emit("scene-created", scene);
    });

    socket.on("join-project", (projectId) => {
      socket.join(projectId);

      socket.projectId = projectId;

      if (!projectUsers[projectId]) {
        projectUsers[projectId] = new Set();
      }

      projectUsers[projectId].add(socket.id);

      io.to(projectId).emit("online-count", projectUsers[projectId].size);

      console.log(`${socket.id} joined project ${projectId}`);
    });

    socket.on("research-update", ({ sceneId, researchNote }) => {
      socket.to(sceneId).emit("research-receive", researchNote);
    });

    socket.on("scene-renamed", ({ projectId, sceneId, title }) => {
      socket.to(projectId).emit("scene-renamed", {
        sceneId,
        title,
      });
    });

    socket.on("scene-deleted", ({ projectId, sceneId }) => {
      socket.to(projectId).emit("scene-deleted", sceneId);
    });

    socket.on("leave-project", (projectId) => {
      socket.leave(projectId);

      if (projectUsers[projectId]) {
        projectUsers[projectId].delete(socket.id);

        io.to(projectId).emit("online-count", projectUsers[projectId].size);

        if (projectUsers[projectId].size === 0) {
          delete projectUsers[projectId];
        }
      }
    });

    socket.on("chat-message", ({ projectId, chat }) => {
      socket.to(projectId).emit("chat-receive", chat);
    });
  });

  return io;
};

export const getIO = () => io;
