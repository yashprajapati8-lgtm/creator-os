import express from "express";
import Scene from "../models/scene.js";
import { protect } from "../middleware/authmiddleware.js";
import Project from "../models/Project.js";

import { upload } from "../config/cloudinary.js";
import { suggest } from "../controllers/aiController.js";

const router = express.Router();


router.get("/scenes", protect, async (req, res) => {
    try {
        const project = await Project.findOne({
            _id: req.query.projectId,
            $or: [
                { owner: req.user._id },
                { collaborators: req.user._id },
            ],
        });

        if (!project) {
            return res.status(403).json({
                message: "Not authorized",
            });
        }

        const scenes = await Scene.find({
            project: req.query.projectId,
        });

        res.json(scenes);
    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
});

router.post("/scenes", protect, async (req, res) => {
    try {
        const scene = new Scene({
    title: req.body.title,
    blocks: req.body.blocks,
    assets: req.body.assets,
    project: req.body.project,   
    owner: req.user._id         
});
        const savedScene = await scene.save();
        res.status(201).json(savedScene);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.delete("/scenes/:id", protect, async (req, res) => {
    try {
        await Scene.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
        res.json({ message: "Scene deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put("/scenes/:id", protect, async (req, res) => {
    try {
        const updatedScene = await Scene.findOneAndUpdate(
            { _id: req.params.id, owner: req.user._id },
            { title: req.body.title },
            { returnDocument: "after" }

        );
        res.json(updatedScene);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post("/scenes/:id/assets", protect, upload.single("asset"), async (req, res) => {
    try {
        const scene = await Scene.findOneAndUpdate(
            { _id: req.params.id, owner: req.user._id },
            {
                $push: {
                    assets: {
                        url: req.file.path,
                        name: req.file.originalname,
                        type: req.file.mimetype,
                    }
                }
            },
                { returnDocument: "after" }

        );
        res.json(scene);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete("/scenes/:sceneId/assets/:assetId", protect, async (req, res) => {
    try {
        const scene = await Scene.findOneAndUpdate(
            { _id: req.params.sceneId, owner: req.user._id },
            { $pull: { assets: { _id: req.params.assetId } } },
            { returnDocument: "after" }
        );
        res.json(scene);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put("/scenes/:id/script", protect, async (req, res) => {
    try {
        const updatedScene = await Scene.findOneAndUpdate(
            { _id: req.params.id, owner: req.user._id },
            { blocks: req.body.blocks },
            { returnDocument: "after" }
        );
        res.json(updatedScene);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put("/scenes/:id/research", protect, async (req, res) => {
    try {
        const updatedScene = await Scene.findOneAndUpdate(
            { _id: req.params.id, owner: req.user._id },
            { researchNote: req.body.researchNote },
            { returnDocument: "after" }
        );
        res.json(updatedScene);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post("/ai/suggest", suggest);
export default router;