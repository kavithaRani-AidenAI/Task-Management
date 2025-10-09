import bodyParser from "body-parser";
import cors from "cors";
import crypto from "crypto";
import dotenv from "dotenv";
import express from "express";
import pg from "pg";

dotenv.config(); // Load environment variables from .env

const { Pool } = pg;

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());



const pool = new Pool({
  connectionString:
    "postgresql://neondb_owner:npg_4sGKRac7jDBY@ep-wandering-salad-adsv8ik7-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
    })




// Utility: Hash password with SHA-256
const hashPassword = (password) =>
  crypto.createHash("sha256").update(password).digest("hex");

// ======================================
//  LOGIN (admin only)
// ======================================


// app.post("/api/login", async (req, res) => {
//   const { username, password } = req.body;

//   try {
//     if (!username || !password) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Username and password are required" });
//     }

//     // ✅ Validate username pattern (must start with DS and followed by 3 digits)
//     const usernamePattern = /^DS\d{3}$/;
//     if (!usernamePattern.test(username)) {
//       return res
//         .status(400)
//         .json({
//           success: false,
//           message: "Username must start with 'DS' followed by 3 digits (e.g., DS001)",
//         });
//     }

//     // ✅ First, check in the admin table
//     const adminResult = await pool.query(
//       "SELECT id, username, password, created_at FROM admin WHERE username = $1",
//       [username]
//     );

//     if (adminResult.rows.length > 0) {
//       const admin = adminResult.rows[0];

//       // Compare hashed passwords (frontend sends SHA-256 hashed password)
//       if (admin.password !== password) {
//         return res
//           .status(400)
//           .json({ success: false, message: "Invalid password" });
//       }

//       // ✅ Successful admin login
//       return res.json({
//         success: true,
//         role: "admin",
//         user: {
//           id: admin.id,
//           username: admin.username,
//           created_at: admin.created_at,
//         },
//       });
//     }

//     // ✅ If not admin, check in emp_details table
//     const empResult = await pool.query(
//       "SELECT emp_code, name, department, role, password FROM emp_details WHERE emp_code = $1",
//       [username]
//     );

//     if (empResult.rows.length === 0) {
//       return res.status(400).json({ success: false, message: "User not found" });
//     }

//     const user = empResult.rows[0];

//     // ✅ Compare hashed password (frontend also sends SHA256 hash)
//     if (user.password !== password) {
//       return res.status(400).json({ success: false, message: "Invalid password" });
//     }

//     // ✅ Successful employee login
//     return res.json({
//       success: true,
//       role: user.role, // 'employee' or 'admin' if exists
//       user: {
//         emp_code: user.emp_code,
//         name: user.name,
//         department: user.department,
//       },
//     });
//   } catch (err) {
//     console.error("Login error:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });


// app.post("/api/login", async (req, res) => {
//   const { username, password } = req.body;

//   try {
//     if (!username || !password) {
//       return res.status(400).json({
//         success: false,
//         message: "Username and password are required",
//       });
//     }

//     // ✅ Validate username pattern (must start with DS and followed by 3 digits)
//     const usernamePattern = /^DS\d{3}$/;
//     if (!usernamePattern.test(username)) {
//       return res.status(400).json({
//         success: false,
//         message: "Username must start with 'DS' followed by 3 digits (e.g., DS001)",
//       });
//     }

//     // ✅ First, check in the admin table
//     const adminResult = await pool.query(
//       "SELECT id, username, password, created_at FROM admin WHERE username = $1",
//       [username]
//     );

//     if (adminResult.rows.length > 0) {
//       const admin = adminResult.rows[0];

//       // Compare hashed passwords (frontend sends SHA-256 hashed password)
//       if (admin.password !== password) {
//         return res.status(400).json({ success: false, message: "Invalid password" });
//       }

//       // ✅ Successful admin login
//       return res.json({
//         success: true,
//         role: "admin",
//         user: {
//           id: admin.id,
//           username: admin.username,
//           created_at: admin.created_at,
//         },
//       });
//     }

//     // ✅ If not admin, check in emp_details table
//     const empResult = await pool.query(
//       "SELECT emp_code, name, department, role, password FROM emp_details WHERE emp_code = $1",
//       [username]
//     );

//     if (empResult.rows.length === 0) {
//       return res.status(400).json({ success: false, message: "User not found" });
//     }

//     const user = empResult.rows[0];

//     // ✅ Compare hashed password (frontend also sends SHA256 hash)
//     if (user.password !== password) {
//       return res.status(400).json({ success: false, message: "Invalid password" });
//     }

//     // ✅ Determine role dynamically: any emp_code starting with "DS" is employee
//     let userRole = "employee"; // default role for employees
//     if (user.role && user.role.toLowerCase() === "admin") {
//       userRole = "admin"; // in case role column says admin
//     }

//     // ✅ Successful employee login
//     return res.json({
//       success: true,
//       role: userRole,
//       user: {
//         emp_code: user.emp_code,
//         name: user.name,
//         department: user.department,
//       },
//     });
//   } catch (err) {
//     console.error("Login error:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    // Validate username pattern
    const usernamePattern = /^DS\d{3}$/;
    if (!usernamePattern.test(username)) {
      return res.status(400).json({
        success: false,
        message: "Username must start with 'DS' followed by 3 digits (e.g., DS001)",
      });
    }

    // ✅ Step 1: Verify credentials in admin table
    const adminResult = await pool.query(
      "SELECT id, username, password, role, created_at FROM admin WHERE username = $1",
      [username]
    );

    if (adminResult.rows.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "User not found in admin table" });
    }

    const adminUser = adminResult.rows[0];

    // Compare password
    if (adminUser.password !== password) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid password" });
    }

    // ✅ Step 2: Role-based logic
    let userData = {
      id: adminUser.id,
      username: adminUser.username,
      role: adminUser.role,
      created_at: adminUser.created_at,
    };

    // If employee → fetch from emp_details
    if (adminUser.role.toLowerCase() === "employee") {
      const empResult = await pool.query(
        "SELECT emp_code, name, department FROM emp_details WHERE emp_code = $1",
        [username]
      );

      if (empResult.rows.length === 0) {
        return res
          .status(400)
          .json({ success: false, message: "Employee details not found" });
      }

      const empUser = empResult.rows[0];

      userData = {
        ...userData,
        emp_code: empUser.emp_code,
        name: empUser.name,
        department: empUser.department,
      };
    }

    // ✅ Step 3: Success response
    return res.json({
      success: true,
      role: adminUser.role,
      user: userData,
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




async function generateEmpCode() {
  const result = await pool.query("SELECT COUNT(*) FROM emp_details");
  const count = parseInt(result.rows[0].count, 10); // convert to number
  const nextNumber = count + 1; // next employee number
  return `DS${String(nextNumber).padStart(3, "0")}`; // always start from DS001
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
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
