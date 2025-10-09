import "./AdminDashboard.css";
import Footer from "./Footer";
import Header from "./Header";
import React, { useEffect, useState } from "react";
import TaskAssignForm from "./TaskAssignForm";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();

  // Dashboard stats
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalTasks: 0,
    pendingTasks: 0,
  });

  const [activePage, setActivePage] = useState("dashboard");
  const [employees, setEmployees] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    department: "",
    position: "",
  });

  // -----------------------------
  // Fetch Employees
  // -----------------------------
  const fetchEmployees = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/emp_details");
      const normalized = res.data.map(emp => {
        const uniqueId = emp.id ?? emp.emp_code ?? crypto.randomUUID();
        return {
          emp_code: emp.emp_code ?? uniqueId,
          name: emp.name ?? "",
          email: emp.email ?? "",
          department: emp.department ?? "",
          position: emp.position ?? "",
          tasks_assigned: emp.tasks_assigned ?? 0,
          tasks_completed: emp.tasks_completed ?? 0,
          id: uniqueId,
        };
      });
      setEmployees(normalized);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  // -----------------------------
  // Fetch Dashboard Stats
  // -----------------------------
  const fetchStats = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/dashboard-stats");
      const data = res.data ?? {};
      setStats({
        totalEmployees: data.totalEmployees ?? data.total_employees ?? 0,
        totalTasks: data.totalTasks ?? data.total_tasks ?? 0,
        pendingTasks: data.pendingTasks ?? data.pending_tasks ?? 0,
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  // -----------------------------
  // Handle Back Button / Exit
  // -----------------------------
  useEffect(() => {
    const handlePopState = () => {
      const confirmExit = window.confirm("Are you sure you want to exit?");
      if (confirmExit) {
        localStorage.clear();
        navigate("/", { replace: true });
      } else {
        window.history.pushState(null, "", window.location.href);
      }
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate]);

  // -----------------------------
  // Initial Fetch
  // -----------------------------
  useEffect(() => {
    fetchEmployees();
    fetchStats();
  }, []);

  // -----------------------------
  // Form Handling
  // -----------------------------
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!form.name || !form.email || !form.department || !form.position) {
      alert("Please fill all fields");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/emp_details", form);
      const newEmp = {
        emp_code: res.data.emp_code ?? res.data.id ?? crypto.randomUUID(),
        name: res.data.name ?? "",
        email: res.data.email ?? "",
        department: res.data.department ?? "",
        position: res.data.position ?? "",
        tasks_assigned: res.data.tasks_assigned ?? 0,
        tasks_completed: res.data.tasks_completed ?? 0,
        id: res.data.id ?? res.data.emp_code ?? crypto.randomUUID(),
      };
      setEmployees(prev => [...prev, newEmp]);
      setForm({ name: "", email: "", department: "", position: "" });
      setActivePage("employees");
      setSuccessMessage("Employee added successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      fetchStats(); // update dashboard stats
    } catch (err) {
      console.error("Error adding employee:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // -----------------------------
  // Delete Employee
  // -----------------------------
  const deleteEmployee = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/emp_details/${id}`);
      fetchEmployees();
      fetchStats(); // update stats after deletion
    } catch (err) {
      console.error("Error deleting employee:", err);
    }
  };

  // -----------------------------
  // Logout
  // -----------------------------
  const logout = () => {
    const confirmExit = window.confirm("Are you sure you want to exit?");
    if (confirmExit) {
      localStorage.removeItem('admin');
      navigate('/', { replace: true });
    }
  };

  // -----------------------------
  // Page Switches
  // -----------------------------
  const showDashboard = () => setActivePage("dashboard");
  const showEmployees = () => { fetchEmployees(); setActivePage("employees"); };
  const showTasks = () => setActivePage("tasks");

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
              <h2>Add New Employee</h2><br />
              <input
                type="text"
                name="name"
                placeholder="Enter employee name"
                value={form.name}
                onChange={handleChange}
                required
                disabled={isSubmitting}
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
                <button type="submit" disabled={isSubmitting}>ADD</button>
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
                  <tr key={emp.id}>
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

        {/* Success message */}
        {successMessage && <div className="success-popup">{successMessage}</div>}

        {/* Tasks */}
        {activePage === "tasks" && <TaskAssignForm />}
      </div>
      <Footer />
    </>
  );
}
