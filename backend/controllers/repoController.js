const mongoose = require("mongoose");
const Repository = require("../models/repoModel");
const User = require("../models/userModel");
const Issue = require("../models/issueModel");

async function createRepository(req, res) {
  const { userId, name, issues, content, description, visibility } = req.body;
  try {
    if (!name) {
      return res.status(400).json({ error: "Repository name is required!" });
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID!" });
    }

    const ownerId = new mongoose.Types.ObjectId(userId); // ✅ Safe ObjectId

    const newRepository = new Repository({
      name,
      description,
      visibility,
      owner: ownerId,
      content,
      issues,
    });

    const result = await newRepository.save();
    res.status(201).json({
      message: "Repository created",
      repositoryId: result._id,
    });
  } catch (err) {
    console.error("Error during repository creation :", err.message);
    return res.status(500).json({ message: "Server error!" });
  }
}

async function getAllRepositories(req, res) {
  try {
    const repositories = await Repository.find({})
      .populate("owner")
      .populate("issues");

    res.json(repositories);
  } catch (err) {
    console.error("Error during fetching repositories:", err.message);
    return res.status(500).json({ message: "Server error!" });
  }
}

async function fetchRepositoryById(req, res) {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid repository ID!" });
  }

  try {
    const repoId = new mongoose.Types.ObjectId(id); // ✅ Safe ObjectId
    const repository = await Repository.findById(repoId)
      .populate("owner")
      .populate("issues");

    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    res.status(200).json(repository);
  } catch (err) {
    console.error("Error during fetching repository:", err.message);
    return res.status(500).json({ message: "Server error!" });
  }
}

async function fetchRepositoryByName(req, res) {
  const { name } = req.params;

  try {
    const repository = await Repository.find({ name: name })
      .populate("owner")
      .populate("issues");

    if (!repository || repository.length === 0) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    res.status(200).json(repository);
  } catch (err) {
    console.error("Error during fetching repository:", err.message);
    return res.status(500).json({ message: "Server error!" });
  }
}

async function fetchRepositoriesForCurrentUser(req, res) {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: "Invalid user ID!" });
  }

  try {
    const ownerId = new mongoose.Types.ObjectId(userId); // ✅ Safe ObjectId
    const repositories = await Repository.find({ owner: ownerId })
      .populate("owner")
      .populate("issues");

    res.status(200).json(repositories);
  } catch (err) {
    console.error("Error fetching user repositories:", err);
    return res.status(500).json({ message: "Server error!" });
  }
}

async function updateRepositoryById(req, res) {
  const { id } = req.params;
  const { content, description } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid repository ID!" });
  }

  try {
    const repoId = new mongoose.Types.ObjectId(id); // ✅ Safe ObjectId
    const repository = await Repository.findById(repoId);

    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    if (content) {
      repository.content.push(content);
    }

    if (description) {
      repository.description = description;
    }

    const updatedRepository = await repository.save();
    res.json({
      message: "Repository updated successfully",
      repository: updatedRepository,
    });
  } catch (err) {
    console.error("Error during updating repository:", err.message);
    return res.status(500).json({ message: "Server error!" });
  }
}

async function toggleVisibilityById(req, res) {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid repository ID!" });
  }

  try {
    const repoId = new mongoose.Types.ObjectId(id); // ✅ Safe ObjectId
    const repository = await Repository.findById(repoId);

    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    repository.visibility = !repository.visibility;

    const updatedRepository = await repository.save();
    res.json({
      message: "Repository visibility toggled successfully",
      repository: updatedRepository,
    });
  } catch (err) {
    console.error("Error during toggling visibility:", err.message);
    return res.status(500).json({ message: "Server error!" });
  }
}

async function deleteRepositoryById(req, res) {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid repository ID!" });
  }

  try {
    const repoId = new mongoose.Types.ObjectId(id); // ✅ Safe ObjectId
    const repository = await Repository.findByIdAndDelete(repoId);

    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    res.json({ message: "Repository deleted successfully" });
  } catch (err) {
    console.error("Error during deleting repository:", err.message);
    return res.status(500).json({ message: "Server error!" });
  }
}

module.exports = {
  createRepository,
  getAllRepositories,
  fetchRepositoryById,
  fetchRepositoryByName,
  fetchRepositoriesForCurrentUser,
  updateRepositoryById,
  toggleVisibilityById,
  deleteRepositoryById,
};