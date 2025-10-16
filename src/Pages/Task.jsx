import React, { useEffect, useState } from "react";
import axios from "axios";
import "./TaskAssignForm.css";

function Task(props) {
  const [tasks, setTasks] = useState(Array.isArray(props.tasks) ? props.tasks : []);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [statuses, setStatuses] = useState([]); // ✅ NEW: Dynamic statuses
  
  // Filter state
  const [filter, setFilter] = useState({
    employee: "",
    project: "",
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

<<<<<<< HEAD
  // Note: employees and projects fetching is disabled to avoid delays when opening from cards
  const fetchEmployees = async () => {};
  const fetchProjects = async () => {};
=======
  // ✅ UPDATED: Cascading filters for Employee → Project → Status
  useEffect(() => {
    if (props.showFilters) {
      // Always show all employees
      const uniqueEmployees = Array.from(new Set(tasks.map(t => t.emp_name))).filter(Boolean);
      setEmployees(uniqueEmployees);

      // Filter based on current selections
      let relevantTasks = tasks;
      
      // Filter by employee if selected
      if (filter.employee) {
        relevantTasks = relevantTasks.filter(t => t.emp_name === filter.employee);
      }
      
      // Get projects from filtered tasks
      const uniqueProjects = Array.from(new Set(relevantTasks.map(t => t.project))).filter(Boolean);
      setProjects(uniqueProjects);

      // Filter by project if selected (further narrow down)
      if (filter.project) {
        relevantTasks = relevantTasks.filter(t => t.project === filter.project);
      }

      // Get statuses from the most filtered tasks
      const uniqueStatuses = Array.from(new Set(relevantTasks.map(t => t.status))).filter(Boolean);
      setStatuses(uniqueStatuses);
    }
  }, [props.showFilters, tasks, filter.employee, filter.project]); // ✅ Added filter.project as dependency

  // ✅ UPDATED: Auto-reset project and status filters if they become invalid
  useEffect(() => {
    if (filter.employee) {
      const employeeTasks = tasks.filter(t => t.emp_name === filter.employee);
      const availableProjects = Array.from(new Set(employeeTasks.map(t => t.project))).filter(Boolean);
      
      // Reset project if it's not available for selected employee
      if (filter.project && !availableProjects.includes(filter.project)) {
        setFilter(prev => ({ ...prev, project: "", status: "" }));
        return;
      }

      // Reset status if it's not available for selected employee + project
      if (filter.project && filter.status) {
        const projectTasks = employeeTasks.filter(t => t.project === filter.project);
        const availableStatuses = Array.from(new Set(projectTasks.map(t => t.status))).filter(Boolean);
        
        if (!availableStatuses.includes(filter.status)) {
          setFilter(prev => ({ ...prev, status: "" }));
        }
      }
    }
  }, [filter.employee, filter.project, tasks]);
>>>>>>> 4112264134e441453aa98281c2897b894eec8558

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

  return (
    <div className="task-list-container">
      <h2>{props.taskType === "pendingTasks" ? "Pending Tasks" : props.taskType === "completedTasks" ? "Completed Tasks" : "All Tasks"}</h2>

      {/* Filters */}
      <div className="filters">
<<<<<<< HEAD
        

        
        
=======
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
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <input type="date" value={filter.fromDate} onChange={e => setFilter({ ...filter, fromDate: e.target.value })} />
            <input type="date" value={filter.toDate} onChange={e => setFilter({ ...filter, toDate: e.target.value })} />
            <input type="text" placeholder="Search task/module/submodule" value={filter.search} onChange={e => setFilter({ ...filter, search: e.target.value })} />
            <button onClick={() => setFilter({ employee: "", project: "", status: "", fromDate: "", toDate: "", search: "" })}>Clear</button>
          </div>
        )}
>>>>>>> 4112264134e441453aa98281c2897b894eec8558
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
