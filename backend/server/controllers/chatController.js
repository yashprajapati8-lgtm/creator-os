import Chat from "../models/Chat.js";
import Project from "../models/Project.js";

export const getChats = async (req, res) => {
    try {
        const { projectId } = req.params;

        const project = await Project.findOne({
            _id: projectId,
            $or: [
                { owner: req.user._id },
                { collaborators: req.user._id },
            ],
        });

        if (!project) {
            return res.status(403).json({
                message: "Project not found",
            });
        }

        const chats = await Chat.find({
            project: projectId,
        })
            .populate("sender", "name")
            .sort({ createdAt: 1 });

        res.json(chats);
    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
};

export const sendChat = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { message } = req.body;

        if (!message.trim()) {
            return res.status(400).json({
                message: "Message is required",
            });
        }

        const project = await Project.findOne({
            _id: projectId,
            $or: [
                { owner: req.user._id },
                { collaborators: req.user._id },
            ],
        });

        if (!project) {
            return res.status(403).json({
                message: "Project not found",
            });
        }

        const chat = await Chat.create({
            project: projectId,
            sender: req.user._id,
            message,
        });

        await chat.populate("sender", "name");

        res.status(201).json(chat);

    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
};