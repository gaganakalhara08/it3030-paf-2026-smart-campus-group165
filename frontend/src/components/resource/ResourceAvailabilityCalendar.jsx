import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Clock, Loader2 } from "lucide-react";
import { getDayAvailability } from "../../services/resourceService";

// Format date as YYYY-MM-DD for API
const toISODate = (d) => d.toISOString().split("T")[0];

// Format date for display
const formatDisplay = (d) =>
  d.toLocaleDateString("en-LK", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

// Convert "HH:MM:SS" or "HH:MM" to minutes from midnight
const toMinutes = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

const STATUS_STYLE = {
  APPROVED: { bg: "bg-red-100", text: "text-red-700", border: "border-red-300", label: "Booked" },
  PENDING:  { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-300", label: "Pending" },
};

const ResourceAvailabilityCalendar = ({ resource }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);

  const fetchAvailability = async (date) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDayAvailability(resource.id, toISODate(date));
      setAvailability(data);
    } catch (err) {
      setError("Could not load availability.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (resource?.id) fetchAvailability(selectedDate);
  }, [selectedDate, resource?.id]);

  const prevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d);
  };

  const nextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d);
  };

  const today = () => setSelectedDate(new Date());

  // Build timeline — hourly slots between availability window
  const buildTimeline = () => {
    if (!availability) return [];
    const startMin = toMinutes(availability.availabilityStart);
    const endMin   = toMinutes(availability.availabilityEnd);
    const slots    = [];

    for (let m = startMin; m < endMin; m += 60) {
      const slotEnd = Math.min(m + 60, endMin);
      const booked  = (availability.bookedSlots || []).filter((b) => {
        const bStart = toMinutes(b.startTime);
        const bEnd   = toMinutes(b.endTime);
        return bStart < slotEnd && bEnd > m;
      });
      slots.push({ startMin: m, endMin: slotEnd, bookings: booked });
    }
    return slots;
  };

  const timeline = buildTimeline();
  const totalSlots  = timeline.length;
  const bookedSlots = timeline.filter((s) => s.bookings.length > 0).length;
  const freeSlots   = totalSlots - bookedSlots;

  const minToLabel = (m) => {
    const h = Math.floor(m / 60);
    const mm = m % 60;
    return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
  };

  return (
    <div className="mt-4 border-t border-slate-100 pt-4">
      <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
        <Clock size={15} className="text-purple-600" />
        Availability Calendar
      </h3>

      {/* Date navigation */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevDay}
          className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
          <ChevronLeft size={16} />
        </button>
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-700">{formatDisplay(selectedDate)}</p>
          <button onClick={today} className="text-xs text-purple-600 hover:underline mt-0.5">
            Jump to today
          </button>
        </div>
        <button onClick={nextDay}
          className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Summary chips */}
      {availability && !loading && (
        <div className="flex gap-2 mb-4 flex-wrap">
          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
            {freeSlots} slot{freeSlots !== 1 ? "s" : ""} free
          </span>
          <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
            {bookedSlots} slot{bookedSlots !== 1 ? "s" : ""} booked
          </span>
          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
            {availability.availabilityStart?.slice(0,5)} – {availability.availabilityEnd?.slice(0,5)}
          </span>
        </div>
      )}

      {/* Timeline */}
      {loading ? (
        <div className="flex items-center justify-center py-10 gap-2 text-slate-400">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">Loading…</span>
        </div>
      ) : error ? (
        <p className="text-sm text-red-500 text-center py-6">{error}</p>
      ) : availability ? (
        <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
          {timeline.map((slot, i) => {
            const isFree = slot.bookings.length === 0;
            return (
              <div key={i} className={`flex items-start gap-3 rounded-xl px-3 py-2.5 border transition-colors ${
                isFree
                  ? "bg-emerald-50 border-emerald-200"
                  : "bg-red-50 border-red-200"
              }`}>
                {/* Time label */}
                <span className="text-xs font-mono font-semibold text-slate-500 w-20 flex-shrink-0 mt-0.5">
                  {minToLabel(slot.startMin)} – {minToLabel(slot.endMin)}
                </span>

                {isFree ? (
                  <span className="text-xs font-semibold text-emerald-700">Available</span>
                ) : (
                  <div className="flex-1 space-y-1">
                    {slot.bookings.map((b, j) => {
                      const s = STATUS_STYLE[b.status] || STATUS_STYLE.APPROVED;
                      return (
                        <div key={j} className={`flex items-start justify-between gap-2`}>
                          <div>
                            <span className={`text-xs font-semibold ${s.text}`}>
                              {b.bookedByName}
                            </span>
                            {b.purpose && (
                              <p className="text-xs text-slate-500 truncate max-w-[160px]">{b.purpose}</p>
                            )}
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${s.bg} ${s.text}`}>
                            {s.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

export default ResourceAvailabilityCalendar;
