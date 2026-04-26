import React, { useState } from "react";
import { Clock } from "lucide-react";

const TimeSlotPicker = ({ slots, onSelect, selectedStart, selectedEnd }) => {
  const [selectedSlot, setSelectedSlot] = useState({
    start: selectedStart || "",
    end: selectedEnd || "",
  });

  const handleSlotSelect = (slot) => {
    setSelectedSlot({
      start: slot[0],
      end: slot[1],
    });
    onSelect(slot[0], slot[1]);
  };

  if (!slots || slots.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 flex items-center gap-2">
        <Clock size={20} />
        <span>No available time slots for this date and resource</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {slots.map((slot, index) => (
          <button
            key={index}
            onClick={() => handleSlotSelect(slot)}
            className={`p-4 rounded-lg border-2 font-semibold transition-all ${
              selectedSlot.start === slot[0] && selectedSlot.end === slot[1]
                ? "bg-blue-600 text-white border-blue-600 shadow-lg"
                : "bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50"
            }`}
          >
            <div className="flex items-center justify-center gap-1">
              <Clock size={16} />
              <span>
                {slot[0].substring(0, 5)} - {slot[1].substring(0, 5)}
              </span>
            </div>
          </button>
        ))}
      </div>

      {selectedSlot.start && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Selected Time Slot:</span>{" "}
            {selectedSlot.start.substring(0, 5)} - {selectedSlot.end.substring(0, 5)}
          </p>
        </div>
      )}
    </div>
  );
};

export default TimeSlotPicker;