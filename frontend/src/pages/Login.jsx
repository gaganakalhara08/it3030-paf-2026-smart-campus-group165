import React from "react";

const Login = () => {
  const handleLogin = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/auth/google-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "test@gmail.com",
          name: "Test User",
          pictureUrl: "https://via.placeholder.com/150",
        }),
      });

      const data = await res.json();

      // Save token + user
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirect
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <img src="/logo.png" alt="logo" style={styles.logo} />

        <h2>Welcome to CampusOps</h2>
        <p>Secure login powered by Google</p>

        <button onClick={handleLogin} style={styles.button}>
          Continue with Google
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f6fa",
  },
  card: {
    padding: "40px",
    background: "#fff",
    borderRadius: "10px",
    textAlign: "center",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  },
  logo: {
    width: "80px",
    marginBottom: "20px",
  },
  button: {
    marginTop: "20px",
    padding: "10px 20px",
    border: "none",
    backgroundColor: "#4285F4",
    color: "#fff",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default Login;