import "../App.css";
import "./EmployeeDashboard.css";
import Footer from "./Footer";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import DashboardHeader from "./DashboardHeader";

function EmployeeDashboard() {
  //const currentYear = new Date().getFullYear();
  const { empCode } = useParams(); // <-- DS02 will come here
  const API_BASE = "http://localhost:5000/api";
  //const emp = JSON.parse(localStorage.getItem("employee")); // logged-in employee

  const [emp, setEmp] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [completedDates, setCompletedDates] = useState([]);
  const [taskInput, setTaskInput] = useState("");
  const [project, setProject] = useState("");
  const [module, setModule] = useState("");
  const [submodule, setSubmodule] = useState("");
  const [selectedDate, setSelectedDate] = useState(currentTime.toLocaleDateString());
  const [showPopup, setShowPopup] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [successColor, setSuccessColor] = useState("green");
   const [success, setSuccess] = useState(false);
    const [filteredTasks, setFilteredTasks] = useState([]);

  //    const [showDeleteModal, setShowDeleteModal] = useState(false);
  // const [showToast, setShowToast] = useState(false);
  // const [toastMessage, setToastMessage] = useState("");

  const [form, setForm] = useState({
        emp_code: "",
        project: "",
        module: "",
        submodule: "",
        task_details: "",
        assigned_from: "",
        status:""// must match backend
  });

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch tasks assigned to this employee
  // const fetchTasks = async () => {
  //   try {
  //     const res = await axios.get(`${API_BASE}/tasks/${empCode}`); // backend route to fetch tasks by emp_code
  //     setTasks(res.data);
  //    setFilteredTasks(res.data);
  //   } catch (err) {
  //     console.error("Error fetching tasks:", err);
  //   }
  // };


const fetchTasks = async () => {
  try {
    const res = await axios.get(`${API_BASE}/tasks`);
    const allTasks = res.data || [];

    const emp = JSON.parse(localStorage.getItem("employee")) || { emp_code: empCode };
    const adm = JSON.parse(localStorage.getItem("admin"));

    let filtered = [];

    if (emp && emp.emp_code) {
      filtered = allTasks.filter(
        (task) =>
          task.emp_code?.toUpperCase() === emp.emp_code.toUpperCase() ||
          task.assigned_from?.toUpperCase() === emp.emp_code.toUpperCase()
      );
    } else if (adm && adm.username) {
      filtered = allTasks.filter(
        (task) => task.assigned_from?.toUpperCase() === adm.username.toUpperCase()
      );
    }

    setTasks(filtered);
    setFilteredTasks(filtered);
  } catch (err) {
    console.error("Error fetching tasks:", err);
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



const handleDeleteClick = (task) => {
  setTaskToDelete(task);
  setShowPopup(true);
};

    // Fetch initial data
    useEffect(() => {
      fetchProjects();
    }, []);



  useEffect(() => {
    if (empCode) fetchTasks();
    
  }, [empCode]);
    const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });   
  };

 useEffect(() => {
  if (!empCode) return;

  const fetchEmployeeDetails = async () => {
    try {
      const res = await axios.get(`${API_BASE}/employees/${empCode}`);
      setEmp(res.data); // full employee object
    } catch (err) {
      console.error("Error fetching employee details:", err);
    }
  }
  if (empCode) fetchEmployeeDetails();
}, [empCode]);

  
const handleSubmit = async (e) => {
    e.preventDefault();
   const admin = JSON.parse(localStorage.getItem("admin"));
   const employee = JSON.parse(localStorage.getItem("employee"));
     const assignedFrom = admin?.emp_code || employee?.emp_code || "self";
    const payload = {
    emp_code: empCode,
    project: form.project,
    module: form.module,
    submodule: form.submodule,
    task_details: form.task_details,
    assigned_from: assignedFrom,
    status: "Pending",
    date: selectedDate,
    created_at: new Date().toISOString(),
  };

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


  const toggleStatus = async (taskItem) => {
    const newStatus = taskItem.status === "Pending" ? "Done" : "Pending";
    try {
      const res = await axios.put(`${API_BASE}/tasks/${taskItem.task_id}`, { status: newStatus });
      setTasks(prev => prev.map(t => t.task_id === res.data.task_id ? res.data : t));
    } catch (err) {
      console.error(err);
    }
  };

  // const deleteTask = async (taskId) => {
  //   try {
  //     await axios.delete(`${API_BASE}/tasks/${taskId}`);
  //     setTasks(prev => prev.filter(t => t.task_id !== taskId));
  //     setSuccessMessage("Task deleted successfully!");
  //     setSuccessColor("red");
  //     setShowSuccessPopup(true);
  //     setTimeout(() => setShowSuccessPopup(false), 2000);
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

//   const confirmDelete  = (taskId) => {
//   const confirmAction = window.confirm("Are you sure you want to delete this task?");
//   if (confirmAction) {
//     deleteTask(taskId);
//   }
// };

  const deleteTask = async (taskId) => {
  try {
    await axios.delete(`${API_BASE}/tasks/${taskId}`);
    alert("Task deleted successfully!");
    fetchTasks(); // Refresh table after delete
  } catch (err) {
    console.error("Error deleting task:", err);
    alert("Failed to delete task.");
  }
};

  // Calendar month navigation helpers
  const [currentMonth, setCurrentMonth] = useState(currentTime.getMonth());
  const [currentYear, setCurrentYear] = useState(currentTime.getFullYear());
  const prevMonth = () => { if(currentMonth===0){setCurrentMonth(11); setCurrentYear(currentYear-1);} else setCurrentMonth(currentMonth-1); };
  const nextMonth = () => { if(currentMonth===11){setCurrentMonth(0); setCurrentYear(currentYear+1);} else setCurrentMonth(currentMonth+1); };
    const holidays = [
    new Date(currentYear, currentMonth, 5).toLocaleDateString(),
    new Date(currentYear, currentMonth, 15).toLocaleDateString(),
    new Date(currentYear, currentMonth, 25).toLocaleDateString(),
  ];
  const generateMonthGrid = (month, year) => {
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month+1, 0).getDate();
    const weeks = []; let week=[];
    for(let i=0;i<firstDay;i++) week.push(null);
    for(let d=1; d<=lastDate; d++){
      week.push(d);
      if(week.length===7){weeks.push(week); week=[];}
    }
    while(week.length>0 && week.length<7) week.push(null);
    if(week.length>0) weeks.push(week);
    return weeks;
  };

  return (
    <>
      <DashboardHeader currentUser={emp} />
      <div className="employee-dashboard-container">

        {/* Profile */}
        <div className="profile-section card">
          <img src="/tim.jpeg" alt="Profile" className="profile-photo"/>
          <div className="profile-info">
            <p><strong>Name:</strong> {emp?.name}</p>
            <p><strong>Designation:</strong> {emp?.position}</p>
            <p><strong>Department:</strong> {emp?.department}</p>
            <p><strong>Project:</strong> {emp?.project}</p>
          </div>
        </div>

        {/* Calendar */}
        <div className="calendar-section card">
          <div className="calendar-header">
            <button onClick={prevMonth}>&lt;</button>
            <span>{new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
            <button onClick={nextMonth}>&gt;</button>
          </div>
          <div className="calendar-weekdays">
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=><div key={d} className="calendar-weekday">{d}</div>)}
          </div>
          <div className="calendar-grid">
            {generateMonthGrid(currentMonth, currentYear).map((week, i) => (
              <div key={i} className="calendar-week">
                {week.map((day, idx) => {
                  if (!day) return <div key={idx} className="calendar-day empty"></div>;

                  const dateOfDay = new Date(currentYear, currentMonth, day);
                  const dateStr = dateOfDay.toLocaleDateString();
                  const isToday =
                    day === currentTime.getDate() &&
                    currentMonth === currentTime.getMonth() &&
                    currentYear === currentTime.getFullYear();
                  const isCompleted = completedDates.includes(dateStr);
                  const isHoliday = holidays.includes(dateStr);

                  let className = "calendar-day";
                  if (isCompleted) className += " completed";
                  else if (isHoliday) className += " holiday";
                  else className += " pending";
                  if (isToday) className += " today";
                  if (dateStr === selectedDate) className += " selected";

                  return (
                    <div
                      key={idx}
                      className={className}
                      onClick={() => setSelectedDate(dateStr)}
                    >
                      {day}
                      {tasks.filter(t => t.date === dateStr).length > 0 && (
                        <span className="task-badge">{tasks.filter(t => t.date === dateStr).length}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
    <div className="form-container">
      <h3>Create Task</h3>
      <br></br>
      <form className="task-form" onSubmit={handleSubmit}>
        {/* Row 1: Employee + Project */}
        <div className="form-row">


          <div className="form-group">
            <h5 className="style">Project:</h5>
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
     

        {/* Row 2: Module + Submodule */}
   
          <div className="form-group">
            <h5 className="style">Module:</h5>
            {/* <label className="lbl-align">Module:</label> */}
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
             <h5 className="sub-style">Submodule:</h5>
            {/* <label className="lbl-align">Submodule:</label> */}
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

            {/* Row 3: Remarks */}
        <div className="form-group full-width">
           <h5 className="rem-style">Remarks:</h5>
          {/* <label>Remarks:</label> */}
          <textarea
            name="task_details"
            value={form.task_details}
            onChange={handleChange}
            placeholder="Enter task details here..."
            required
          />
        </div>

        {/* Row 4: Submit */}
        <div className="form-actions">
          <button type="submit">Submit</button>
        </div>
           </div>

      
      </form>

      {success && <div className="popup">✅ Task added successfully!</div>}

  </div>
 <div className="task-list-containers">
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
      <td colSpan="10" style={{ textAlign: "center" }}>
        No tasks found
      </td>
    </tr>
  ) : (
    filteredTasks.map((task, index) => {
  const employee = JSON.parse(localStorage.getItem("employee"));
  const isSelfAssigned = task.assigned_from === employee?.emp_code;

      return (
        <tr key={index}>
      <td>{task.task_id}</td>
      <td>{task.emp_name} ({task.emp_code})</td>
      <td>{task.project}</td>
      <td>{task.module}</td>
      <td>{task.submodule}</td>
      <td>{task.task_details}</td>
      <td>{new Date(task.created_at).toLocaleString()}</td>
      <td>{task.assigned_from}</td>
      <td>{task.status}</td>
      <td>
        <button
          className="delete-btn"
          onClick={() => isSelfAssigned && handleDeleteClick(task)}
          disabled={!isSelfAssigned} // ✅ now works for self-assigned tasks
          style={{
            opacity: isSelfAssigned ? 1 : 0.5,
            cursor: isSelfAssigned ? "pointer" : "not-allowed",
          }}
        >
          Delete
        </button>
      </td>
    </tr>
      );
    })
  )}
</tbody>

  </table>

</div>

   
        

        {/* Task Table */}
    
        {/* Delete confirmation */}
        {showPopup && (
          <div className="modal-overlay">
            <div className="modal-content">
              <span className="modal-close" onClick={()=>setShowPopup(false)}>❌</span>
              <h3 style={{color:"red"}}>You want to delete this task?</h3>
              <p><strong>{taskToDelete?.task_details}</strong></p>
              <label>
                <input type="checkbox" checked={confirmDelete} onChange={e=>setConfirmDelete(e.target.checked)}/> Yes, I want to delete
              </label>
              <div className="modal-actions">
                <button className="delete-btn" disabled={!confirmDelete} onClick={()=>{
                  deleteTask(taskToDelete.task_id);
                  setShowPopup(false);
                  setConfirmDelete(false);
                }}>Delete</button>
              </div>
            </div>
          </div>
        )}

        {/* Success popup */}
{showPopup && (
  <div className="modal-overlay">
    <div className="modal-content">
      <span className="modal-close" onClick={() => setShowPopup(false)}>❌</span>
      <h3 style={{ color: "red" }}>Do you want to delete this task?</h3>
      <p><strong>{taskToDelete?.task_details}</strong></p>
      <label>
        <input
          type="checkbox"
          checked={confirmDelete}
          onChange={(e) => setConfirmDelete(e.target.checked)}
        /> Yes, I want to delete
      </label>
      <div className="modal-actions">
        <button
          className="delete-btn"
          disabled={!confirmDelete}
          onClick={() => {
            deleteTask(taskToDelete.task_id);
            setShowPopup(false);
            setConfirmDelete(false);
          }}
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}

      </div>
      <Footer/>
    </>
  );
}

export default EmployeeDashboard;
