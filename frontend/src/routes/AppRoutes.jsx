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
import UserManagement from "../pages/admin/user/UserManagement";

// ── Module A: Facilities & Assets Catalogue
import AdminFacilitiesPage from "../pages/admin/resource/AdminFacilitiesPage";
import UserResourceCatalogue from "../pages/user/resource/UserResourceCatalogue";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"  element={<Login />} />
        <Route path="/"       element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Generic dashboard (redirects by role) */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

        {/* ── Admin routes ── */}
        <Route path="/admin/dashboard"  
               element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
           />

        <Route path="/admin/bookings"   
               element={
                <ProtectedRoute>
                  <AdminBookingDashboard />
                </ProtectedRoute>
              } 
          />

        <Route path="/admin/analytics"  
               element={
                <ProtectedRoute>
                  <AdminAnalyticsDashboard />
                </ProtectedRoute>
               }
           />

        <Route path="/admin/users"      
               element={
                <ProtectedRoute>
                  <UserManagement />
                </ProtectedRoute>
              } 
           />

        {/* Module A — Admin Facilities Management */}
        <Route path="/admin/facilities" 
               element={
                <ProtectedRoute>
                  <AdminFacilitiesPage />
                </ProtectedRoute>
              } 
          />

        {/* ── User routes ── */}
        <Route path="/user/dashboard"              
               element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
            } 
         />

        <Route path="/user/bookings/dashboard"     
               element={
                <ProtectedRoute>
                  <BookingDashboard />
                </ProtectedRoute>
              } 
         />

        <Route path="/user/bookings/create"        
               element={
                <ProtectedRoute>
                  <CreateBooking />
                </ProtectedRoute>
              } 
         />

        <Route path="/user/bookings/:id/check-in"  
               element={
                <ProtectedRoute>
                  <BookingCheckIn />
                </ProtectedRoute>
              } 
         />
        <Route path="/user/bookings/:id"           
               element={
                <ProtectedRoute>
                  <BookingDetails />
                </ProtectedRoute>
              } 
         />

        {/* Module A — User Resource Catalogue */}
        <Route path="/user/resources" 
               element={
                <ProtectedRoute>
                  <UserResourceCatalogue />
                </ProtectedRoute>
              } 
         />
         
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
