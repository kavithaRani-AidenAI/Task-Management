import "./TaskAssignForm.css";
import * as XLSX from "xlsx";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { saveAs } from "file-saver";

export default function TaskAssignForm({ setActivePage }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
 
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [success, setSuccess] = useState(false);

  // Form state
  const [form, setForm] = useState({
    emp_code: "",
    project: "",
    module: "",
    submodule: "",
    task_details: "",
    assigned_from: "",
    status: ""
  });

  // Filter state
  const [filter, setFilter] = useState({
    employee: "",
    project: "",
    search: ""
  });

  // -----------------------------
  // Initial Data Fetch
  // -----------------------------
  useEffect(() => {
    fetchTasks();
    fetchEmployees();
    fetchProjects();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/tasks");
      setTasks(res.data);
      setFilteredTasks(res.data);
    } catch (err) {
      console.error("Error fetching tasks", err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/employees");
      setEmployees(res.data);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/projects");
      setProjects(res.data);
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  };

  // -----------------------------
  // Toast Notification
  // -----------------------------
  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      setToastMessage("");
    }, 3000);
  };

  // -----------------------------
  // Delete Task
  // -----------------------------
  const confirmDelete = (taskId) => {
    setTaskToDelete(taskId);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!taskToDelete) return;
    try {
      await axios.delete(`http://localhost:5000/api/tasks/${taskToDelete}`);
      setFilteredTasks(prev => prev.filter(task => task.task_id !== taskToDelete));
      setShowDeleteModal(false);
      setTaskToDelete(null);
      showToastMessage("Task deleted successfully!");
    } catch (err) {
      console.error("Error deleting task:", err);
      showToastMessage("Failed to delete task!");
    }
  };

  // -----------------------------
  // Form Handling
  // -----------------------------
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return; // Prevent multiple clicks
    setIsSubmitting(true);

    const admin = JSON.parse(localStorage.getItem("admin"));
    const payload = {
      ...form,
      created_at: new Date().toISOString(),
      assigned_from: admin?.name,
      status: "Pending",
    };

    if (!form.emp_code || !form.project || !form.module || !form.submodule || !form.task_details) {
      alert("Please fill all fields");
      setIsSubmitting(false);
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/tasks", payload);
      setSuccess(true);
      setForm({
        emp_code: "",
        project: "",
        module: "",
        submodule: "",
        task_details: "",
      });

      // Keep submit button disabled until success message disappears
      setTimeout(() => {
        setSuccess(false);
        setIsSubmitting(false);
      }, 2500);

      fetchTasks();
    } catch (err) {
      alert("Error assigning task!");
      console.error(err);
      setIsSubmitting(false);
    }
  };

  // -----------------------------
  // Filter Tasks
  // -----------------------------
  useEffect(() => {
    let result = [...tasks];
    if (filter.employee) result = result.filter(t => t.empname === filter.employee);
    if (filter.project) result = result.filter(t => t.project === filter.project);
    if (filter.search) {
      result = result.filter(
        t =>
          t.task_details.toLowerCase().includes(filter.search.toLowerCase()) ||
          t.module.toLowerCase().includes(filter.search.toLowerCase()) ||
          t.submodule.toLowerCase().includes(filter.search.toLowerCase())
      );
    }
    setFilteredTasks(result);
  }, [filter, tasks]);

  // -----------------------------
  // Convert UTC to IST
  // -----------------------------
  const formatToIST = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const istDate = new Date(date.getTime() + 5.5 * 60 * 60 * 1000);
    return istDate.toLocaleString('en-IN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: true
    });
  };

  // -----------------------------
  // Export Tasks to Excel
  // -----------------------------
  const exportTasksToExcel = () => {
    if (tasks.length === 0) {
      alert("No tasks to export!");
      return;
    }

    const worksheetData = tasks.map(task => ({
      "Task ID": task.task_id,
      Employee: task.emp_name + " (" + task.emp_code + ")",
      Project: task.project,
      Module: task.module,
      "Task Details": `${task.submodule || ""} --- ${task.task_details || ""}`,
      "Assigned At": formatToIST(task.created_at),
      "Assigned From": task.assigned_from,
      Status: task.status
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tasks");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, `Tasks_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  return (
    <>
      <button className="back-btn" onClick={() => setActivePage("dashboard")}>
        ← Back to Dashboard
      </button>

      <div className="form-containers">
        <h3>Assign Task</h3>
        <hr />
        <form className="task-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="lbl-align">Employee:</label>
              <select name="emp_code" value={form.emp_code} onChange={handleChange} required disabled={isSubmitting}>
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp.emp_code} value={emp.emp_code}>
                    ({emp.emp_code}) {emp.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="lbl-align">Project:</label>
              <select name="project" value={form.project} onChange={handleChange} required disabled={isSubmitting}>
                <option value="">-- Select Project --</option>
                {projects.map((proj) => (
                  <option key={proj.project_id} value={proj.project_name}>
                    {proj.project_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="lbl-align">Module:</label>
              <select name="module" value={form.module} onChange={handleChange} required disabled={isSubmitting}>
                <option value="">-- Select Module --</option>
                <option value="Module 1">Module 1</option>
                <option value="Module 2">Module 2</option>
                <option value="Module 3">Module 3</option>
              </select>
            </div>

            <div className="form-group">
              <input type="text" name="submodule" value={form.submodule} onChange={handleChange} placeholder="Enter Submodule" required disabled={isSubmitting} />
            </div>
          </div>

          <div className="form-group full-width">
            <label className="label-style">Remarks:</label>
            <textarea name="task_details" value={form.task_details} onChange={handleChange} placeholder="Enter task details here..." required disabled={isSubmitting} />
          </div>

          <div className="form-submit">
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>

        {success && <div className="popup">✅ Task added successfully!</div>}
      </div>

      {/* Assigned Tasks Table Section */}
      <div className="task-list-container">
        <div className="table-header" style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
          <h3>Assigned Tasks</h3>
          <button className="download-btn" onClick={exportTasksToExcel}>⬇️ Download Excel</button>
        </div>

        <table className="task-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Employee</th>
              <th>Project</th>
              <th>Module</th>
              <th>Task Details</th>
              <th>Assigned At</th>
              <th>Assigned From</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan="10">No tasks found</td>
              </tr>
            ) : (
              filteredTasks.map((task) => (
                <tr key={task.task_id}>
                  <td>{task.task_id}</td>
                  <td>{task.emp_name} ({task.emp_code})</td>
                  <td>{task.project}</td>
                  <td>{task.module}</td>
                  <td>{task.submodule} - {task.task_details}</td>
                  <td>{formatToIST(task.created_at)}</td>
                  <td>{task.assigned_from}</td>
                  <td style={{color:task.status === "Pending"? "red": task.status === "In Progress"? "orange": "green", fontWeight: "bold"}}>
                    {task.status}
                  </td>
                  <td>
                    <button className="delete-btn" onClick={() => confirmDelete(task.task_id)} disabled={isSubmitting}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {showDeleteModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h5>Are you sure you want to delete this task?</h5>
              <div className="modal-buttons">
                <button className="ok-btn" onClick={handleDelete}>OK</button>
                <button className="cancel-btn" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {showToast && <div className="toast">{toastMessage}</div>}
      </div>
    </>
  );
}
