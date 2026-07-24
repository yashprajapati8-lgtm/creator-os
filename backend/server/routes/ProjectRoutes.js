import express from "express";

import { protect } from "../middleware/authmiddleware.js";

import {
  createProject,
  getProjects,
  getProjectById,
  deleteProject,
  renameProject,
  joinProject,
} from "../controllers/projectController.js";

const router = express.Router();

router.post("/", protect, createProject);

router.get("/", protect, getProjects);

router.get("/:id", protect, getProjectById);

router.delete("/:id", protect, deleteProject);

router.put("/:id", protect, renameProject);

router.post("/join", protect, joinProject);

export default router;