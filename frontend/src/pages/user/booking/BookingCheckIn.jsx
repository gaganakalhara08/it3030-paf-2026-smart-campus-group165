import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, Clock, MapPin, Users, Download } from "lucide-react";
import toast from "react-hot-toast";

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

  useEffect(() => {
    fetchBooking();
  }, [id]);

  useEffect(() => {
    if (booking?.status === "APPROVED" && canvasRef.current) {
      generateQRCode(booking);
    }
  }, [booking]);

  const fetchBooking = async () => {
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
  };

  const generateQRCode = async (bookingData) => {
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
  };

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <button
          onClick={() => navigate("/user/bookings/dashboard")}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8"
        >
          <ArrowLeft size={20} />
          Back
        </button>
        <div className="text-center text-gray-700">Booking not found</div>
      </div>
    );
  }

  const isApproved = booking.status === "APPROVED";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate("/user/bookings/dashboard")}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8"
        >
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </button>

        <div className="bg-white rounded-xl shadow-lg p-8">
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
                <MapPin size={18} className="text-blue-600" />
                <div>
                  <p className="text-gray-500 text-sm">Location</p>
                  <p className="text-gray-800 font-semibold">{booking.resourceLocation}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Clock size={18} className="text-blue-600" />
                <div>
                  <p className="text-gray-500 text-sm">Date & Time</p>
                  <p className="text-gray-800 font-semibold">{booking.bookingDate}</p>
                  <p className="text-gray-600 text-sm">
                    {booking.startTime} - {booking.endTime}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Users size={18} className="text-blue-600" />
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
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 mb-8 border-2 border-blue-200">
              <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">Check-In QR Code</h2>

              <div className="flex flex-col items-center gap-4">
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <canvas ref={canvasRef} id="qrCanvas" />
                </div>

                <button
                  onClick={downloadQR}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
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
              className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
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
    </div>
  );
};

export default BookingCheckIn;
