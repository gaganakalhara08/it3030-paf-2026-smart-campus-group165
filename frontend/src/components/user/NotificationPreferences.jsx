import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../services/api";

export default function NotificationPreferences({ onClose }) {
  const [prefs, setPrefs] = useState({
    bookingEnabled: true,
    ticketEnabled: true,
    commentEnabled: true,
  });

  const token = localStorage.getItem("token");

  // 🔥 GET CURRENT PREFERENCES
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/notifications/preferences`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        console.log("GET SUCCESS:", res.data);
        setPrefs(res.data);
      })
      .catch((err) => {
        console.error("GET ERROR:", err);
      });
  }, [token]);

  // 🔁 HANDLE TOGGLE
  const handleChange = (key) => {
    setPrefs((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // 💾 SAVE PREFERENCES
  const save = () => {
    console.log("SENDING:", prefs);

    axios
      .put(`${API_BASE_URL}/notifications/preferences`, prefs, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => {
        console.log("SAVE SUCCESS");
        alert("Preferences saved successfully!");

        // Close panel safely
        if (onClose) onClose();
      })
      .catch((err) => {
        console.error("SAVE ERROR:", err);
        alert("Failed to save preferences");
      });
  };

  return (
    <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg p-4 rounded z-50 border">
      <h3 className="font-bold mb-3 text-gray-800">
        Notification Settings
      </h3>

      {/* Booking */}
      <label className="flex items-center mb-2 cursor-pointer">
        <input
          type="checkbox"
          checked={prefs.bookingEnabled}
          onChange={() => handleChange("bookingEnabled")}
        />
        <span className="ml-2 text-sm text-gray-700">
          Booking Notifications
        </span>
      </label>

      {/* Ticket */}
      <label className="flex items-center mb-2 cursor-pointer">
        <input
          type="checkbox"
          checked={prefs.ticketEnabled}
          onChange={() => handleChange("ticketEnabled")}
        />
        <span className="ml-2 text-sm text-gray-700">
          Ticket Notifications
        </span>
      </label>

      {/* Comment */}
      <label className="flex items-center mb-3 cursor-pointer">
        <input
          type="checkbox"
          checked={prefs.commentEnabled}
          onChange={() => handleChange("commentEnabled")}
        />
        <span className="ml-2 text-sm text-gray-700">
          Comment Notifications
        </span>
      </label>

      {/* Save Button */}
      <button
        onClick={save}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 rounded transition"
      >
        Save Preferences
      </button>
    </div>
  );
}