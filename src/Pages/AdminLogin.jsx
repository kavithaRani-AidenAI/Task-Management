import "./AdminLogin.css";
import CryptoJS from "crypto-js";
import Footer from "./Footer";
import Header from "./Header";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
    const [usernameErr, setUsernameErr] = useState("");

  const nav = useNavigate();
  // ✅ Disable forward navigation when on the login page
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
    };
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

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

// async function submit(e) {
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
//  if (usernameErr) {
//       setErr("Please enter the correct username");
//       return;
//     }
//   setLoading(true);

//   try {
//     // ✅ Hash the password before sending
//     const hashedPassword = CryptoJS.SHA256(password).toString();

//     const res = await axios.post("http://localhost:5000/api/login", {
//       username,
//       password: hashedPassword, // send hashed password
//     });

//     if (res.data.success) {
//       // const role = res.data.role?.toLowerCase(); // sanitize role
//       // const user = res.data.user;

//       // Store user info in localStorage
//       // localStorage.setItem("user", JSON.stringify(user));
//       // localStorage.setItem("role", role);

//       // Navigate based on role
//       // if (role === "admin") {
//       //   nav("/admin-dashboard");
//       // } else if (role === "employee") {
//       //   nav(`/employee-dashboard/${user.emp_code}`);
//       // } else {
//       //   setErr("Unknown role. Please contact administrator.");
//       // }
//       if (res.data.role === "admin") {
//           localStorage.setItem("admin", JSON.stringify(res.data.user));
//           nav("/admin-dashboard");
//         } else if (res.data.role === "employee") {
//           localStorage.setItem("employee", JSON.stringify(res.data.user));
//           nav(`/employee-dashboard/${res.data.user.emp_code}`);
//         }
//     } else {
//       setErr(res.data.message || "Login failed");
//     }
//   } catch (error) {
//     console.error(error);
//     setErr(error?.response?.data?.message || "Server error. Please try again.");
//   } finally {
//     setLoading(false);
//   }
// }

async function submit(e) {
  e.preventDefault();
  setErr("");

  // Username validation
  const usernamePattern = /^DS\d{3}$/;
  if (!usernamePattern.test(username)) {
    setErr("Username must start with 'DS' ");
    return;
  }

  if (!username || !password) {
    setErr("Please enter both username and password");
    return;
  }

  if (usernameErr) {
    setErr("Please enter the correct username");
    return;
  }

  setLoading(true);

  try {
    // ✅ Hash the password before sending
    const hashedPassword = CryptoJS.SHA256(password).toString();

    const res = await axios.post("http://localhost:5000/api/login", {
      username,
      password: hashedPassword,
    });

    const data = res.data;

    if (data.success) {
      const role = data.role?.toLowerCase();
      const user = data.user;

      // ✅ Store role and user data
      localStorage.setItem("role", role);
      //localStorage.setItem("user", JSON.stringify(user));

      // ✅ Navigate based on role
if (role === "admin") {
        // ✅ Store admin separately for TaskAssignForm
        localStorage.setItem("admin", JSON.stringify({
          emp_code: user.emp_code, // ensure backend returns emp_code
          name: user.name,
          position:user.position
          // add other fields if needed
        }));
        nav("/admin-dashboard");
      } else if (role === "employee") {
        // Employee dashboard requires emp_code
        if (user?.emp_code) {
          nav(`/employee-dashboard/${user.emp_code}`);
        } else {
          setErr("Employee code not found. Contact admin.");
        }
      } else {
        setErr("Unknown role. Please contact administrator.");
      }
    } else {
      setErr(data.message || "Login failed");
    }
  } catch (error) {
    console.error("Login error:", error);
    setErr(error?.response?.data?.message || "Server error. Please try again.");
  } finally {
    setLoading(false);
  }
}


 const handleUsernameChange = (e) => {
    const value = e.target.value.toUpperCase(); // optional: auto-uppercase DS
    setUsername(value);

    const usernamePattern = /^DS\d{3}$/;
    if (!usernamePattern.test(value)) {
      setUsernameErr("Username must start with 'DS' followed by 3 digits (e.g., DS001)");
    } else {
      setUsernameErr("");
    }
  };



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
                   onChange={handleUsernameChange}
                  placeholder="Enter Emp Id"
                  required
                />
                {usernameErr && <p style={{ color: "red", marginTop: "2px" }}>{usernameErr}</p>}
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
