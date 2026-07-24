import Project from "../models/Project.js";
import Scene from "../models/scene.js";
export const createProject = async (req, res) => {
  try {
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    console.log(req.user);
    const { title } = req.body;

    const project = await Project.create({
      title,
      owner: req.user._id,
      collaborators: [],
      inviteCode,
    });

    await Scene.create({
      title: "Scene 1",
      owner: req.user._id,
      project: project._id,
      blocks: [
        {
          type: "paragraph",
          content: "",
        },
      ],
      assets: [],
      researchNote: "",
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ owner: req.user._id }, { collaborators: req.user._id }],
    }).sort({ updatedAt: -1 });

    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    res.status(200).json({
      message: "Project deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const renameProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const title = req.body.title;
    const userId = req.user._id;

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Project title is required",
      });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    if (project.owner.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    project.title = title;

    await project.save();

    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
    });
  }
};

export const joinProject = async (req, res) => {
  try {
    const { inviteCode } = req.body;

    const project = await Project.findOne({ inviteCode });

    if (!project) {
      return res.status(404).json({
        message: "Invalid invite code",
      });
    }

    const userId = req.user._id;

    if (project.owner.toString() === userId.toString()) {
      return res.status(400).json({
        message: "You already own this project",
      });
    }

    if (project.collaborators.includes(userId)) {
      return res.status(400).json({
        message: "Already joined",
      });
    }

    project.collaborators.push(userId);

    await project.save();

    res.status(200).json({
      message: "Joined successfully",
      project,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
