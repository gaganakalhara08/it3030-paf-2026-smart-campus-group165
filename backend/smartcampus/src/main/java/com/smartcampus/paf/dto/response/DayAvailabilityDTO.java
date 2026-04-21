package com.smartcampus.paf.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DayAvailabilityDTO {

    private String resourceId;
    private String resourceName;
    private LocalDate date;

    // The resource's defined availability window
    private String availabilityStart;  // e.g. "08:00"
    private String availabilityEnd;    // e.g. "18:00"

    // Booked slots for this day (PENDING or APPROVED bookings)
    private List<BookedSlot> bookedSlots;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BookedSlot {
        private String bookingId;
        private String startTime;      // e.g. "09:00"
        private String endTime;        // e.g. "11:00"
        private String status;         // PENDING or APPROVED
        private String bookedByName;   // user's name (for admin view)
        private String purpose;
    }
}
