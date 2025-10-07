
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../API';
import './AdminLogin.css';
import Footer from './Footer';
import Header from './Header';
import axios from "axios";

export default function AdminLogin(){
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  //  async function submit(e){
  //   e.preventDefault();
  //   setErr('');
  //   if (!username || !password) {
  //     setErr('Please enter both username and password');
  //     return;
  //   }
  //   setLoading(true);
  //   try {
  //     const res = await API.post('/admin/login', { username, password });
  //     if (res?.data?.success && res?.data?.admin) {
  //       localStorage.setItem('admin', JSON.stringify(res.data.admin));
  //       nav('/admin-dashboard');
  //     } else {
  //       setErr('Login failed');
  //     }
  //   } catch (error){
  //     setErr(error?.response?.data?.message || 'Login failed');
  //   } finally {
  //     setLoading(false);
  //   }
  // }

   async function submit(e) {
    e.preventDefault();
    setErr("");

    if (!username || !password) {
      setErr("Please enter both username and password");
      return;
    }

    setLoading(true);
    try {
      const res=await axios.post("http://localhost:5000/api/login", { username, password });
      // const res = await API.post("/login", );

      if (res.data.success) {
        if (res.data.role === "admin") {
          localStorage.setItem("admin", JSON.stringify(res.data.user));
          nav("/admin-dashboard");
        } else if (res.data.role === "employee") {
          localStorage.setItem("employee", JSON.stringify(res.data.user));
          nav(`/employee-dashboard/${res.data.user.emp_code}`);
        }
      } else {
        setErr(res.data.message || "Login failed");
      }
    } catch (error) {
      setErr(error?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
   <Header currentUser={null} /> 
    <div 
      className="alignment">
      
      <div id="adminLogin" class="page active">
        <div className='header'>
          {/* <h1>Employee Task Management System</h1> */}
          <h2 className='headerst'>Employee Login</h2>
       
       </div>
      <form onSubmit={submit}>
         <div className="login-form">
        <div className="form-group">
          <label>Username</label>
          <input value={username} onChange={e=>setUsername(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input value={password} type="password" onChange={e=>setPassword(e.target.value)} />
        </div>
         {err && <div style={{ color: "red" }}>{err}</div>}
        <div className='form-group'>
          <button className="btn" type="submit">Login</button>
        </div>
        {/* <div className='form-group'>
        <button className="btn" type="submit">Login as Admin</button>
        <button className="btn btn-secondary" type="button" onClick={()=>nav('/employee-login')}>Employee Login</button>
        {err && <div style={{color:'red'}}>{err}</div>}
        </div> */}
        </div>
      </form>
    </div>
    </div>
    <Footer />
    </>
  );
}
