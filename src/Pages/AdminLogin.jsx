import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CryptoJS from "crypto-js";
import Header from "./Header";
import Footer from "./Footer";
import "./AdminLogin.css";


export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const validateForm = () => {
    const usernameRegex = /^DS\d{3}$/;
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!username || !password) {
      setErr("Username and password are required");
      return false;
    }
    if (!usernameRegex.test(username)) {
      setErr('Username must start with "DS" followed by exactly 3 digits (e.g., DS001)');
      return false;
    }
    if (!passwordRegex.test(password)) {
      setErr(
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character"
      );
      return false;
    }
    return true;
  };

//  async function submit(e) {
//   e.preventDefault();
//   setErr("");

//   // Username validation: must start with DS followed by exactly 3 digits
//   const usernamePattern = /^DS\d{3}$/;
//   if (!usernamePattern.test(username)) {
//     setErr("Username must start with 'DS' followed by 3 digits (e.g., DS001)");
//     return;
//   }

//   if (!username || !password) {
//     setErr("Please enter both username and password");
//     return;
//   }

//   setLoading(true);
//   try {
//     // ✅ Hash the password before sending
//     const hashedPassword = CryptoJS.SHA256(password).toString();

//     const res = await axios.post("http://localhost:5000/api/login", {
//       username,
//       password: hashedPassword, // send hashed password
//     });

//     if (res.data.success) {
//       if (res.data.role === "admin") {
//         localStorage.setItem("admin", JSON.stringify(res.data.user));
//         nav("/admin-dashboard");
//       } else if (res.data.role === "employee") {
//         localStorage.setItem("employee", JSON.stringify(res.data.user));
//         nav(`/employee-dashboard/${res.data.user.emp_code}`);
//       }
//     } else {
//       setErr(res.data.message || "Login failed");
//     }
//   } catch (error) {
//     setErr(error?.response?.data?.message || "Login failed");
//   } finally {
//     setLoading(false);
//   }
// }

async function submit(e) {
  e.preventDefault();
  setErr("");

  // Username validation: must start with DS followed by exactly 3 digits
  const usernamePattern = /^DS\d{3}$/;
  if (!usernamePattern.test(username)) {
    setErr("Username must start with 'DS' followed by 3 digits (e.g., DS001)");
    return;
  }

  if (!username || !password) {
    setErr("Please enter both username and password");
    return;
  }

  setLoading(true);

  try {
    // ✅ Hash the password before sending
    const hashedPassword = CryptoJS.SHA256(password).toString();

    const res = await axios.post("http://localhost:5000/api/login", {
      username,
      password: hashedPassword, // send hashed password
    });

    if (res.data.success) {
      const role = res.data.role?.toLowerCase(); // sanitize role
      const user = res.data.user;

      // Store user info in localStorage
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("role", role);

      // Navigate based on role
      if (role === "admin") {
        nav("/admin-dashboard");
      } else if (role === "employee") {
        nav(`/employee-dashboard/${user.emp_code}`);
      } else {
        setErr("Unknown role. Please contact administrator.");
      }
    } else {
      setErr(res.data.message || "Login failed");
    }
  } catch (error) {
    console.error(error);
    setErr(error?.response?.data?.message || "Server error. Please try again.");
  } finally {
    setLoading(false);
  }
}



  return (
    <>
      <Header currentUser={null} />
      <div className="alignment">
        <div id="adminLogin" className="page active">
          <div className="header">
            <h2 className="headerst">Employee Login</h2>
          </div>
          <form onSubmit={submit}>
            <div className="login-form">
              <div className="form-group">
                <h4>Username</h4>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toUpperCase())}
                  placeholder="Enter Emp Id"
                  required
                />
              </div>
              <div className="form-group">
                <h4>Password</h4>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                />
              </div>
              {err && <div style={{ color: "red", marginBottom: "10px" }}>{err}</div>}
              <div className="form-group">
                <button className="btn" type="submit">
                  Login
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}
