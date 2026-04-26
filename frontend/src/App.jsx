import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// ============== PAGE IMPORTS ==============
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "react-hot-toast";

// ============== COMPONENT IMPORTS ==============
// Route Guards
import ProtectedRoute from "./components/ProtectedRoute";
import RoleBasedRoute from "./components/RoleBasedRoute";

// Layout Components
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Card from "./components/Card";



function App() {
  return (
    <>
      <Toaster position="top-right" />
      <AppRoutes />
    </>
  );
}

export default App;

