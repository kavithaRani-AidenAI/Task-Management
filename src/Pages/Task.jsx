import React, { useEffect, useState } from "react";
import axios from "axios";
import "./TaskAssignForm.css";

function Task(props) {
  const [tasks, setTasks] = useState(Array.isArray(props.tasks) ? props.tasks : []);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  
  // Filter state
  const [filter, setFilter] = useState({
    employee: "",
    project: "",
    status: "",
    fromDate: "",
    toDate: "",
    search: ""
  });

  // Initialize from props if provided, otherwise fetch
  useEffect(() => {
    if (Array.isArray(props.tasks) && props.tasks.length >= 0) {
      setTasks(props.tasks);
      setFilteredTasks(props.tasks);
    } else {
      fetchTasks();
    }
    // Only fetch employees/projects if we actually render filters (currently hidden)
    // Skipping these extra requests improves perceived load when opened from cards
  }, [props.tasks]);

  const fetchTasks = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/tasks");
      setTasks(res.data);
      setFilteredTasks(res.data);
    } catch (err) {
      console.error("Error fetching tasks", err);
    }
  };

  // When used as a dedicated page with filters, populate dropdown data
  useEffect(() => {
    if (props.showFilters) {
      const uniqueEmployees = Array.from(new Set(tasks.map(t => t.emp_name))).filter(Boolean);
      const uniqueProjects = Array.from(new Set(tasks.map(t => t.project))).filter(Boolean);
      const uniqueStatuses = Array.from(new Set(tasks.map(t => t.status))).filter(Boolean);
      setEmployees(uniqueEmployees);
      setProjects(uniqueProjects);
      // ensure status values exist even if tasks are empty
      if (uniqueStatuses.length === 0) {
        // no-op, we'll render fixed list
      }
    }
  }, [props.showFilters, tasks]);

  // Filter tasks based on employee, project, and search
  useEffect(() => {
    let result = [...tasks];

    if (filter.employee) {
      result = result.filter(t => t.emp_name === filter.employee);
    }

    if (filter.project) {
      result = result.filter(t => t.project === filter.project);
    }

    if (filter.search) {
      result = result.filter(
        t =>
          t.task_details?.toLowerCase().includes(filter.search.toLowerCase()) ||
          t.module?.toLowerCase().includes(filter.search.toLowerCase()) ||
          t.submodule?.toLowerCase().includes(filter.search.toLowerCase())
      );
    }

    if (filter.status) {
      result = result.filter(t => (t.status || "").toLowerCase() === filter.status.toLowerCase());
    }

    if (filter.fromDate || filter.toDate) {
      const from = filter.fromDate ? new Date(filter.fromDate) : null;
      const to = filter.toDate ? new Date(filter.toDate) : null;
      result = result.filter(t => {
        if (!t.created_at) return false;
        const created = new Date(t.created_at);
        // convert to IST date-only string for inclusive comparison
        const ist = new Date(created.getTime() + 5.5 * 60 * 60 * 1000);
        const ymd = ist.toISOString().slice(0,10);
        const current = new Date(ymd + "T00:00:00Z");
        if (from && current < new Date(new Date(filter.fromDate).toISOString().slice(0,10) + "T00:00:00Z")) return false;
        if (to && current > new Date(new Date(filter.toDate).toISOString().slice(0,10) + "T00:00:00Z")) return false;
        return true;
      });
    }

    setFilteredTasks(result);
  }, [filter, tasks]);

  // Convert UTC to IST
  const formatToIST = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const istDate = new Date(date.getTime() + 5.5 * 60 * 60 * 1000);
    return istDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true
    });
  };
  const pendingTasks = tasks.filter(task => task.status === "Pending");
  const completedTasks = tasks.filter(task => task.status === "Completed");
  // Decide which tasks to show
  const displayedTasks = props.taskType === "pendingTasks"
    ? pendingTasks
    : props.taskType === "completedTasks"
      ? completedTasks
      : filteredTasks;

  // Notify parent about the current displayed list (for export)
  useEffect(() => {
    if (typeof props.onFilteredChange === "function") {
      props.onFilteredChange(displayedTasks);
    }
  }, [displayedTasks, props]);

  return (
    <div className="task-list-container">
      <h2>{props.taskType === "pendingTasks" ? "Pending Tasks" : props.taskType === "completedTasks" ? "Completed Tasks" : "All Tasks"}</h2>

      {/* Filters */}
      <div className="filters">
        {props.showFilters && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10, alignItems: "center" }}>
            <select value={filter.employee} onChange={e => setFilter({ ...filter, employee: e.target.value })}>
              <option value="">Filter by Name</option>
              {employees.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            <select value={filter.project} onChange={e => setFilter({ ...filter, project: e.target.value })}>
              <option value="">Filter by Project</option>
              {projects.map(project => (
                <option key={project} value={project}>{project}</option>
              ))}
            </select>
            <select value={filter.status} onChange={e => setFilter({ ...filter, status: e.target.value })}>
              <option value="">Filter by Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
            <input type="date" value={filter.fromDate} onChange={e => setFilter({ ...filter, fromDate: e.target.value })} />
            <input type="date" value={filter.toDate} onChange={e => setFilter({ ...filter, toDate: e.target.value })} />
            <input type="text" placeholder="Search task/module/submodule" value={filter.search} onChange={e => setFilter({ ...filter, search: e.target.value })} />
            <button onClick={() => setFilter({ employee: "", project: "", status: "", fromDate: "", toDate: "", search: "" })}>Clear</button>
          </div>
        )}
      </div>

      {/* Tasks Table */}
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
          </tr>
        </thead>
        <tbody>
          {displayedTasks.length === 0 ? (
            <tr>
              <td colSpan="8" style={{ textAlign: "center" }}>
                No tasks found
              </td>
            </tr>
          ) : (
            displayedTasks.map((task) => (
              <tr key={task.task_id}>
                <td>{task.task_id}</td>
                <td>
                  {task.emp_name} ({task.emp_code})
                </td>
                <td>{task.project}</td>
                <td>{task.module}</td>
                <td>
                  {task.submodule} - {task.task_details}
                </td>
                <td>{formatToIST(task.created_at)}</td>
                <td>{task.assigned_from}</td>
                <td>{task.status}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Task;
