import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const pad2 = (n) => String(n).padStart(2, "0");
const toISODate = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
const endOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

const addMonths = (d, delta) => new Date(d.getFullYear(), d.getMonth() + delta, 1);

const sameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const BookingsMonthCalendar = ({ bookings = [], selectedDate, onSelectDate }) => {
  const [monthCursor, setMonthCursor] = useState(() => startOfMonth(new Date()));

  const bookingDateCounts = useMemo(() => {
    const m = new Map();
    for (const b of bookings) {
      const key = (b.bookingDate || "").slice(0, 10);
      if (!key) continue;
      const status = String(b.status || "UNKNOWN").toUpperCase();
      const prev = m.get(key) || {
        total: 0,
        APPROVED: 0,
        PENDING: 0,
        REJECTED: 0,
        CANCELLED: 0,
        UNKNOWN: 0,
      };
      const next = { ...prev };
      next.total += 1;
      if (Object.prototype.hasOwnProperty.call(next, status)) next[status] += 1;
      else next.UNKNOWN += 1;
      m.set(key, next);
    }
    return m;
  }, [bookings]);

  const monthStart = startOfMonth(monthCursor);
  const monthEnd = endOfMonth(monthCursor);

  // Build a 6-week grid (Sun-Sat) for consistent layout
  const gridStart = new Date(monthStart);
  gridStart.setDate(monthStart.getDate() - monthStart.getDay());

  const days = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });

  const monthLabel = monthCursor.toLocaleDateString("en-LK", { month: "long", year: "numeric" });

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Calendar</h3>
          <p className="text-xs text-gray-500">Click a day to filter your bookings</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMonthCursor(addMonths(monthCursor, -1))}
            className="w-9 h-9 rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center justify-center"
            aria-label="Previous month"
          >
            <ChevronLeft size={16} className="text-gray-700" />
          </button>
          <div className="min-w-[140px] text-center text-sm font-semibold text-gray-700">
            {monthLabel}
          </div>
          <button
            type="button"
            onClick={() => setMonthCursor(addMonths(monthCursor, 1))}
            className="w-9 h-9 rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center justify-center"
            aria-label="Next month"
          >
            <ChevronRight size={16} className="text-gray-700" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 text-xs text-gray-500 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((w) => (
          <div key={w} className="text-center font-semibold">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((d) => {
          const iso = toISODate(d);
          const inMonth = d.getMonth() === monthCursor.getMonth();
          const counts = bookingDateCounts.get(iso) || null;
          const isSelected = selectedDate && iso === selectedDate;
          const isToday = sameDay(d, new Date());
          const title = counts
            ? [
                `${counts.total} booking(s)`,
                counts.APPROVED ? `Approved: ${counts.APPROVED}` : null,
                counts.PENDING ? `Pending: ${counts.PENDING}` : null,
                counts.REJECTED ? `Rejected: ${counts.REJECTED}` : null,
                counts.CANCELLED ? `Cancelled: ${counts.CANCELLED}` : null,
                counts.UNKNOWN ? `Other: ${counts.UNKNOWN}` : null,
              ]
                .filter(Boolean)
                .join("\n")
            : "No bookings";

          return (
            <button
              key={iso}
              type="button"
              onClick={() => onSelectDate?.(isSelected ? "" : iso)}
              className={[
                "relative h-10 rounded-lg border text-sm font-semibold transition-colors",
                inMonth ? "text-gray-800" : "text-gray-400",
                isSelected ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-gray-200 hover:bg-gray-50",
              ].join(" ")}
              title={title}
            >
              {d.getDate()}
              {isToday && !isSelected && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-blue-600" />
              )}
              {counts && counts.total > 0 && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-1">
                  {counts.APPROVED > 0 && (
                    <span
                      className={[
                        "px-1.5 py-0.5 rounded-full text-[10px] leading-none font-bold",
                        isSelected ? "bg-white/20 text-white" : "bg-green-100 text-green-700",
                      ].join(" ")}
                    >
                      {counts.APPROVED}
                    </span>
                  )}
                  {counts.PENDING > 0 && (
                    <span
                      className={[
                        "px-1.5 py-0.5 rounded-full text-[10px] leading-none font-bold",
                        isSelected ? "bg-white/20 text-white" : "bg-amber-100 text-amber-700",
                      ].join(" ")}
                    >
                      {counts.PENDING}
                    </span>
                  )}
                  {counts.APPROVED === 0 && counts.PENDING === 0 && (
                    <span
                      className={[
                        "px-1.5 py-0.5 rounded-full text-[10px] leading-none font-bold",
                        isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700",
                      ].join(" ")}
                    >
                      {counts.total}
                    </span>
                  )}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <span>
          {selectedDate ? `Filtered by: ${selectedDate}` : "Showing all bookings"}
        </span>
        {selectedDate && (
          <button
            type="button"
            onClick={() => onSelectDate?.("")}
            className="text-blue-600 hover:text-blue-800 font-semibold"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
};

export default BookingsMonthCalendar;
