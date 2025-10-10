// TaskAssignForm.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import './TaskAssignForm.css';

export default function TaskAssignForm() {
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // State for form fields
  const [form, setForm] = useState({
        emp_code: "",
        project: "",
        module: "",
        submodule: "",
        task_details: "",
        assigned_from: "",
        status:""// must match backend
  });

  // Filter state: initialize as object
  const [filter, setFilter] = useState({
    employee: "",
    project: "",
    search: ""
  });

  const [success, setSuccess] = useState(false);

  // Fetch initial data
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

  // Show toast notification
  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      setToastMessage("");
    }, 3000);
  };

  // Open delete modal
  const confirmDelete = (taskId) => {
    setTaskToDelete(taskId);
    setShowDeleteModal(true);
  };

   // Handle delete
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

  // Handle form input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    const admin = JSON.parse(localStorage.getItem("admin"));
    const payload = { ...form, created_at: new Date().toISOString(),assigned_from: admin?.name,status: "Pending", };

    try {
      await axios.post("http://localhost:5000/api/tasks", payload);
      setSuccess(true);
       // logged-in admin
      setForm({
        emp_code: "",
        project: "",
        module: "",
        submodule: "",
        task_details: "",
      });
 
      setTimeout(() => setSuccess(false), 2500);
      fetchTasks(); // Refresh task list
    } catch (err) {
      alert("Error assigning task!");
      console.error(err);
    }
  };

  // Filter tasks whenever tasks or filter state changes
  useEffect(() => {
    let result = [...tasks];

    if (filter.employee) {
      result = result.filter((t) => t.empname === filter.employee);
    }

    if (filter.project) {
      result = result.filter((t) => t.project === filter.project);
    }

    if (filter.search) {
      result = result.filter(
        (t) =>
          t.task_details.toLowerCase().includes(filter.search.toLowerCase()) ||
          t.module.toLowerCase().includes(filter.search.toLowerCase()) ||
          t.submodule.toLowerCase().includes(filter.search.toLowerCase())
      );
    }

    setFilteredTasks(result);
  }, [filter, tasks]);

  return (
     <>
    <div className="form-containers">
      <h3>Assign Task</h3><br></br>
      <hr></hr>
      <br></br>
      <form className="task-form" onSubmit={handleSubmit}>
        {/* Row 1: Employee + Project */}
        <div className="form-row">
          <div className="form-group">
            <label className="lbl-align">Employee:</label>
          <select
              name="emp_code"
              value={form.emp_code}
              onChange={(e) => setForm({ ...form, emp_code: e.target.value })}
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp.emp_code} value={emp.emp_code}>
                  ({emp.emp_code}){emp.name}  {/* Show code + name */}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="lbl-align">Project:</label>
            <select
              name="project"
              value={form.project}
              onChange={handleChange}
              required
            >
              <option value="">-- Select Project --</option>
              {projects.map((proj) => (
          <option key={proj.project_id} value={proj.project_name}>
         {proj.project_name}
      </option>
))}
            </select>
          </div>
        </div>

        {/* Row 2: Module + Submodule */}
        <div className="form-row">
          <div className="form-group">
            <label className="lbl-align">Module:</label>
            <select
              name="module"
              value={form.module}
              onChange={handleChange}
              required
            >
              <option value="">-- Select Module --</option>
              <option value="Module 1">Module 1</option>
              <option value="Module 2">Module 2</option>
              <option value="Module 3">Module 3</option>
            </select>
          </div>

          <div className="form-group">
            <label className="lbl-align">Submodule:</label>
            <select
              name="submodule"
              value={form.submodule}
              onChange={handleChange}
              required
            >
              <option value="">-- Select Submodule --</option>
              <option value="Submodule A">Submodule A</option>
              <option value="Submodule B">Submodule B</option>
              <option value="Submodule C">Submodule C</option>
            </select>
          </div>
        </div>

        {/* Row 3: Remarks */}
        <div className="form-group full-width">
          <label className="label-style">Remarks:</label>
          <textarea
            name="task_details"
            value={form.task_details}
            onChange={handleChange}
            placeholder="Enter task details here..."
            required
          />
        </div>

        {/* Row 4: Submit */}
        <div className="form-submit">
          <button type="submit">Submit</button>
        </div>
      </form>

      {success && <div className="popup">✅ Task added successfully!</div>}

  </div>
  
  
{/* Task List Table outside form container */}
<div className="task-list-container">
  <h3>Assigned Tasks</h3>
<br></br>


    {/* Table */}
  <table className="task-table">
    <thead>
      <tr>
        <th>ID</th>
        <th>Employee</th>
        <th>Project</th>
        <th>Module</th>
        <th>Submodule</th>
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
        <td colSpan="9">No tasks found</td>
      </tr>
    ) : (
      filteredTasks.map((task) => (
        <tr key={task.task_id}>
          <td>{task.task_id}</td>
          <td>{task.emp_name} ({task.emp_code})</td>   {/* ✅ Display concat */}
          <td>{task.project}</td>
          <td>{task.module}</td>
          <td>{task.submodule}</td>
          <td>{task.task_details}</td>
          <td>{new Date(task.created_at).toLocaleString()}</td>
          <td>{task.assigned_from}</td>
          <td>{task.status}</td>
          <td>
                  <button className="delete-btn" onClick={() => confirmDelete(task.task_id)}>
                    Delete
                  </button>
                </td>
        </tr>
      ))
    )}
  </tbody>
  </table>


    {/* Delete Confirmation Modal */}
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

      {/* Toast Notification */}
      {showToast && (
        <div className="toast">
          {toastMessage}
        </div>
      )}
</div>
    </>
  );
}
