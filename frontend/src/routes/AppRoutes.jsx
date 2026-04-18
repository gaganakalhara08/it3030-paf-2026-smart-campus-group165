import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import UserDashboard from "../pages/UserDashboard";
import AdminDashboard from "../pages/AdminDashboard";
import ProtectedRoute from "./ProtectedRoute";
import CreateBooking from "../pages/user/booking/CreateBooking";
import BookingDetails from "../pages/user/booking/BookingDetails";
import BookingDashboard from "../pages/user/booking/BookingDashboard";
import BookingCheckIn from "../pages/user/booking/BookingCheckIn";
import AdminBookingDashboard from "../pages/admin/booking/AdminBookingDashboard";
import AdminAnalyticsDashboard from "../pages/admin/booking/AdminAnalyticsDashboard";
import Signup from "../pages/Signup";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Protected Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Admin Routes */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/bookings" 
          element={
            <ProtectedRoute>
              <AdminBookingDashboard />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/analytics" 
          element={
            <ProtectedRoute>
              <AdminAnalyticsDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* User Routes */}
        <Route 
          path="/user/dashboard" 
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* User Booking Management Routes */}
        <Route 
          path="/user/bookings/dashboard" 
          element={
            <ProtectedRoute>
              <BookingDashboard />
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
          path="/user/bookings/:id/check-in" 
          element={
            <ProtectedRoute>
              <BookingCheckIn />
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