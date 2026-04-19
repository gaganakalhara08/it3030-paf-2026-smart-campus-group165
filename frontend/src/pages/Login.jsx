import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import logo from "../assets/logo.png";

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if token is in URL (from OAuth redirect)
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      // Store token in localStorage
      localStorage.setItem("token", token);
      console.log("✅ Token stored from OAuth redirect");
      
      // Remove token from URL and navigate to dashboard
      window.history.replaceState({}, document.title, window.location.pathname);
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleLogin = () => {
    // Redirect to Spring Boot OAuth endpoint
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
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