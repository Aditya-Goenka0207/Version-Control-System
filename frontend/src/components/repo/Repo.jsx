import React, { useState } from "react";
import axios from "axios";
import "./Repo.css";
import { useNavigate } from "react-router-dom";

const Repo = () => {
  const navigate = useNavigate();
  const [repoName, setRepoName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("public"); // string for radio
  const [loading, setLoading] = useState(false);

  const handleCreateRepo = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      const isPublic = visibility === "public";

      const res = await axios.post(
        "https://github-backend-15g0.onrender.com/repo/create",
        {
          name: repoName,
          description,
          visibility: isPublic,
          userId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(res.data);

      alert("Repository created successfully!");

      // Reset form
      setRepoName("");
      setDescription("");
      setVisibility("public");

      // Redirect to profile after creation
      navigate("/profile");
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert(err.response?.data?.error || "Error creating repository");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="repo-container">
      <h2>Create a new repository</h2>

      <form className="repo-form" onSubmit={handleCreateRepo}>
        <label>Repository Name</label>
        <input
          type="text"
          placeholder="my-awesome-project"
          value={repoName}
          onChange={(e) => setRepoName(e.target.value)}
          required
        />

        <label>Description</label>
        <textarea
          placeholder="Write a short description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <label>Visibility</label>
        <div className="visibility">
          <label>
            <input
              type="radio"
              value="public"
              checked={visibility === "public"}
              onChange={(e) => setVisibility(e.target.value)}
            />
            Public
          </label>

          <label>
            <input
              type="radio"
              value="private"
              checked={visibility === "private"}
              onChange={(e) => setVisibility(e.target.value)}
            />
            Private
          </label>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Repository"}
        </button>
      </form>
    </div>
  );
};

export default Repo;