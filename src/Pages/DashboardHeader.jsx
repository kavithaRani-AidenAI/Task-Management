import React from "react";
import { useNavigate } from "react-router-dom";
import "./DashboardHeader.css"; 
import { useEffect, useState } from "react";// we'll add styling here

export default function DashboardHeader({ currentUser }) {
  const navigate = useNavigate();
  const [empDetails, setEmpDetails] = useState(null);

  useEffect(() => {
 const empData = JSON.parse(localStorage.getItem("employee"));
  if (empData) {
    setEmpDetails(empData);
  }
}, []);

  const handleLogout = () => {
  const confirmExit = window.confirm("Are you sure you want to exit?");
  if (confirmExit) {
    localStorage.clear(); // clear session
    navigate("/", { replace: true }); // go to login
  }
  // else do nothing, stay on dashboard
};

  return (
    // <header className="header-container">
    //   {/* Left: Company Logo */}
    //   <div className="header-left">
    //       <div className="logo">
    //           <img src="/DS logo.JPG" alt="Company Logo" className="company-logo" />
    //           <span className="company-name">Employee Task Management System</span>
              
    //       </div>
      
       
    //   </div>

    //   {/* Right: User info + Logout */}
    //   <div className="header-right">
        
    //     <button className="logout-btn" onClick={handleLogout}>
    //       Logout
    //     </button>
    //   </div>
    // </header>

    <header className="header-container">
  {/* Left: Company Logo */}
  <div className="header-left">
    <div className="logo">
      <img src="/DS logo.JPG" alt="Company Logo" className="company-logo" />
      <div className="company-title">
        <span className="company-name">Task Management System</span>
        {/* Centered employee info */}
     {currentUser && (
  <div className="employee-info">
    {currentUser.name}({currentUser.emp_code}) - {currentUser.position}
  </div>
)}
      </div>
    </div>
  </div>

  {/* Right: User info + Logout */}
  <div className="header-right">
    <button className="logout-btn" onClick={handleLogout}>
      Logout
    </button>
  </div>
</header>

  );
}
