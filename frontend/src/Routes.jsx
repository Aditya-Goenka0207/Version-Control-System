import React, { useEffect } from "react";
import { useNavigate, useRoutes, useLocation } from "react-router-dom";

// Pages List
import Dashboard from "./components/dashboard/Dashboard";
import Profile from "./components/user/Profile";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import Repo from "./components/repo/Repo";
import RepoPage from "./components/repo/RepoPage";

// AuthContext
import { useAuth } from "./authContext";

const ProjectRoutes = () => {
  const { currentUser, setCurrentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const userIdFromStorage = localStorage.getItem("userId");

    // Restore login after refresh
    if (userIdFromStorage && !currentUser) {
      setCurrentUser(userIdFromStorage);
    }

    const publicRoutes = ["/auth", "/signup"];

    // If NOT logged in → redirect to signup
    if (!userIdFromStorage && !publicRoutes.includes(location.pathname)) {
      navigate("/signup", { replace: true }); // CHANGED
    }

    // If logged in → prevent visiting login/signup
    if (userIdFromStorage && publicRoutes.includes(location.pathname)) {
      navigate("/dashboard", { replace: true }); // CHANGED
    }
  }, [location.pathname, currentUser, navigate, setCurrentUser]);

  let element = useRoutes([
    {
      path: "/",
      element: <Signup />,
    },
    {
      path: "/signup",
      element: <Signup />,
    },
    {
      path: "/auth",
      element: <Login />,
    },
    {
      path: "/dashboard",
      element: <Dashboard />,
    },
    {
      path: "/profile",
      element: <Profile />,
    },
    {
      path: "/create",
      element: <Repo />,
    },
    {
      path: "/repo/:id",
      element: <RepoPage />,
    },
  ]);

  return element;
};

export default ProjectRoutes;
