import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./RepoPage.css";
import Navbar from "../Navbar";

const RepoPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [repo, setRepo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newContent, setNewContent] = useState("");
  const [description, setDescription] = useState("");
  const [updating, setUpdating] = useState(false);

  const token = localStorage.getItem("token");

  // Fetch repository details
  const fetchRepo = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`https://github-backend-15g0.onrender.com/repo/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRepo(res.data);
      setDescription(res.data.description || "");
    } catch (err) {
      console.error("Cannot fetch repo:", err.response?.data || err.message);
      alert("Failed to load repository.");
    } finally {
      setLoading(false);
    }
  };

  // Update description or add content
  const handleUpdate = async () => {
    if (!description && !newContent) return alert("Nothing to update!");

    setUpdating(true);
    try {
      const updateData = { description };
      if (newContent) updateData.content = [newContent];

      const res = await axios.put(
        `https://github-backend-15g0.onrender.com/repo/update/${id}`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRepo(res.data.repository);
      setDescription(res.data.repository.description || "");
      setNewContent("");
      alert("Repository updated successfully!");
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Error updating repository");
    } finally {
      setUpdating(false);
    }
  };

  // Toggle visibility
  const handleToggle = async () => {
    setUpdating(true);
    try {
      const res = await axios.patch(
        `https://github-backend-15g0.onrender.com/repo/toggle/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRepo(res.data.repository);
      alert("Visibility toggled!");
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Error toggling visibility");
    } finally {
      setUpdating(false);
    }
  };

  // Delete repository
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this repository?")) return;

    try {
      await axios.delete(`https://github-backend-15g0.onrender.com/repo/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Repository deleted!");
      navigate("/profile");
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Error deleting repository");
    }
  };

  useEffect(() => {
    fetchRepo();
  }, [id]);

  if (loading) return <p>Loading repository...</p>;
  if (!repo) return <p>Repository not found.</p>;

  return (
    <>
      <Navbar />
      <div className="repo-page-wrapper">
        <button onClick={() => navigate("/profile")} style={{ marginBottom: "20px" }}>
          ← Back to Profile
        </button>

        <h2>{repo.name}</h2>

        <label>Description:</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          style={{ width: "100%" }}
        />

        <p>
          Visibility: <strong>{repo.visibility ? "Public" : "Private"}</strong>
        </p>

        <div className="repo-buttons">
          <button onClick={handleUpdate} disabled={updating}>
            {updating ? "Updating..." : "Update"}
          </button>
          <button onClick={handleToggle} disabled={updating}>
            {updating ? "Updating..." : "Toggle Visibility"}
          </button>
          <button onClick={handleDelete} style={{ backgroundColor: "red" }} disabled={updating}>
            {updating ? "Processing..." : "Delete"}
          </button>
        </div>

        <div style={{ marginTop: "20px" }}>
          <label>Add Content:</label>
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            rows={3}
            style={{ width: "100%" }}
          />
          <button onClick={handleUpdate} style={{ marginTop: "10px" }} disabled={updating}>
            {updating ? "Updating..." : "Add Content"}
          </button>
        </div>

        <div style={{ marginTop: "20px" }}>
          <h3>Repository Content</h3>
          {repo.content && repo.content.length > 0 ? (
            <ul>
              {repo.content.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          ) : (
            <p>No content yet.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default RepoPage;