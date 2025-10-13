import "./AdminDashboard.css";
import * as XLSX from "xlsx";
import Footer from "./Footer";
import Header from "./Header";
import React, { useEffect, useState } from "react";
import TaskAssignForm from "./TaskAssignForm";
import axios from "axios";
import { saveAs } from "file-saver";
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
  const [filterCard, setFilterCard] = useState(""); // "", "totalEmployees", "totalTasks", "pendingTasks"
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
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
          id: uniqueId,
        };
      });
      setEmployees(normalized);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  // -----------------------------
  // Fetch Tasks
  // -----------------------------
  const fetchTasks = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/tasks");
      setTasks(res.data ?? []);
    } catch (err) {
      console.error("Error fetching tasks:", err);
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
    fetchTasks();
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
        id: res.data.id ?? res.data.emp_code ?? crypto.randomUUID(),
      };
      setEmployees(prev => [...prev, newEmp]);
      setForm({ name: "", email: "", department: "", position: "" });
      setActivePage("employees");
      setSuccessMessage("Employee added successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      fetchStats();
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
      fetchStats();
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
  const showDashboard = () => { setActivePage("dashboard"); setFilterCard(""); };
  const showEmployees = () => { fetchEmployees(); setActivePage("employees"); setFilterCard(""); };
  const showTasks = () => { fetchTasks(); setActivePage("tasks"); setFilterCard(""); };

  // -----------------------------
  // Excel Export
  // -----------------------------
  const exportEmployeesToExcel = () => {
    if (employees.length === 0) {
      alert("No data to export!");
      return;
    }
    const worksheetData = employees.map(emp => ({
      "Employee ID": emp.emp_code,
      Name: emp.name,
      Email: emp.email,
      Department: emp.department,
      Position: emp.position,
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, `Employees_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const exportTasksToExcel = () => {
    if (tasks.length === 0) {
      alert("No task data to export!");
      return;
    }
    const worksheetData = tasks.map(task => ({
      "Task ID": task.id,
      Title: task.title,
      Description: task.description,
      AssignedTo: task.assigned_to,
      Status: task.status,
      DueDate: task.due_date,
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tasks");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, `Tasks_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // -----------------------------
  // Active Employees Count
  // -----------------------------
  const activeEmployeesCount = employees.filter(emp => {
    const empTasks = tasks.filter(task => task.assigned_to && String(task.assigned_to) === String(emp.emp_code));
    if (empTasks.length === 0) return true; // no tasks assigned
    return empTasks.every(task => task.status === "Completed");
  }).length;

  // -----------------------------
  // Today Date
  // -----------------------------
  const todayDate = new Date().toISOString().slice(0, 10);

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
              <div className="stat-card total-employees" onClick={() => setFilterCard("totalEmployees")}>
                <div className="stat-title">Total Employees</div>
                <div className="stat-value">{stats.totalEmployees}</div>
              </div>

              <div className="stat-card total-tasks" onClick={() => setFilterCard("totalTasks")}>
                <div className="stat-title">Total Tasks</div>
                <div className="stat-value">{stats.totalTasks}</div>
              </div>

              <div className="stat-card pending-tasks" onClick={() => setFilterCard("pendingTasks")}>
                <div className="stat-title">Pending Tasks</div>
                <div className="stat-value">{stats.pendingTasks}</div>
              </div>

              <div className="stat-card active-employees" onClick={() => setFilterCard("activeEmployees")}>
                <div className="stat-title">Active Employees</div>
                <div className="stat-value">{activeEmployeesCount}</div>
              </div>
            </div>

            {/* Dynamic Table Below Cards */}
            {filterCard === "totalEmployees" && (
              <div className="employee-table-wrapper">
                <h3>All Employees</h3>
                <table>
                  <thead>
                    <tr>
                      <th>S.No</th>
                      <th>Employee Name (ID)</th>
                      <th>Designation</th>
                      <th>Department</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((emp, idx) => (
                      <tr key={emp.id}>
                        <td>{idx + 1}</td>
                        <td>{emp.name} ({emp.emp_code})</td>
                        <td>{emp.position}</td>
                        <td>{emp.department}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {(filterCard === "totalTasks" || filterCard === "pendingTasks") && (
              <div className="tasks-table-wrapper">
                <h3>{filterCard === "totalTasks" ? "All Tasks" : "Pending Tasks"}</h3>
                <table>
                  <thead>
                    <tr>
                      <th>S.No</th>
                      <th>Employee Name (ID)</th>
                      <th>Designation</th>
                      <th>No. of Tasks</th>
                      <th>Current Day Tasks</th>
                      <th>Previous Tasks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((emp, idx) => {
                      const empTasks = tasks.filter(task => task.assigned_to && String(task.assigned_to) === String(emp.emp_code));
                      const filteredTasks = filterCard === "pendingTasks"
                        ? empTasks.filter(t => t.status !== "Completed")
                        : empTasks;

                      const currentDayTasks = filteredTasks.filter(
                        t => t.due_date && t.due_date.slice(0,10) === todayDate
                      );
                      const previousTasks = filteredTasks.filter(
                        t => t.due_date && t.due_date.slice(0,10) < todayDate
                      );

                      return (
                        <tr key={emp.id}>
                          <td>{idx + 1}</td>
                          <td>{emp.name} ({emp.emp_code})</td>
                          <td>{emp.position}</td>
                          <td>{filteredTasks.length}</td>
                          <td>{currentDayTasks.length}</td>
                          <td>{previousTasks.length}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Employees Section */}
        {activePage === "employees" && (
          <div>
            <button className="back-btn" onClick={() => setActivePage("dashboard")}>
              ← Back to Dashboard
            </button>
            <form onSubmit={handleSubmit} className="empform">
              <h2>Add New Employee</h2><br />
              <input type="text" name="name" placeholder="Enter employee name" value={form.name} onChange={handleChange} required disabled={isSubmitting} />
              <input type="email" name="email" placeholder="Enter email" value={form.email} onChange={handleChange} required disabled={isSubmitting} />
              <select name="department" value={form.department} onChange={handleChange} required disabled={isSubmitting}>
                <option value="">Select Department</option>
                <option value="IT">IT</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
              </select>
              <input type="text" name="position" placeholder="Enter position" value={form.position} onChange={handleChange} required disabled={isSubmitting} />
              <div className='form-group'>
                <button type="submit" disabled={isSubmitting}>ADD</button>
              </div>
            </form>

            <div className="table-header">
              <h3>Employee List</h3>
              <button className="download-btn" onClick={exportEmployeesToExcel}>⬇️ Download Excel</button>
            </div>

            <div className="employee-table-wrapper">
              <table className="employee-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Position</th>
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
                      <td>
                        <button onClick={() => deleteEmployee(emp.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Success message */}
        {successMessage && <div className="success-popup">{successMessage}</div>}

        {/* Tasks Section */}
        {activePage === "tasks" && (
          <>
            <div className="table-header">
              <h3>Assigned Tasks</h3>
              <button className="download-btn" onClick={exportTasksToExcel}>⬇️ Download Excel</button>
            </div>
            <TaskAssignForm
              activePage={activePage}
              setActivePage={setActivePage}
              tasks={tasks}
            />
          </>
        )}
      </div>
      <Footer />
    </>
  );
}
