// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';
import axios from "axios";
import Footer from './Footer';
import Header from './Header';
import TaskAssignForm from './TaskAssignForm';

export default function AdminDashboard(){
  const nav = useNavigate();
   const [stats, setStats] = useState({
    totalEmployees: 0,
    totalTasks: 0,
    pendingTasks: 0,
  });


    //const [successMessage, setSuccessMessage] = useState("");


   const [activePage, setActivePage] = useState("dashboard"); 
  const [employees, setEmployees] = useState([]);


  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); 

  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    department: "",
    position: "",
  });

  useEffect(() => {
     fetchEmployees();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/dashboard-stats");
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

     // Fetch employees
const fetchEmployees = async () => {
  try {
    const res = await axios.get("http://localhost:5000/api/emp_details");
    console.log("Employees fetched:", res.data);
    setEmployees(res.data);
  } catch (err) {
    console.error("Error fetching employees:", err);
  }
};
   // Handle add employee

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true); // disable form
  try {
    const res = await axios.post("http://localhost:5000/api/emp_details", form);
    setEmployees(prev => [...prev, res.data]); // 👈 Add newly created employee directly
    setForm({ name: "", email: "", department: "", position: "" });
    setActivePage("employees");
     setSuccessMessage("Employee added successfully!");
      setTimeout(() => {
      setSuccessMessage("");
      setIsSubmitting(false);
    }, 3000);

  
  } catch (err) {
    console.error("Error adding employee:", err);
  }
};

  const deleteEmployee = async (id) => {
    await axios.delete(`http://localhost:5000/api/emp_details/${id}`);
    fetchEmployees();
  };

   // Switch pages
  const showDashboard = () => setActivePage("dashboard");
  const showEmployees = () => {
    fetchEmployees();
    setActivePage("employees");
  };
  const showTasks = () => setActivePage("tasks");

  useEffect(() => {
    fetchStats();
  }, []);



  function logout(){
    localStorage.removeItem('admin');
    nav('/');
  }




  return (
      <>
     <Header currentUser={null} /> 
    <div className="container">
      {/* Nav bar */}
      <div className="nav-bars">
    <h2>Admin Dashboard</h2>
    <div>
      <button onClick={showEmployees}>Manage Employees</button>
       <button onClick={showTasks}>Assign Tasks</button>
      <button onClick={logout}>Logout</button>
    </div>
  </div>
      {/* Dashboard */}
      {activePage === "dashboard" && (
    <div className="dashboard-section">
      <h3>Welcome, Admin!</h3>
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-title">Total Employees</div>
          <div className="stat-value">{stats.totalEmployees}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Total Tasks</div>
          <div className="stat-value">{stats.totalTasks}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Pending Tasks</div>
          <div className="stat-value">{stats.pendingTasks}</div>
        </div>
      </div>
    </div>
  )}
      {/* Employees Section */}
      {activePage === "employees" && (
        <div>
         
          <form onSubmit={handleSubmit} className="empform">
             <h2>Add New Employee</h2><br></br>
            <input
              type="text"
              name="name"
              placeholder="Enter employee name"
              value={form.name}
              onChange={handleChange}
              required
               disabled={isSubmitting} // disable input while submitting
            />
            <input
              type="email"
              name="email"
              placeholder="Enter email"
              value={form.email}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
            <select
              name="department"
              value={form.department}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            >
              <option value="">Select Department</option>
              <option value="IT">IT</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
            </select>
            <input
              type="text"
              name="position"
              placeholder="Enter position"
              value={form.position}
              onChange={handleChange}
              required
               disabled={isSubmitting}
            />
            <div className='form-group'>
              <button type="submit" disabled={isSubmitting}>
    ADD
  </button> 
          {/* <button type="submit">Add</button> */}
           </div>
          </form>
          

     
    <h3>Employee List</h3>
    <table className="employee-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Email</th>
          <th>Department</th>
          <th>Position</th>
          <th>Tasks Assigned</th>
          <th>Tasks Completed</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {employees.map(emp => (
          <tr key={emp.id || emp.emp_code}>
            <td>{emp.emp_code}</td>
            <td>{emp.name}</td>
            <td>{emp.email}</td>
            <td>{emp.department}</td>
            <td>{emp.position}</td>
            <td>{emp.tasks_assigned}</td>
            <td>{emp.tasks_completed}</td>
            <td>
              <button onClick={() => deleteEmployee(emp.id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
        </div>
      )}

      {successMessage && (
  <div className="success-popup">
    {successMessage}
  </div>
)}

    
     {/* Tasks */}
      {activePage === "tasks" && <TaskAssignForm />}
    </div>
     <Footer />
    </>
  );
 
}
