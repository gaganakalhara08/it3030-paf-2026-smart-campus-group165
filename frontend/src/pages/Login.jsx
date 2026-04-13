import React from "react";
import "../App.css";
import logo from "../assets/logo.png";

const Login = () => {
  const handleLogin = () => {
    // Redirect to Spring Boot OAuth endpoint
    window.location.href = "http://localhost:8081/oauth2/authorization/google";
  };

  return (
    <div className="login-wrapper">
      <div className="login-box">
        <img src={logo} alt="logo" className="logo" />

        <h2 className="heading">Welcome to Campus Operations Hub</h2>

        <button className="google-btn" onClick={handleLogin}>
          Continue with Google
        </button>
      </div>
    </div>
  );
};

export default Login;