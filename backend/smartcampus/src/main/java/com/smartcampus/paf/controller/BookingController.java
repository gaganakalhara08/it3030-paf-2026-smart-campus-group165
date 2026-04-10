package com.smartcampus.paf.controller;

import com.smartcampus.paf.dto.request.BookingActionRequestDTO;
import com.smartcampus.paf.dto.request.BookingRequestDTO;
import com.smartcampus.paf.dto.response.BookingResponseDTO;
import com.smartcampus.paf.exception.UnauthorizedException;
import com.smartcampus.paf.model.enums.BookingStatus;
import com.smartcampus.paf.security.JwtTokenProvider;
import com.smartcampus.paf.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final JwtTokenProvider jwtTokenProvider;

    // Helper method to extract email from token with validation
    private String getEmailFromToken(String authHeader) {
        if (authHeader == null || authHeader.isBlank()) {
            throw new UnauthorizedException("Authorization header is missing");
        }
        
        if (!authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Invalid authorization header format. Expected 'Bearer ' prefix");
        }
        
        String token = authHeader.substring(7);
        if (token.isBlank()) {
            throw new UnauthorizedException("Token is missing");
        }
        
        try {
            return jwtTokenProvider.getEmailFromToken(token);
        } catch (Exception e) {
            throw new UnauthorizedException("Invalid or expired token: " + e.getMessage());
        }
    }

    // ==================== CREATE ====================
    
    @PostMapping
    public ResponseEntity<BookingResponseDTO> createBooking(
            @Valid @RequestBody BookingRequestDTO request,
            @RequestHeader("Authorization") String authHeader) {
        String userEmail = getEmailFromToken(authHeader);
        BookingResponseDTO booking = bookingService.createBooking(request, userEmail);
        return ResponseEntity.status(HttpStatus.CREATED).body(booking);
    }

    // ==================== UTILITY ENDPOINTS (MUST BE BEFORE /{id}) ====================
    
    @GetMapping("/check-conflict")
    public ResponseEntity<Boolean> checkConflict(
            @RequestParam String resourceId,
            @RequestParam LocalDate date,
            @RequestParam LocalTime startTime,
            @RequestParam LocalTime endTime) {
        boolean hasConflict = bookingService.checkConflict(resourceId, date, startTime, endTime);
        return ResponseEntity.ok(hasConflict);
    }
    
    @GetMapping("/available-slots")
    public ResponseEntity<List<LocalTime[]>> getAvailableTimeSlots(
            @RequestParam String resourceId,
            @RequestParam LocalDate date) {
        List<LocalTime[]> availableSlots = bookingService.getAvailableTimeSlots(resourceId, date);
        return ResponseEntity.ok(availableSlots);
    }

    // ==================== READ ====================
    
    @GetMapping("/{id}")
    public ResponseEntity<BookingResponseDTO> getBookingById(
            @PathVariable String id,
            @RequestHeader("Authorization") String authHeader) {
        String userEmail = getEmailFromToken(authHeader);
        BookingResponseDTO booking = bookingService.getBookingById(id, userEmail);
        return ResponseEntity.ok(booking);
    }
    
    @GetMapping("/my-bookings")
    public ResponseEntity<List<BookingResponseDTO>> getUserBookings(
            @RequestHeader("Authorization") String authHeader) {
        String userEmail = getEmailFromToken(authHeader);
        List<BookingResponseDTO> bookings = bookingService.getUserBookings(userEmail);
        return ResponseEntity.ok(bookings);
    }
    
    @GetMapping("/my-bookings/status/{status}")
    public ResponseEntity<List<BookingResponseDTO>> getUserBookingsByStatus(
            @PathVariable String status,
            @RequestHeader("Authorization") String authHeader) {
        String userEmail = getEmailFromToken(authHeader);
        BookingStatus bookingStatus = BookingStatus.valueOf(status.toUpperCase());
        List<BookingResponseDTO> bookings = bookingService.getUserBookingsByStatus(userEmail, bookingStatus);
        return ResponseEntity.ok(bookings);
    }
    
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<BookingResponseDTO>> getAllBookings(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String resourceId,
            @RequestParam(required = false) String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "bookingDate") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {
        
        Sort.Direction direction = Sort.Direction.fromString(sortDirection.toUpperCase());
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        
        Page<BookingResponseDTO> bookings = bookingService.getAllBookingsPaginated(
                status, resourceId, userId, pageable);
        
        return ResponseEntity.ok(bookings);
    }

    // ==================== UPDATE - Workflow ====================
    
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingResponseDTO> approveBooking(
            @PathVariable String id,
            @RequestHeader("Authorization") String authHeader) {
        String adminEmail = getEmailFromToken(authHeader);
        BookingResponseDTO booking = bookingService.approveBooking(id, adminEmail);
        return ResponseEntity.ok(booking);
    }
    
    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingResponseDTO> rejectBooking(
            @PathVariable String id,
            @Valid @RequestBody BookingActionRequestDTO request,
            @RequestHeader("Authorization") String authHeader) {
        String adminEmail = getEmailFromToken(authHeader);
        BookingResponseDTO booking = bookingService.rejectBooking(id, request.getReason(), adminEmail);
        return ResponseEntity.ok(booking);
    }
    
    @PutMapping("/{id}/cancel")
    public ResponseEntity<BookingResponseDTO> cancelBooking(
            @PathVariable String id,
            @RequestHeader("Authorization") String authHeader) {
        String userEmail = getEmailFromToken(authHeader);
        BookingResponseDTO booking = bookingService.cancelBooking(id, userEmail);
        return ResponseEntity.ok(booking);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<BookingResponseDTO> updateBooking(
            @PathVariable String id,
            @Valid @RequestBody BookingRequestDTO request,
            @RequestHeader("Authorization") String authHeader) {
        String userEmail = getEmailFromToken(authHeader);
        BookingResponseDTO booking = bookingService.updateBooking(id, request, userEmail);
        return ResponseEntity.ok(booking);
    }

    // ==================== DELETE ====================
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBooking(
            @PathVariable String id,
            @RequestHeader("Authorization") String authHeader) {
        String userEmail = getEmailFromToken(authHeader);
        bookingService.deleteBooking(id, userEmail);
        return ResponseEntity.ok("Booking deleted successfully");
    }
}