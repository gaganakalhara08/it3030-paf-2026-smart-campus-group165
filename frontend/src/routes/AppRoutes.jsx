import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import LandingPage from "../pages/LandingPage";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Dashboard from "../pages/Dashboard";
import UserDashboard from "../pages/UserDashboard";
import AdminDashboard from "../pages/AdminDashboard";
import TechnicianDashboard from "../pages/TechnicianDashboard";
import TicketStudentView from "../pages/TicketStudentView";
import TicketAllView from "../pages/TicketAllView";
import CreateTicketModal from "../components/CreateTicketModal";
import TicketCommentSection from "../components/TicketCommentSection";
import ProtectedRoute from "./ProtectedRoute";
import CreateBooking from "../pages/user/booking/CreateBooking";
import BookingDetails from "../pages/user/booking/BookingDetails";
import BookingDashboard from "../pages/user/booking/BookingDashboard";
import BookingCheckIn from "../pages/user/booking/BookingCheckIn";
import AdminBookingDashboard from "../pages/admin/booking/AdminBookingDashboard";
import AdminAnalyticsDashboard from "../pages/admin/booking/AdminAnalyticsDashboard";
import UserManagement from "../pages/admin/user/UserManagement";
import AdminFacilitiesPage from "../pages/admin/resource/AdminFacilitiesPage";
import AdminResourceAnalytics from "../pages/admin/resource/AdminResourceAnalytics";
import UserResourceCatalogue from "../pages/user/resource/UserResourceCatalogue";

const protect = (component) => <ProtectedRoute>{component}</ProtectedRoute>;

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route path="/dashboard" element={protect(<Dashboard />)} />

      <Route path="/admin/dashboard" element={protect(<AdminDashboard />)} />
      <Route path="/admin/bookings" element={protect(<AdminBookingDashboard />)} />
      <Route path="/admin/analytics" element={protect(<AdminAnalyticsDashboard />)} />
      <Route path="/admin/tickets" element={protect(<TicketAllView />)} />
      <Route path="/admin/users" element={protect(<UserManagement />)} />
      <Route path="/admin/facilities" element={protect(<AdminFacilitiesPage />)} />
      <Route path="/admin/resource-analytics" element={protect(<AdminResourceAnalytics />)} />

      <Route path="/technician/dashboard" element={protect(<TechnicianDashboard />)} />

      <Route path="/user/dashboard" element={protect(<UserDashboard />)} />
      <Route path="/user/dashboard/tickets" element={protect(<TicketStudentView />)} />
      <Route path="/user/dashboard/create" element={protect(<CreateTicketModal />)} />
      <Route path="/user/dashboard/comment" element={protect(<TicketCommentSection />)} />
      <Route path="/user/resources" element={protect(<UserResourceCatalogue />)} />
      <Route path="/user/bookings/dashboard" element={protect(<BookingDashboard />)} />
      <Route path="/user/bookings/create" element={protect(<CreateBooking />)} />
      <Route path="/user/bookings/:id/check-in" element={protect(<BookingCheckIn />)} />
      <Route path="/user/bookings/check-in/:id" element={protect(<BookingCheckIn />)} />
      <Route path="/user/bookings/:id" element={protect(<BookingDetails />)} />
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;
