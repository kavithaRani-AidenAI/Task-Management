import React from "react";
import { useNavigate } from "react-router-dom";
import "./DashboardHeader.css"; // we'll add styling here

export default function DashboardHeader({ currentUser }) {
  const navigate = useNavigate();

  const handleLogout = () => {
  const confirmExit = window.confirm("Are you sure you want to exit?");
  if (confirmExit) {
    localStorage.clear(); // clear session
    navigate("/", { replace: true }); // go to login
  }
  // else do nothing, stay on dashboard
};

  return (
    <header className="header-container">
      {/* Left: Company Logo */}
      <div className="header-left">
          <div className="logo">
              <img src="/DS logo.JPG" alt="Company Logo" className="company-logo" />
              <span className="company-name">Employee Task Management System</span>
          </div>
        
       
      </div>

      {/* Right: User info + Logout */}
      <div className="header-right">
        {currentUser && (
          <span className="user-name">Welcome, {currentUser.name}</span>
        )}
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}
