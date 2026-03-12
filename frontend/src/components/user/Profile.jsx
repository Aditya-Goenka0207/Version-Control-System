import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./profile.css";
import Navbar from "../Navbar";
import { UnderlineNav } from "@primer/react";
import { BookIcon, RepoIcon } from "@primer/octicons-react";
import HeatMapProfile from "./HeatMap";
import { useAuth } from "../../authContext";

const Profile = () => {
  const navigate = useNavigate();
  const { setCurrentUser } = useAuth();
  const [userDetails, setUserDetails] = useState({ username: "username" });
  const [repos, setRepos] = useState([]);
  const [loadingRepos, setLoadingRepos] = useState(true);
  const [errorRepos, setErrorRepos] = useState("");

  // Get userId from localStorage safely
  const getUserId = () => {
    const rawUserId = localStorage.getItem("userId");
    return rawUserId?.trim() || null;
  };

  // Fetch user details
  const fetchUserDetails = async () => {
    const userId = getUserId();
    if (!userId) return;

    try {
      const res = await axios.get(`http://localhost:3000/userProfile/${userId}`);
      setUserDetails(res.data || {});
    } catch (err) {
      console.error("Cannot fetch user details:", err.response?.data || err.message);
    }
  };

  // Fetch user repositories
  const fetchUserRepos = async () => {
    const userId = getUserId();
    if (!userId) return;

    setLoadingRepos(true);
    setErrorRepos("");

    try {
      const res = await axios.get(`http://localhost:3000/repo/user/${userId}`);
      setRepos(res.data || []);
    } catch (err) {
      console.error("Cannot fetch repositories:", err.response?.data || err.message);
      setErrorRepos("Failed to load repositories.");
    } finally {
      setLoadingRepos(false);
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setCurrentUser(null);
    navigate("/auth");
  };

  // Delete repository
  const deleteRepo = async (repoId) => {
    if (!window.confirm("Are you sure you want to delete this repository?")) return;

    try {
      await axios.delete(`http://localhost:3000/repo/delete/${repoId}`);
      fetchUserRepos();
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Failed to delete repository.");
    }
  };

  // Toggle visibility
  const toggleVisibility = async (repoId) => {
    try {
      await axios.patch(`http://localhost:3000/repo/toggle/${repoId}`);
      fetchUserRepos();
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Failed to toggle visibility.");
    }
  };

  // Update repository description
  const updateRepo = async (repoId) => {
    const newDesc = prompt("Enter new description");
    if (!newDesc) return;

    try {
      await axios.put(`http://localhost:3000/repo/update/${repoId}`, {
        description: newDesc,
      });
      fetchUserRepos();
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Failed to update repository.");
    }
  };

  useEffect(() => {
    fetchUserDetails();
    fetchUserRepos();
  }, []);

  return (
    <>
      <Navbar />

      <UnderlineNav aria-label="Repository">
        <UnderlineNav.Item
          aria-current="page"
          icon={BookIcon}
          sx={{
            backgroundColor: "transparent",
            color: "white",
            "&:hover": { textDecoration: "underline", color: "white" },
          }}
        >
          Overview
        </UnderlineNav.Item>

        <UnderlineNav.Item
          onClick={() => navigate("/repo")}
          icon={RepoIcon}
          sx={{
            backgroundColor: "transparent",
            color: "whitesmoke",
            "&:hover": { textDecoration: "underline", color: "white" },
          }}
        >
          Starred Repositories
        </UnderlineNav.Item>
      </UnderlineNav>

      <button
        onClick={handleLogout}
        style={{ position: "fixed", bottom: "50px", right: "50px" }}
        id="logout"
      >
        Logout
      </button>

      <div className="profile-page-wrapper">
        <div className="user-profile-section">
          <div className="profile-image">
            <img
              src={userDetails.avatarUrl || "https://www.gravatar.com/avatar?d=mp"}
              alt="Profile"
            />
          </div>

          <div className="name">
            <h3>{userDetails.username}</h3>
          </div>

          <button className="follow-btn">Follow</button>

          <div className="follower">
            <p>10 Followers</p>
            <p>3 Following</p>
          </div>
        </div>

        <div className="repo-card-wrapper">
          {loadingRepos ? (
            <p style={{ color: "grey", marginTop: "20px" }}>Loading repositories...</p>
          ) : errorRepos ? (
            <p style={{ color: "red", marginTop: "20px" }}>{errorRepos}</p>
          ) : repos.length > 0 ? (
            repos.map((repo) => (
              <div key={repo._id} className="repo-card">
                <h3
                  className="repo-name"
                  style={{ cursor: "pointer", color: "#408ced" }}
                  onClick={() => navigate(`/repo/${repo._id}`)}
                >
                  {repo.name}
                </h3>

                <p>{repo.description || "No description"}</p>

                <div className="repo-buttons">
                  <button onClick={() => toggleVisibility(repo._id)}>
                    {repo.visibility ? "Make Private" : "Make Public"}
                  </button>
                  <button onClick={() => updateRepo(repo._id)}>Update</button>
                  <button onClick={() => deleteRepo(repo._id)}>Delete</button>
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: "grey", marginTop: "20px" }}>You have no repositories yet.</p>
          )}
        </div>

        <div className="heat-map-section">
          <HeatMapProfile />
        </div>
      </div>
    </>
  );
};

export default Profile;