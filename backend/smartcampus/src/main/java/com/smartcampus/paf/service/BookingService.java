package com.smartcampus.paf.service;

import com.smartcampus.paf.dto.request.BookingRequestDTO;
import com.smartcampus.paf.dto.response.BookingResponseDTO;
import com.smartcampus.paf.model.enums.BookingStatus;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface BookingService {
    
    // CREATE
    BookingResponseDTO createBooking(BookingRequestDTO request, String userEmail);
    
    // READ
    BookingResponseDTO getBookingById(String bookingId, String userEmail);  // Updated with userEmail
    List<BookingResponseDTO> getUserBookings(String userEmail);
    List<BookingResponseDTO> getUserBookingsByStatus(String userEmail, BookingStatus status);
    List<BookingResponseDTO> getAllBookings(String status, String resourceId, String userId);
    
    // UPDATE - Workflow
    BookingResponseDTO approveBooking(String bookingId, String adminEmail);
    BookingResponseDTO rejectBooking(String bookingId, String reason, String adminEmail);
    BookingResponseDTO cancelBooking(String bookingId, String userEmail);
    BookingResponseDTO updateBooking(String bookingId, BookingRequestDTO request, String userEmail);
    
    // DELETE
    void deleteBooking(String bookingId, String userEmail);
    
    // UTILITY
    boolean checkConflict(String resourceId, LocalDate date, LocalTime startTime, LocalTime endTime);
    List<LocalTime[]> getAvailableTimeSlots(String resourceId, LocalDate date);
}