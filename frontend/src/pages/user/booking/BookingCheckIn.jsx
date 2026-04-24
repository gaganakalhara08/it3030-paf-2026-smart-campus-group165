import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, Clock, MapPin, Users, Download } from "lucide-react";
import toast from "react-hot-toast";
import UserLayout from "../../../components/user/UserLayout";

const isLocalHost =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

const API_BASE_URL = isLocalHost
  ? "http://localhost:8080/api"
  : "http://" + window.location.hostname + ":8080/api";

// Set this in frontend/.env for mobile QR scan:
// VITE_APP_BASE_URL=http://192.168.1.25:5173
const APP_BASE_URL = (import.meta.env.VITE_APP_BASE_URL || window.location.origin).replace(/\/$/, "");

const BookingCheckIn = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef(null);

  async function fetchBooking() {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch(API_BASE_URL + "/bookings/" + id, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch booking");
      }

      const data = await response.json();
      setBooking(data);
    } catch (error) {
      console.error("Error fetching booking:", error);
      toast.error("Failed to load booking details");
      navigate("/user/bookings/dashboard");
    } finally {
      setLoading(false);
    }
  }

  async function generateQRCode(bookingData) {
    const QRCode = (await import("qrcode")).default;
    const canvas = canvasRef.current;

    if (canvas) {
      // Must match the React Router route: /user/bookings/:id/check-in
      const qrData = APP_BASE_URL + "/user/bookings/" + bookingData.id + "/check-in";

      try {
        await QRCode.toCanvas(canvas, qrData, {
          errorCorrectionLevel: "H",
          type: "image/png",
          quality: 0.95,
          margin: 1,
          width: 256,
          color: { dark: "#000000", light: "#ffffff" },
        });
      } catch (error) {
        console.error("Error generating QR code:", error);
        toast.error("Failed to generate QR code");
      }
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBooking();
  }, [id]);

  useEffect(() => {
    if (booking?.status === "APPROVED" && canvasRef.current) {
      generateQRCode(booking);
    }
  }, [booking]);

  const handleCheckIn = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_BASE_URL + "/bookings/" + id + "/check-in", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to check in");
      }

      toast.success("Checked in successfully!");
      fetchBooking();
    } catch (error) {
      console.error("Error checking in:", error);
      toast.error("Failed to check in");
    }
  };

  const downloadQR = () => {
    if (canvasRef.current) {
      const link = document.createElement("a");
      link.download = "booking-" + id + "-qr.png";
      link.href = canvasRef.current.toDataURL();
      link.click();
      toast.success("QR code downloaded!");
    }
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="flex items-center justify-center py-16">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" />
        </div>
      </UserLayout>
    );
  }

  if (!booking) {
    return (
      <UserLayout contentClassName="max-w-2xl">
        <button
          onClick={() => navigate("/user/bookings/dashboard")}
          className="mb-8 flex items-center gap-2 text-emerald-700 hover:text-emerald-800"
        >
          <ArrowLeft size={20} />
          Back
        </button>
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-700 shadow-sm">
          Booking not found
        </div>
      </UserLayout>
    );
  }

  const isApproved = booking.status === "APPROVED";

  return (
    <UserLayout contentClassName="max-w-2xl">
      <div>
        <button
          onClick={() => navigate("/user/bookings/dashboard")}
          className="mb-8 flex items-center gap-2 text-emerald-700 hover:text-emerald-800"
        >
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </button>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Booking Check-In</h1>
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                isApproved ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {booking.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <div>
                <p className="text-gray-500 text-sm mb-1">Resource</p>
                <p className="text-gray-800 text-lg font-semibold">{booking.resourceName}</p>
                <p className="text-gray-600 text-sm">{booking.resourceType}</p>
              </div>

              <div className="flex items-center gap-3">
                <MapPin size={18} className="text-emerald-600" />
                <div>
                  <p className="text-gray-500 text-sm">Location</p>
                  <p className="text-gray-800 font-semibold">{booking.resourceLocation}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Clock size={18} className="text-emerald-600" />
                <div>
                  <p className="text-gray-500 text-sm">Date & Time</p>
                  <p className="text-gray-800 font-semibold">{booking.bookingDate}</p>
                  <p className="text-gray-600 text-sm">
                    {booking.startTime} - {booking.endTime}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Users size={18} className="text-emerald-600" />
                <div>
                  <p className="text-gray-500 text-sm">Expected Attendees</p>
                  <p className="text-gray-800 font-semibold">{booking.expectedAttendees} people</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-500 text-sm mb-2">Purpose</p>
            <p className="text-gray-800">{booking.purpose}</p>
          </div>

          {isApproved && (
            <div className="mb-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">Check-In QR Code</h2>

              <div className="flex flex-col items-center gap-4">
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <canvas ref={canvasRef} id="qrCanvas" />
                </div>

                <button
                  onClick={downloadQR}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white transition-all hover:bg-emerald-700"
                >
                  <Download size={18} />
                  Download QR Code
                </button>

                <p className="text-gray-600 text-sm text-center">
                  Show this QR code at the venue for check-in
                </p>
              </div>
            </div>
          )}

          {isApproved && (
            <button
              onClick={handleCheckIn}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition-all hover:bg-emerald-700"
            >
              <CheckCircle size={20} />
              Check In Now
            </button>
          )}

          {!isApproved && (
            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
              <p className="font-semibold text-yellow-800">Booking not approved yet</p>
              <p className="text-sm text-yellow-700">
                Your booking status is {booking.status}. Check-in is only available for approved bookings.
              </p>
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
};

export default BookingCheckIn;
