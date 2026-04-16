import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import UserDashboard from "../pages/UserDashboard";
import ProtectedRoute from "../components/ProtectedRoute";
import CreateBooking from "../pages/user/booking/CreateBooking";
import BookingDetails from "../pages/user/booking/BookingDetails";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Login />} />
        
        {/* Protected Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* User Booking Management Routes */}
        <Route 
          path="/user/bookings" 
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/user/bookings/create" 
          element={
            <ProtectedRoute>
              <CreateBooking />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/user/bookings/:id" 
          element={
            <ProtectedRoute>
              <BookingDetails />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;