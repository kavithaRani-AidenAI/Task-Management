import "./AdminLogin.css";
import CryptoJS from "crypto-js";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [err, setErr] = useState("");
  const [usernameErr, setUsernameErr] = useState("");
  const [passwordErr, setPasswordErr] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showMobileLogin, setShowMobileLogin] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [resendTime, setResendTime] = useState(30);
  const [otpSuccess, setOtpSuccess] = useState("");
  const [loginDisabled, setLoginDisabled] = useState(false);

  const nav = useNavigate();

  // Disable browser back
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // OTP countdown
  useEffect(() => {
    let interval;
    if (otpSent && resendTime > 0) interval = setInterval(() => setResendTime(prev => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [otpSent, resendTime]);

  // Reset transient messages when switching login mode
  useEffect(() => {
    setErr("");
    setUsernameErr("");
    setPasswordErr("");
    setOtpSuccess("");
    setOtp(["", "", "", ""]);
    setOtpSent(false);
    setResendTime(30);
  }, [showMobileLogin]);

  const handleUsernameChange = (e) => {
    const value = e.target.value.toUpperCase();
    setUsername(value);
    const usernamePattern = /^DS\d{3}$/;
    setUsernameErr(usernamePattern.test(value) ? "" : "Invalid username.");
    setLoginDisabled(false); // re-enable on edit
  };

  const handleMobileChange = (e) => {
    const value = e.target.value;
    if (/^\d{0,10}$/.test(value)) {
      setMobile(value);
      setOtpSuccess("");
      if (value.length < 10 && value.length > 0) setErr("Mobile number must be 10 digits");
      else setErr("");
    }
  };

  const handleOtpChange = (index, value) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 3) document.getElementById(`otp-${index + 1}`).focus();
      if (!value && index > 0) document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  const validateLoginForm = () => {
    const usernamePattern = /^DS\d{3}$/;
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!username || !password) { setErr("Username and password are required"); return false; }
    if (!usernamePattern.test(username)) { setErr("Invalid username format"); return false; }
    if (!passwordPattern.test(password)) { setErr("Password must include uppercase, lowercase, number, and special character"); return false; }
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

  // Clear field errors
  setUsernameErr("");
  setPasswordErr("");
  setErr("");

  const usernamePattern = /^DS\d{3}$/;
<<<<<<< HEAD
  if (!usernamePattern.test(username)) {
    setErr("Username must start with 'DS' ");
    return;
  }
=======
  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
>>>>>>> 452ab10c1880e14fcdb93f06bd0417f914bac4fd

  // Evaluate both validations without returning early so button click is honored
  const usernameInvalid = !username || !usernamePattern.test(username);
  const passwordInvalid = !password || !passwordPattern.test(password);

  if (usernameInvalid) setUsernameErr("Invalid username.");
  if (passwordInvalid) setPasswordErr("Invalid password");

  if (usernameInvalid && passwordInvalid) {
    setLoginDisabled(true);
    window.alert("Invalid username and password");
    return; // both invalid -> field-level errors already shown
  } else if (usernameInvalid) {
    return; // username invalid -> field-level error shown
  } else if (passwordInvalid) {
    return; // password invalid -> field-level error shown
  }

  if (loading) return; // prevent duplicate submits
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
        } else setErr("Unknown role. Contact admin.");
      } else {
        const msg = (data.message || '').toLowerCase();
        if (msg.includes('user') && msg.includes('not')) {
          setUsernameErr('Invalid username.');
        } else {
          setPasswordErr('Invalid password');
        }
      }
    }
    } catch (error) {
      console.error(error);
      const msg = (error?.response?.data?.message || '').toLowerCase();
      if (msg.includes('user') && msg.includes('not')) {
        setUsernameErr('Invalid username.');
      } else {
        setPasswordErr('Invalid password');
      }
    } finally { setLoading(false); }
  }

  const sendOtp = () => {
    if (!mobile || mobile.length !== 10) { setErr("Enter valid 10-digit mobile number"); setOtpSuccess(""); return; }
    setOtpSent(true); setResendTime(30); setOtpSuccess("OTP sent successfully");
    setTimeout(() => setOtpSuccess(""), 3000);
  };

  return (
    <div className="body">
      <div className="login-page">
        <div className="login-container animate-fade-in">
          {/* Company Heading */}
          <h2 className="company-title">Dreamstep Software Solutions Pvt Ltd</h2>
          <h4 className="login-title">Employee Login – Task Management System</h4>

          {/* Toggle Buttons */}
          <div className="login-toggle">
            <button
              className={!showMobileLogin ? "active" : ""}
              onClick={() => {
                setShowMobileLogin(false);
                setErr("");
                setUsernameErr("");
                setOtpSuccess("");
                setOtp(["", "", "", ""]);
                setOtpSent(false);
                setResendTime(30);
              }}
            >Employee ID</button>
            <button
              className={showMobileLogin ? "active" : ""}
              onClick={() => {
                setShowMobileLogin(true);
                setErr("");
                setUsernameErr("");
                setOtpSuccess("");
                setOtp(["", "", "", ""]);
                setResendTime(30);
              }}
            >Mobile OTP</button>
          </div>

          {/* Employee ID Login */}
          {!showMobileLogin && (
            <form onSubmit={submit} className="login-forms">

              <div className="form-group">
                <h4 className="heading">Username</h4>
                <input type="text" value={username} onChange={handleUsernameChange} placeholder="Enter Your Employee ID" required />
                {usernameErr && <p className="error">{usernameErr}</p>}
              </div>

               <div className="form-group">
                <h4 className="heading">Password</h4>
                 <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => { setPassword(e.target.value); setPasswordErr(""); setLoginDisabled(false); }} placeholder="Enter password" required />
                 <div className="password-wrapper">
                 <button type="button" className="toggle-pass" onClick={() => setShowPassword(!showPassword)}>{showPassword ? "Hide" : "Show"}</button>
                 </div>
                {passwordErr && <div className="error">{passwordErr}</div>}
              </div>
              <div className="passwordpage">
                <label className="checkrem">
                  <input type="checkbox"/>
                  Remember me
                </label>
                <a href="#" className="hyperlink">
                  Forgot password?
                </a>
              </div>

              <button className="btns" type="submit" disabled={loading || loginDisabled}>{loading ? "Loading..." : "Login"}</button> 

              {/* 👉 Forgot Password (only visible here) */}
             
            </form>
          )}

          {/* Mobile OTP Login */}
          {showMobileLogin && (
            <div className="mobile-login">
              <div className="form-group">
                <h4 className="mobile-heading">Mobile Number</h4>
                <input type="tel" value={mobile} onChange={handleMobileChange} placeholder="Enter mobile number" maxLength="10" required />
                {err && <p className="error">{err}</p>}
                {/* <button className="btn" type="submit" disabled={loading} aria-busy={loading}>
                  {loading ? "Logging in..." : "Login"}
                </button> */}
              </div>
              <button className="btns" onClick={sendOtp} disabled={mobile.length !== 10}>{otpSent ? "Login" : "Send OTP"}</button> 

              {otpSent && (
                <div className="otp-section">
                  <label>Enter 4-Digit OTP</label>
                  <div className="otp-inputs">
                    {otp.map((o, i) => (
                      <input key={i} id={`otp-${i}`} type="text" maxLength="1" value={o} onChange={(e) => handleOtpChange(i, e.target.value)} />
                    ))}
                  </div>
                  <p
                    className={resendTime > 0 ? "otp-timer" : "otp-timer resend-active"}
                    onClick={() => resendTime <= 0 && sendOtp()}
                  >
                    {resendTime > 0 ? `Resend OTP in ${resendTime}s` : "Resend OTP"}
                  </p>
                </div>
              )}
            </div>
          )}

          {otpSuccess && <div className="otp-success-popup">{otpSuccess}</div>}
        </div>
      </div>
    </div>
  );
        }
