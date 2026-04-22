import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Calendar, Users, MapPin, Send, Clock, Loader } from "lucide-react";
import toast from "react-hot-toast";
import { API_BASE_URL, getAuthHeaders } from "../../../services/api";
import ResourceAvailabilityCalendar from "../../../components/resource/ResourceAvailabilityCalendar";

const CreateBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const preselectedResourceId = location.state?.resourceId;
  const [formData, setFormData] = useState({
    resourceId: "",
    bookingDate: "",
    startTime: "",
    endTime: "",
    purpose: "",
    expectedAttendees: "",
  });

  const [resources, setResources] = useState([]);
  const [selectedResource, setSelectedResource] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resourcesLoading, setResourcesLoading] = useState(true);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityMessage, setAvailabilityMessage] = useState("");
  const [isAvailable, setIsAvailable] = useState(null);

  // Fetch resources on component mount
  useEffect(() => {
    const fetchResources = async () => {
      try {
        setResourcesLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(
          `${API_BASE_URL}/resources?status=ACTIVE&size=100&page=0`,
          {
            method: "GET",
            headers: getAuthHeaders(),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch resources");
        }

        const data = await response.json();
        const fetchedResources = data.content || [];
        setResources(fetchedResources);

        // Auto-select resource when arriving from catalogue "Book Now"
        if (preselectedResourceId) {
          const matchedResource = fetchedResources.find(
            (r) => String(r.id) === String(preselectedResourceId)
          );

          if (matchedResource) {
            setFormData((prev) => ({
              ...prev,
              resourceId: String(matchedResource.id),
            }));
            setSelectedResource(matchedResource);
          }
        }
      } catch (error) {
        console.error("Error fetching resources:", error);
        toast.error("Failed to load resources");
      } finally {
        setResourcesLoading(false);
      }
    };

    fetchResources();
  }, [navigate, preselectedResourceId]);

  const handleResourceChange = (e) => {
    const resourceId = e.target.value;
    const resource = resources.find((r) => String(r.id) === String(resourceId));
    if (resource) {
      setFormData({
        ...formData,
        resourceId: resource.id,
      });
      setSelectedResource(resource);
      setAvailabilityMessage("");
      setIsAvailable(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Reset availability check when time changes
    if (name === "startTime" || name === "endTime") {
      setAvailabilityMessage("");
      setIsAvailable(null);
    }
  };

  const checkAvailability = async () => {
    if (
      !formData.resourceId ||
      !formData.bookingDate ||
      !formData.startTime ||
      !formData.endTime
    ) {
      toast.error("Please select resource, date, start time and end time");
      return;
    }

    // Validate time
    if (formData.startTime >= formData.endTime) {
      toast.error("End time must be after start time");
      return;
    }

    setCheckingAvailability(true);
    try {
      const params = new URLSearchParams({
        resourceId: formData.resourceId,
        date: formData.bookingDate,
        startTime: `${formData.startTime}:00`,
        endTime: `${formData.endTime}:00`,
      });

      const response = await fetch(
        `${API_BASE_URL}/bookings/check-conflict?${params.toString()}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      const hasConflict = await response.json();

      if (!hasConflict) {
        setIsAvailable(true);
        setAvailabilityMessage("✓ Time slot is available");
        toast.success("Time slot is available!");
      } else {
        setIsAvailable(false);
        setAvailabilityMessage(
          "✗ Time slot is not available. Another booking exists at this time."
        );
        toast.error("Time slot is not available");
      }
    } catch (error) {
      console.error("Error checking availability:", error);
      setIsAvailable(false);
      setAvailabilityMessage("Error checking availability");
      toast.error("Failed to check availability");
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (
      !formData.resourceId ||
      !formData.bookingDate ||
      !formData.startTime ||
      !formData.endTime ||
      !formData.purpose.trim() ||
      formData.purpose.trim().length < 5 ||
      !formData.expectedAttendees
    ) {
      toast.error(
        "Please fill all required fields. Purpose must be at least 5 characters"
      );
      return;
    }

    // Check if availability was verified
    if (!isAvailable) {
      toast.error("Please check availability first and ensure slot is available");
      return;
    }

    if (
      selectedResource &&
      parseInt(formData.expectedAttendees) > selectedResource.capacity
    ) {
      toast.error(
        `Expected attendees cannot exceed resource capacity of ${selectedResource.capacity}`
      );
      return;
    }

    const toastId = toast.loading("Creating booking...");
    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          resourceId: formData.resourceId,
          bookingDate: formData.bookingDate,
          startTime: formData.startTime,
          endTime: formData.endTime,
          purpose: formData.purpose.trim(),
          expectedAttendees: parseInt(formData.expectedAttendees),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create booking");
      }

      toast.success("Booking created successfully!", { id: toastId });
      setTimeout(() => navigate("/user/bookings/dashboard"), 1500);
    } catch (error) {
      console.error("Error creating booking:", error);
      toast.error(error.message || "Failed to create booking", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#0f766e_0%,_#1e293b_45%,_#334155_100%)] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate("/user/bookings/dashboard")}
          className="mb-8 inline-flex items-center gap-2 rounded-xl border border-cyan-700/70 bg-slate-800/55 px-4 py-2 text-slate-100 backdrop-blur transition hover:border-cyan-300 hover:text-cyan-100"
        >
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </button>

        {/* Title */}
        <div className="mb-8">
          <p className="mb-2 text-4xl font-extrabold tracking-tight text-slate-50 sm:text-5xl">Create Booking</p>
          <p className="max-w-2xl text-slate-200">
            Reserve your campus resource with live availability checks and a cleaner booking experience.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Resource Selection */}
          <div className="rounded-3xl border border-cyan-800/50 bg-slate-800/65 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur">
            <label className="mb-3 block text-sm font-semibold uppercase tracking-wide text-cyan-200">
              Select Resource <span className="text-red-400">*</span>
            </label>
            {resourcesLoading ? (
              <div className="flex items-center justify-center py-8 text-slate-400">
                <Loader size={20} className="animate-spin mr-2" />
                Loading resources...
              </div>
            ) : (
              <select
                value={formData.resourceId}
                onChange={handleResourceChange}
                className="w-full rounded-2xl border border-slate-500 bg-slate-700/85 px-4 py-3 text-slate-100 transition-all focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/25"
                required
              >
                <option value="">Choose a resource...</option>
                {resources.map((resource) => (
                  <option key={resource.id} value={resource.id}>
                    {resource.name} - Capacity: {resource.capacity} ({resource.type})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Resource Details */}
          {selectedResource && (
            <div className="grid grid-cols-1 gap-4 rounded-3xl border border-cyan-500/30 bg-cyan-700/20 p-5 backdrop-blur md:grid-cols-2">
              <div className="flex items-center gap-3 text-slate-200">
                <MapPin size={18} className="text-cyan-300" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-cyan-200/80">Location</p>
                  <p className="font-semibold text-white">{selectedResource.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-slate-200">
                <Users size={18} className="text-cyan-300" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-cyan-200/80">Capacity</p>
                  <p className="font-semibold text-white">{selectedResource.capacity} people</p>
                </div>
              </div>
            </div>
          )}

          {/* Calendar view for booked slots (per day) */}
          {selectedResource && (
            <div className="rounded-3xl border border-cyan-800/50 bg-slate-800/65 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur">
              <ResourceAvailabilityCalendar resource={selectedResource} />
            </div>
          )}

          {/* Date Selection */}
          <div className="rounded-3xl border border-cyan-800/50 bg-slate-800/65 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur">
            <label className="mb-3 block text-sm font-semibold uppercase tracking-wide text-cyan-200">
              Booking Date <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                name="bookingDate"
                value={formData.bookingDate}
                onChange={handleInputChange}
                min={new Date().toISOString().split("T")[0]}
                className="w-full rounded-2xl border border-slate-500 bg-slate-700/85 px-4 py-3 text-slate-100 transition-all focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/25"
                required
              />
              <Calendar
                size={20}
                className="pointer-events-none absolute right-3 top-3 text-cyan-300"
              />
            </div>
          </div>

          {/* Time Selection */}
          {formData.bookingDate && formData.resourceId && (
            <div className="rounded-3xl border border-cyan-800/50 bg-slate-800/65 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur">
              <label className="mb-4 block text-sm font-semibold uppercase tracking-wide text-cyan-200">
                Select Time Slot <span className="text-red-400">*</span>
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Start Time */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Start Time
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      className="w-full rounded-2xl border border-slate-500 bg-slate-700/85 px-4 py-3 text-slate-100 transition-all focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/25"
                      required
                    />
                    <Clock
                      size={18}
                      className="pointer-events-none absolute right-3 top-3 text-cyan-300"
                    />
                  </div>
                </div>

                {/* End Time */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                    End Time
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      className="w-full rounded-2xl border border-slate-500 bg-slate-700/85 px-4 py-3 text-slate-100 transition-all focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/25"
                      required
                    />
                    <Clock
                      size={18}
                      className="pointer-events-none absolute right-3 top-3 text-cyan-300"
                    />
                  </div>
                </div>
              </div>

              {/* Check Availability Button */}
              <button
                type="button"
                onClick={checkAvailability}
                disabled={
                  checkingAvailability ||
                  !formData.startTime ||
                  !formData.endTime
                }
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-600 px-4 py-2.5 font-semibold text-white transition-all hover:from-cyan-400 hover:to-sky-500 disabled:cursor-not-allowed disabled:from-slate-500 disabled:to-slate-500"
              >
                {checkingAvailability ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Checking...
                  </>
                ) : (
                  "Check Availability"
                )}
              </button>

              {/* Availability Status */}
              {availabilityMessage && (
                <div
                  className={`mt-3 p-3 rounded-lg text-sm font-semibold ${
                    isAvailable
                      ? "border border-emerald-500/40 bg-emerald-500/15 text-emerald-200"
                      : "border border-rose-500/40 bg-rose-500/15 text-rose-200"
                  }`}
                >
                  {availabilityMessage}
                </div>
              )}
            </div>
          )}

          {/* Purpose */}
          <div className="rounded-3xl border border-cyan-800/50 bg-slate-800/65 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur">
            <label className="mb-3 block text-sm font-semibold uppercase tracking-wide text-cyan-200">
              Purpose of Booking <span className="text-red-400">*</span>
              <span className="ml-2 text-xs font-normal tracking-normal text-slate-400">
                (Minimum 5 characters)
              </span>
            </label>
            <textarea
              name="purpose"
              value={formData.purpose}
              onChange={handleInputChange}
              placeholder="Describe the purpose of your booking..."
              rows="4"
              minLength="5"
              className="w-full resize-none rounded-2xl border border-slate-500 bg-slate-700/85 px-4 py-3 text-slate-100 transition-all focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/25"
              required
            />
            {formData.purpose && (
              <p
                className={`text-xs mt-2 ${
                  formData.purpose.length < 5 ? "text-rose-500" : "text-emerald-600"
                }`}
              >
                {formData.purpose.length}/5 minimum characters
              </p>
            )}
          </div>

          {/* Expected Attendees */}
          <div className="rounded-3xl border border-cyan-800/50 bg-slate-800/65 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur">
            <label className="mb-3 block text-sm font-semibold uppercase tracking-wide text-cyan-200">
              Expected Attendees <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                name="expectedAttendees"
                value={formData.expectedAttendees}
                onChange={handleInputChange}
                min="1"
                max={selectedResource?.capacity || 100}
                placeholder="Number of people"
                className="w-full rounded-2xl border border-slate-500 bg-slate-700/85 px-4 py-3 text-slate-100 transition-all focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/25"
                required
              />
              <Users
                size={20}
                className="pointer-events-none absolute right-3 top-3 text-cyan-300"
              />
            </div>
            {selectedResource && formData.expectedAttendees && (
              <p className="mt-2 text-xs text-slate-400">
                {formData.expectedAttendees} / {selectedResource.capacity} capacity
              </p>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate("/user/bookings/dashboard")}
              className="flex-1 rounded-2xl border border-slate-500 bg-slate-700/70 px-6 py-3 font-semibold text-slate-100 transition-all hover:border-cyan-300 hover:text-cyan-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !isAvailable}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-600 px-6 py-3 font-semibold text-white transition-all hover:from-cyan-400 hover:to-sky-500 disabled:cursor-not-allowed disabled:from-slate-500 disabled:to-slate-500"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Create Booking
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBooking;
