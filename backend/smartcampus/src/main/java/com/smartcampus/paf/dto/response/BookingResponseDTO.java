package com.smartcampus.paf.dto.response;

import com.smartcampus.paf.model.enums.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@AllArgsConstructor
public class BookingResponseDTO {
    private String id;
    private String userId;
    private String userEmail;
    private String userName;
    private String resourceId;
    private String resourceName;
    private String resourceType;
    private String resourceLocation;
    private Integer capacity;
    private LocalDate bookingDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String purpose;
    private Integer expectedAttendees;
    private BookingStatus status;
    private String adminReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}