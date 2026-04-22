package com.smartcampus.paf.service.impl;

import com.smartcampus.paf.dto.request.BookingRequestDTO;
import com.smartcampus.paf.dto.response.BookingResponseDTO;
import com.smartcampus.paf.exception.*;
import com.smartcampus.paf.model.Booking;
import com.smartcampus.paf.model.Resource;
import com.smartcampus.paf.model.User;
import com.smartcampus.paf.model.enums.BookingStatus;
import com.smartcampus.paf.model.enums.ResourceStatus;
import com.smartcampus.paf.model.enums.Role;
import com.smartcampus.paf.repository.BookingRepository;
import com.smartcampus.paf.repository.ResourceRepository;
import com.smartcampus.paf.repository.UserRepository;
import com.smartcampus.paf.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class BookingServiceImpl implements BookingService {
    
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;
    
    @Override
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public BookingResponseDTO createBooking(BookingRequestDTO request, String userEmail) {
        // Validate user exists
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Validate resource exists
        Resource resource = resourceRepository.findById(request.getResourceId())
                .orElseThrow(() -> new RuntimeException("Resource not found with ID: " + request.getResourceId()));
        
        // Validate resource is ACTIVE
        if (resource.getStatus() != ResourceStatus.ACTIVE) {
            throw new RuntimeException("Resource is not available. Status: " + resource.getStatus());
        }
        
        // Validate time logic
        if (request.getStartTime().isAfter(request.getEndTime())) {
            throw new InvalidBookingRequestException("Start time must be before end time");
        }
        
        if (request.getStartTime().equals(request.getEndTime())) {
            throw new InvalidBookingRequestException("Start time cannot be equal to end time");
        }
        
        // Validate capacity
        if (request.getExpectedAttendees() != null && request.getExpectedAttendees() > resource.getCapacity()) {
            throw new InvalidBookingRequestException(
                "Expected attendees (" + request.getExpectedAttendees() + 
                ") exceeds resource capacity (" + resource.getCapacity() + ")"
            );
        }
        
        // Check for conflicts
        if (checkConflict(request.getResourceId(), request.getBookingDate(), 
                          request.getStartTime(), request.getEndTime())) {
            throw new TimeSlotConflictException(request.getResourceId(), request.getBookingDate(), 
                                                  request.getStartTime(), request.getEndTime());
        }
        
        // Create booking
        Booking booking = new Booking();
        booking.setUser(user);
        booking.setResource(resource);
        booking.setBookingDate(request.getBookingDate());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setPurpose(request.getPurpose());
        booking.setExpectedAttendees(request.getExpectedAttendees());
        booking.setStatus(BookingStatus.PENDING);
        
        Booking saved = bookingRepository.save(booking);
        return mapToResponse(saved);
    }
    
    @Override
    public BookingResponseDTO getBookingById(String bookingId, String userEmail) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException(bookingId));
        
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        boolean isAdmin = user.getRoles().contains(Role.ROLE_ADMIN);
        boolean isOwner = booking.getUser().getEmail().equals(userEmail);
        
        if (!isAdmin && !isOwner) {
            throw new UnauthorizedException("You don't have permission to view this booking");
        }
        
        return mapToResponse(booking);
    }
    
    @Override
    public List<BookingResponseDTO> getUserBookings(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return bookingRepository.findByUser(user).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<BookingResponseDTO> getUserBookingsByStatus(String userEmail, BookingStatus status) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return bookingRepository.findByUserAndStatus(user, status).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<BookingResponseDTO> getAllBookings(String status, String resourceId, String userId) {
        BookingStatus bookingStatus = status != null ? BookingStatus.valueOf(status) : null;
        return bookingRepository.findBookingsWithFilters(bookingStatus, resourceId, userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    public Page<BookingResponseDTO> getAllBookingsPaginated(String status, String resourceId, String userId, Pageable pageable) {
        BookingStatus bookingStatus = status != null ? BookingStatus.valueOf(status) : null;
        Page<Booking> bookings = bookingRepository.findBookingsWithFiltersPaginated(bookingStatus, resourceId, userId, pageable);
        return bookings.map(this::mapToResponse);
    }
    
    @Override
    @Transactional
    public BookingResponseDTO approveBooking(String bookingId, String adminEmail) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException(bookingId));
        
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new InvalidBookingRequestException("Only pending bookings can be approved");
        }
        
        booking.setStatus(BookingStatus.APPROVED);
        booking.setApprovedBy(adminEmail);
        booking.setApprovedAt(LocalDateTime.now());
        
        Booking saved = bookingRepository.save(booking);
        return mapToResponse(saved);
    }
    
    @Override
    @Transactional
    public BookingResponseDTO rejectBooking(String bookingId, String reason, String adminEmail) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException(bookingId));
        
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new InvalidBookingRequestException("Only pending bookings can be rejected");
        }
        
        booking.setStatus(BookingStatus.REJECTED);
        booking.setAdminReason(reason);
        booking.setRejectedBy(adminEmail);
        booking.setRejectedAt(LocalDateTime.now());
        
        Booking saved = bookingRepository.save(booking);
        return mapToResponse(saved);
    }
    
    @Override
    @Transactional
    public BookingResponseDTO cancelBooking(String bookingId, String userEmail) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException(bookingId));
        
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        boolean isAdmin = user.getRoles().contains(Role.ROLE_ADMIN);
        boolean isOwner = booking.getUser().getEmail().equals(userEmail);
        
        if (!isAdmin && !isOwner) {
            throw new UnauthorizedException("You don't have permission to cancel this booking");
        }
        
        if (booking.getStatus() != BookingStatus.APPROVED && booking.getStatus() != BookingStatus.PENDING) {
            throw new InvalidBookingRequestException("Only pending or approved bookings can be cancelled");
        }
        
        booking.setStatus(BookingStatus.CANCELLED);
        Booking saved = bookingRepository.save(booking);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public BookingResponseDTO checkInBooking(String bookingId, String userEmail) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException(bookingId));
        
        boolean isOwner = booking.getUser().getEmail().equals(userEmail);
        
        if (!isOwner) {
            throw new UnauthorizedException("You don't have permission to check in this booking");
        }
        
        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new InvalidBookingRequestException("Only approved bookings can be checked in");
        }
        
        booking.setCheckedIn(true);
        booking.setCheckedInAt(LocalDateTime.now());
        
        Booking saved = bookingRepository.save(booking);
        return mapToResponse(saved);
    }

    @Override
    public Map<String, Object> getAnalytics() {
        List<Booking> allBookings = bookingRepository.findAll();
        
        Map<String, Object> analytics = new HashMap<>();
        
        analytics.put("totalBookings", allBookings.size());
        
        long approvedCount = allBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.APPROVED)
                .count();
        analytics.put("approvedBookings", approvedCount);
        
        long pendingCount = allBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.PENDING)
                .count();
        analytics.put("pendingBookings", pendingCount);
        
        double avgAttendees = allBookings.stream()
                .filter(b -> b.getExpectedAttendees() != null)
                .mapToInt(Booking::getExpectedAttendees)
                .average()
                .orElse(0);
        analytics.put("averageAttendees", Math.round(avgAttendees));
        
        List<Map<String, Object>> topResources = allBookings.stream()
                .collect(Collectors.groupingBy(
                        b -> b.getResource().getName(),
                        Collectors.counting()
                ))
                .entrySet().stream()
                .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                .limit(5)
                .map(entry -> {
                    Map<String, Object> resource = new HashMap<>();
                    resource.put("name", entry.getKey());
                    resource.put("bookings", entry.getValue());
                    return resource;
                })
                .collect(Collectors.toList());
        analytics.put("topResources", topResources);
        
        Map<String, Long> statusDistribution = allBookings.stream()
                .collect(Collectors.groupingBy(
                        b -> b.getStatus().toString(),
                        Collectors.counting()
                ));
        analytics.put("statusDistribution", statusDistribution);
        
        List<Map<String, Object>> peakHours = new ArrayList<>();
        for (int hour = 8; hour < 18; hour++) {
            final int currentHour = hour;
            long count = allBookings.stream()
                    .filter(b -> {
                        try {
                            LocalTime startTime = b.getStartTime();
                            return startTime.getHour() == currentHour;
                        } catch (Exception e) {
                            return false;
                        }
                    })
                    .count();
            
            Map<String, Object> hourData = new HashMap<>();
            hourData.put("hour", String.format("%02d:00", hour));
            hourData.put("bookings", count);
            peakHours.add(hourData);
        }
        analytics.put("peakHours", peakHours);
        
        return analytics;
    }
    
    @Override
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public BookingResponseDTO updateBooking(String bookingId, BookingRequestDTO request, String userEmail) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException(bookingId));
        
        boolean isOwner = booking.getUser().getEmail().equals(userEmail);
        
        if (!isOwner) {
            throw new UnauthorizedException("You don't have permission to update this booking");
        }
        
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new InvalidBookingRequestException("Only pending bookings can be updated");
        }
        
        // Validate resource
        Resource resource = resourceRepository.findById(request.getResourceId())
                .orElseThrow(() -> new RuntimeException("Resource not found with ID: " + request.getResourceId()));
        
        if (resource.getStatus() != ResourceStatus.ACTIVE) {
            throw new RuntimeException("Resource is not available. Status: " + resource.getStatus());
        }
        
        // Validate time logic
        if (request.getStartTime().isAfter(request.getEndTime())) {
            throw new InvalidBookingRequestException("Start time must be before end time");
        }
        
        // Validate capacity
        if (request.getExpectedAttendees() != null && request.getExpectedAttendees() > resource.getCapacity()) {
            throw new InvalidBookingRequestException(
                "Expected attendees (" + request.getExpectedAttendees() + 
                ") exceeds resource capacity (" + resource.getCapacity() + ")"
            );
        }
        
        // Check for conflicts (excluding current booking)
        List<Booking> conflicts = bookingRepository.findConflictingBookings(
            request.getResourceId(), request.getBookingDate(), 
            request.getStartTime(), request.getEndTime());
        
        conflicts.removeIf(b -> b.getId().equals(bookingId));
        
        if (!conflicts.isEmpty()) {
            throw new TimeSlotConflictException(request.getResourceId(), request.getBookingDate(), 
                                                  request.getStartTime(), request.getEndTime());
        }
        
        // Update booking
        booking.setResource(resource);
        booking.setBookingDate(request.getBookingDate());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setPurpose(request.getPurpose());
        booking.setExpectedAttendees(request.getExpectedAttendees());
        
        Booking saved = bookingRepository.save(booking);
        return mapToResponse(saved);
    }
    
    @Override
    @Transactional
    public void deleteBooking(String bookingId, String userEmail) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException(bookingId));
        
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        boolean isAdmin = user.getRoles().contains(Role.ROLE_ADMIN);
        boolean isOwner = booking.getUser().getEmail().equals(userEmail);
        
        if (!isAdmin && !isOwner) {
            throw new UnauthorizedException("You don't have permission to delete this booking");
        }
        
        if (booking.getStatus() == BookingStatus.APPROVED) {
            throw new InvalidBookingRequestException("Approved bookings cannot be deleted. Please cancel instead.");
        }
        
        bookingRepository.delete(booking);
    }
    
    @Override
    public boolean checkConflict(String resourceId, LocalDate date, LocalTime startTime, LocalTime endTime) {
        List<Booking> conflicts = bookingRepository.findConflictingBookings(resourceId, date, startTime, endTime);
        return !conflicts.isEmpty();
    }
    
    @Override
    public List<LocalTime[]> getAvailableTimeSlots(String resourceId, LocalDate date) {
        List<LocalTime[]> allSlots = new ArrayList<>();
        LocalTime start = LocalTime.of(8, 0);
        LocalTime end = LocalTime.of(18, 0);
        int slotDuration = 60;
        
        LocalTime current = start;
        while (current.isBefore(end)) {
            LocalTime slotEnd = current.plusMinutes(slotDuration);
            if (!checkConflict(resourceId, date, current, slotEnd)) {
                allSlots.add(new LocalTime[]{current, slotEnd});
            }
            current = slotEnd;
        }
        return allSlots;
    }
    
    private BookingResponseDTO mapToResponse(Booking booking) {
        Resource resource = booking.getResource();
        return new BookingResponseDTO(
            booking.getId(),
            booking.getUser().getId(),
            booking.getUser().getEmail(),
            booking.getUser().getName(),
            resource.getId(),
            resource.getName(),
            resource.getType().toString(),
            resource.getLocation(),
            resource.getCapacity(),
            booking.getBookingDate(),
            booking.getStartTime(),
            booking.getEndTime(),
            booking.getPurpose(),
            booking.getExpectedAttendees(),
            booking.getStatus(),
            booking.getAdminReason(),
            booking.getCreatedAt(),
            booking.getUpdatedAt()
        );
    }
}