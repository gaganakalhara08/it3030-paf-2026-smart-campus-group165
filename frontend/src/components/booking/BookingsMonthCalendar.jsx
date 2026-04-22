import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

const pad2 = (n) => String(n).padStart(2, "0");
const toISODate = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
const addMonths = (d, delta) => new Date(d.getFullYear(), d.getMonth() + delta, 1);

const sameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const BookingsMonthCalendar = ({ bookings = [], selectedDate, onSelectDate }) => {
  const [monthCursor, setMonthCursor] = useState(() => startOfMonth(new Date()));
  const today = new Date();

  const bookingDateCounts = useMemo(() => {
    const map = new Map();
    for (const booking of bookings) {
      const key = (booking.bookingDate || "").slice(0, 10);
      if (!key) continue;

      const status = String(booking.status || "UNKNOWN").toUpperCase();
      const current = map.get(key) || {
        total: 0,
        APPROVED: 0,
        PENDING: 0,
        REJECTED: 0,
        CANCELLED: 0,
        UNKNOWN: 0,
      };

      const next = { ...current, total: current.total + 1 };
      if (Object.prototype.hasOwnProperty.call(next, status)) next[status] += 1;
      else next.UNKNOWN += 1;
      map.set(key, next);
    }
    return map;
  }, [bookings]);

  const gridStart = useMemo(() => {
    const firstDay = startOfMonth(monthCursor);
    const start = new Date(firstDay);
    start.setDate(firstDay.getDate() - firstDay.getDay());
    return start;
  }, [monthCursor]);

  const days = useMemo(() => {
    return Array.from({ length: 42 }, (_, index) => {
      const day = new Date(gridStart);
      day.setDate(gridStart.getDate() + index);
      return day;
    });
  }, [gridStart]);

  const monthLabel = monthCursor.toLocaleDateString("en-LK", { month: "long", year: "numeric" });

  return (
    <div className="mx-auto max-w-4xl rounded-xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-cyan-50/40 p-2.5 shadow-sm sm:p-3">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
            <CalendarDays size={14} />
            Booking Calendar
          </div>
          <h3 className="mt-1 text-base font-bold text-slate-800">{monthLabel}</h3>
          <p className="text-xs text-slate-500">Select a date to filter bookings</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMonthCursor(addMonths(monthCursor, -1))}
            className="h-9 w-9 rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700"
            aria-label="Previous month"
          >
            <ChevronLeft size={16} className="mx-auto" />
          </button>
          <button
            type="button"
            onClick={() => setMonthCursor(startOfMonth(today))}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setMonthCursor(addMonths(monthCursor, 1))}
            className="h-9 w-9 rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700"
            aria-label="Next month"
          >
            <ChevronRight size={16} className="mx-auto" />
          </button>
        </div>
      </div>

      <div className="mb-1.5 grid grid-cols-7 gap-1">
        {WEEKDAYS.map((day) => (
          <div key={day} className="text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const iso = toISODate(day);
          const counts = bookingDateCounts.get(iso);
          const inMonth = day.getMonth() === monthCursor.getMonth();
          const isSelected = selectedDate === iso;
          const isToday = sameDay(day, today);

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
              title={title}
              onClick={() => onSelectDate?.(isSelected ? "" : iso)}
              className={[
                "relative min-h-[42px] rounded-md border p-1 text-left transition-all sm:min-h-[48px]",
                inMonth ? "text-slate-800" : "text-slate-400",
                isSelected
                  ? "border-cyan-500 bg-cyan-600 text-white shadow-lg shadow-cyan-200"
                  : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-md",
              ].join(" ")}
            >
              <div className="flex items-start justify-between">
                <span className="text-[11px] font-semibold sm:text-xs">{day.getDate()}</span>
                {isToday && !isSelected && <span className="h-2 w-2 rounded-full bg-cyan-500" />}
              </div>

              <div className="absolute bottom-0.5 left-0.5 right-0.5 flex flex-wrap gap-0.5">
                {counts?.APPROVED > 0 && (
                  <span className={isSelected ? "rounded-full bg-white/25 px-1 py-0.5 text-[9px] font-bold" : "rounded-full bg-emerald-100 px-1 py-0.5 text-[9px] font-bold text-emerald-700"}>
                    A {counts.APPROVED}
                  </span>
                )}
                {counts?.PENDING > 0 && (
                  <span className={isSelected ? "rounded-full bg-white/25 px-1 py-0.5 text-[9px] font-bold" : "rounded-full bg-amber-100 px-1 py-0.5 text-[9px] font-bold text-amber-700"}>
                    P {counts.PENDING}
                  </span>
                )}
                {counts && counts.APPROVED === 0 && counts.PENDING === 0 && (
                  <span className={isSelected ? "rounded-full bg-white/25 px-1 py-0.5 text-[9px] font-bold" : "rounded-full bg-slate-100 px-1 py-0.5 text-[9px] font-bold text-slate-700"}>
                    {counts.total}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs sm:text-sm">
        <span className="text-slate-500">
          {selectedDate ? `Filtered date: ${selectedDate}` : "Showing bookings from all dates"}
        </span>
        {selectedDate && (
          <button
            type="button"
            onClick={() => onSelectDate?.("")}
            className="rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-1.5 font-semibold text-cyan-700 transition hover:bg-cyan-100"
          >
            Clear Filter
          </button>
        )}
      </div>
    </div>
  );
};

export default BookingsMonthCalendar;
