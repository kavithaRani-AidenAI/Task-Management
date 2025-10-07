const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());
// Temporary in-memory storage (replace with DB later)
let employees = [];
let tasks = [];


const pool = new Pool({
  connectionString:
    "postgresql://neondb_owner:npg_4sGKRac7jDBY@ep-wandering-salad-adsv8ik7-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
    })


// app.post('/admin/login', async (req, res) => {
//   const { username, password } = req.body;

//   try {
//     const result = await pool.query(
//       'SELECT * FROM admin WHERE username=$1 AND password=$2',
//       [username, password]
//     );

//     if (result.rows.length > 0) {
//       res.json({ success: true, admin: result.rows[0] });
//     } else {
//       res.status(401).json({ success: false, message: 'Invalid admin credentials' });
//     }
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// });

// Admin Stats route
// app.get("/stats", async (req, res) => {
//   try {
//     const result = await pool.query(
//       "SELECT COUNT(*) as total, COUNT(CASE WHEN status = 'Pending' THEN 1 END) as pending FROM tasks"
//     );
//     const stats = {
//       totalEmployees: employees.length,
//       totalTasks: parseInt(result.rows[0].total || 0, 10),
//       pendingTasks: parseInt(result.rows[0].pending || 0, 10)
//     };
//     res.json(stats);
//   } catch (err) {
//     console.error('Stats error:', err);
//     res.status(500).json({ error: err.message });
//   }
// });


// Employee Login
// app.post("/api/employee/login", (req, res) => {
//   const { empId, password } = req.body;
//   const employee = employees.find(e => e.id === empId && e.password === password);
//   if (employee) {
//     res.json({ success: true, employee });
//   } else {
//     res.status(401).json({ success: false, message: "Invalid employee credentials" });
//   }
// });

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find employee/admin by emp_code
    const result = await pool.query(
      "SELECT emp_code, name, department, role, password FROM emp_details WHERE emp_code = $1",
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    const user = result.rows[0];

    // ✅ Compare plain password
    if (user.password !== password) {
      return res.status(400).json({ success: false, message: "Invalid password" });
    }


    // Return role-based login response
    return res.json({
      success: true,
      role: user.role,  // 'admin' or 'employee'
      user: {
        emp_code: user.emp_code,
        name: user.name,
        department: user.department,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});



pool.connect()
  .then(() => console.log(" Connected to PostgreSQL"))
  .catch((err) => console.error("DB connection error", err));

// Routes
app.get("/", (req, res) => {
  res.send("Task API is running...");
});


//ADMIN DASHBOARD ADDING EMP DETAILS API'S

// Generate employee code like EMP001, EMP002
async function generateEmpCode() {
  const result = await pool.query("SELECT COUNT(*) FROM emp_details");
  const count = parseInt(result.rows[0].count) + 1;
  return `DS${String(count).padStart(2, "0")}`;
}

// Add new employee
app.post("/api/emp_details", async (req, res) => {
  try {
    const { name, email, department, position } = req.body;
    const emp_code = await generateEmpCode();

    const result = await pool.query(
      `INSERT INTO emp_details (emp_code, name, email, department, position) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [emp_code, name, email, department, position]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Get all employees
app.get("/api/emp_details", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM emp_details ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Delete employee
app.delete("/api/emp_details/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM employees WHERE id = $1", [id]);
    res.json({ message: "Employee deleted" });
  } catch (err) {
    res.status(500).send(err.message);
  }
});





// Task added and get in admin login API's

app.get("/api/employees", async (req, res) => {
  try {
    const result = await pool.query("SELECT emp_code, name FROM emp_details");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});


// app.get("/api/employees", async (req, res) => {
//   try {
//     const result = await pool.query(`
//       SELECT 
//         emp_code, 
//         name, 
//         emp_code || ' - ' || name AS display_name
//       FROM emp_details
//     `);
//     res.json(result.rows); // Each row will have: emp_code, name, display_name
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send("Server error");
//   }
// });

// ✅ Save task

app.get("/api/projects", async (req, res) => {
  try {
    const result = await pool.query("SELECT project_id, project_name FROM projects");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});


// GET /api/employees/:emp_code
app.get("/api/employees/:emp_code", async (req, res) => {
  const { emp_code } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM emp_details WHERE emp_code=$1",
      [emp_code]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "Employee not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// Assign Task (create new task)
app.post("/api/tasks", async (req, res) => {
  const { emp_code, project, module, submodule, task_details, assigned_from } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO task_details (emp_code, project, module, submodule, task_details, assigned_from, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'Pending', NOW())
       RETURNING *`,
      [emp_code, project, module, submodule, task_details, assigned_from]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error inserting task:", err);
    res.status(500).json({ error: "Failed to create task" });
  }
});



//GET /api/tasks
app.get("/api/tasks", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        t.task_id,
        t.emp_code,
        e.name AS emp_name,
        t.project,
        t.module,
        t.submodule,
        t.task_details,
        t.created_at,
        t.assigned_from,
        t.status
      FROM task_details t
      JOIN emp_details e ON t.emp_code = e.emp_code
      ORDER BY t.task_id DESC
    `);

     // Convert timestamps to ISO string
    const tasks = result.rows.map(task => ({
      ...task,
      created_at: task.created_at ? task.created_at.toISOString() : null
    }));

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching tasks:", err.message);
    res.status(500).send("Server error");
  }
});

// Get tasks for a particular employee
app.get("/api/tasks/:emp_code", async (req, res) => {
  const empCode = req.params.emp_code;
  try {
    const result = await pool.query(`
      SELECT t.task_id, t.emp_code, e.name AS emp_name,
             t.project, t.module, t.submodule, t.task_details,
             t.created_at, t.assigned_from, t.status, t.date
      FROM task_details t
      JOIN emp_details e ON t.emp_code = e.emp_code
      WHERE t.emp_code = $1
      ORDER BY t.created_at DESC
    `, [empCode]);

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching tasks:", err.message);
    res.status(500).send("Server error");
  }
});

// Update task status
app.put("/api/tasks/:task_id", async (req, res) => {
  const taskId = req.params.task_id;
  const { status } = req.body;

  try {
    const result = await pool.query(`
      UPDATE task_details
      SET status = $1
      WHERE task_id = $2
      RETURNING *
    `, [status, taskId]);

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating task:", err.message);
    res.status(500).send("Server error");
  }
});

// DELETE /api/tasks/:id
app.delete("/api/tasks/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM task_details WHERE task_id = $1",
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error("Error deleting task:", err.message);
    res.status(500).send("Server error");
  }
});







//app.listen(5000, () => console.log("Server running on http://localhost:5000"));
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
