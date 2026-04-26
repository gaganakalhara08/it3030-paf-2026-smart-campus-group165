import { useEffect, useState } from "react";
import axios from "axios";

export default function NotificationPreferences({ onClose }) {
  const [prefs, setPrefs] = useState({
    bookingEnabled: true,
    ticketEnabled: true,
    commentEnabled: true,
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    axios.get("/api/notifications/preferences", {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(res => setPrefs(res.data))
    .catch(err => console.error(err));
  }, []);

  const handleChange = (key) => {
    setPrefs({ ...prefs, [key]: !prefs[key] });
  };

  const save = () => {
    axios.put("/api/notifications/preferences", prefs, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(() => {
      alert("Preferences saved!");
      onClose();
    })
    .catch(err => console.error(err));
  };

  return (
    <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg p-4 rounded z-50">
      <h3 className="font-bold mb-3">Notification Settings</h3>

      <label className="block mb-2">
        <input
          type="checkbox"
          checked={prefs.bookingEnabled}
          onChange={() => handleChange("bookingEnabled")}
        />
        <span className="ml-2">Booking</span>
      </label>

      <label className="block mb-2">
        <input
          type="checkbox"
          checked={prefs.ticketEnabled}
          onChange={() => handleChange("ticketEnabled")}
        />
        <span className="ml-2">Ticket</span>
      </label>

      <label className="block mb-2">
        <input
          type="checkbox"
          checked={prefs.commentEnabled}
          onChange={() => handleChange("commentEnabled")}
        />
        <span className="ml-2">Comment</span>
      </label>

      <button
        onClick={save}
        className="mt-3 bg-blue-500 text-white px-3 py-1 rounded"
      >
        Save
      </button>
    </div>
  );
}