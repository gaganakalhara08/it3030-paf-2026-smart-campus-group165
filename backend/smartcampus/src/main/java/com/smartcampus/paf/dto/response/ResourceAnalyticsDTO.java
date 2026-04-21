package com.smartcampus.paf.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResourceAnalyticsDTO {

    // Top 5 most booked resources
    private List<ResourceBookingCount> topResources;

    // Bookings per resource type (LECTURE_HALL, LAB, etc.)
    private Map<String, Long> bookingsByType;

    // Bookings per hour of day (0-23)
    private Map<Integer, Long> bookingsByHour;

    // Utilisation per resource (resourceId -> utilisation %)
    private List<ResourceUtilisation> utilisationRates;

    // Summary counts
    private long totalBookings;
    private long approvedBookings;
    private long pendingBookings;
    private long cancelledBookings;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResourceBookingCount {
        private String resourceId;
        private String resourceName;
        private String resourceType;
        private long bookingCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResourceUtilisation {
        private String resourceId;
        private String resourceName;
        private double utilisationPercent;   // booked hours / available hours * 100
        private long totalBookedHours;
        private long availableHoursPerDay;
    }
}
