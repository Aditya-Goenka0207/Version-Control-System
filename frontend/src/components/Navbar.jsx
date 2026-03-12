import React, { useState } from "react"; 
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {

  const [menuOpen, setMenuOpen] = useState(false); 

  return (
    <nav>

      <Link to="/dashboard">
        <div className="nav-logo"> 
          <img
            src="https://www.github.com/images/modules/logos_page/GitHub-Mark.png"
            alt="GitHub Logo"
          />
          <h3>GitHub</h3>
        </div>
      </Link>

      
      <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </div>

      <div className={menuOpen ? "nav-links active" : "nav-links"}>

        <Link to="/create">
          <p>Create a Repository</p>
        </Link>

        <Link to="/profile">
          <p>Profile</p>
        </Link>

      </div>
    </nav>
  );
};

export default Navbar;