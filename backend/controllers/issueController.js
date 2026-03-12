const mongoose = require("mongoose");
const Repository = require("../models/repoModel");
const User = require("../models/userModel");
const Issue = require("../models/issueModel");

async function createIssue(req, res) {
  const { title, description } = req.body;
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid repository ID!" });
    }

    const repository = await Repository.findById(id);
    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }
    const issue = new Issue({
      title,
      description,
      repository: id,
    });

    await issue.save();

    res.status(201).json(issue);
  } catch (err) {
    console.error("Error creating issue : ", err.message);
    res.status(500).send("Server error");
  }
}

async function updateIssueById(req, res) {
  const { id } = req.params;
  const { title, description, status } = req.body;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid issue ID!" });
    }
    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({ error: "Issue not found!" });
    }

    if (title) issue.title = title;
    if (description) issue.description = description;
    if (status) issue.status = status;

    await issue.save();

    res.json({ message: "Issue updated!" });
  } catch (err) {
    console.error("Error updating issue : ", err.message);
    res.status(500).send("Server error");
  }
}

async function deleteIssueById(req, res) {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid issue ID!" });
    }
    const issue = await Issue.findByIdAndDelete(id);

    if (!issue) {
      return res.status(404).json({ error: "Issue not found!" });
    }
    res.json({ message: "Issue deleted!" });
  } catch (err) {
    console.error("Error deleting issue : ", err.message);
    res.status(500).send("Server error");
  }
}

async function getAllIssues(req, res) {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid repository ID!" });
    }
    const issues = await Issue.find({ repository: id });

    if (!issues || issues.length === 0) {
      return res.status(404).json({ error: "Issues not found!" });
    }

    res.status(200).json({ issues });
  } catch (err) {
    console.error("Error fetching issues : ", err.message);
    res.status(500).send("Server error");
  }
}

async function getIssueById(req, res) {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid issue ID!" });
    }
    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({ error: "Issue not found!" });
    }

    res.json(issue);
  } catch (err) {
    console.error("Error fetching issue : ", err.message);
    res.status(500).send("Server error");
  }
}

module.exports = {
  createIssue,
  updateIssueById,
  deleteIssueById,
  getAllIssues,
  getIssueById,
};
