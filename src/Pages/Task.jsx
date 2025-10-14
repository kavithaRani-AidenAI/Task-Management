import React, { useEffect, useState } from "react";
import axios from "axios";
import "./TaskAssignForm.css";

function Task(props) {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  
  // Filter state
  const [filter, setFilter] = useState({
    employee: "",
    project: "",
    search: ""
  });

  // Fetch data on component mount
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
  // Decide which tasks to show
  const displayedTasks = props.taskType === "pendingTasks" ? pendingTasks : filteredTasks;

  return (
    <div className="task-list-container">
      <h2>All Tasks</h2>

      {/* Filters */}
      <div className="filters">
        

        
        
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
