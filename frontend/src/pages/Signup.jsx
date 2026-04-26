import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup } from "../services/authService";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";

const Signup = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async () => {
    try {
      await signup(form);
      alert("Account created!");
      navigate("/login");
    } catch {
      alert("Signup failed");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        <h2>Create Account</h2>

        <div className="input-group">
          <FaUser />
          <input name="name" placeholder="Name" onChange={handleChange} />
        </div>

        <div className="input-group">
          <FaEnvelope />
          <input name="email" placeholder="Email" onChange={handleChange} />
        </div>

        <div className="input-group">
          <FaLock />
          <input name="password" type="password" placeholder="Password" onChange={handleChange} />
        </div>

        <button className="primary-btn" onClick={handleSignup}>
          Sign Up
        </button>

        <p className="switch">
          Already have an account?{" "}
          <span onClick={() => navigate("/login")}>Login</span>
        </p>

      </div>
    </div>
  );
};

export default Signup;
