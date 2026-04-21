package com.smartcampus.paf.service.impl;

import com.smartcampus.paf.dto.request.ResourceRequestDTO;
import com.smartcampus.paf.dto.response.DayAvailabilityDTO;
import com.smartcampus.paf.dto.response.ResourceAnalyticsDTO;
import com.smartcampus.paf.dto.response.ResourceResponseDTO;
import com.smartcampus.paf.exception.DuplicateResourceException;
import com.smartcampus.paf.exception.ResourceNotFoundException;
import com.smartcampus.paf.model.Booking;
import com.smartcampus.paf.model.Resource;
import com.smartcampus.paf.model.User;
import com.smartcampus.paf.model.enums.BookingStatus;
import com.smartcampus.paf.model.enums.ResourceStatus;
import com.smartcampus.paf.model.enums.ResourceType;
import com.smartcampus.paf.repository.BookingRepository;
import com.smartcampus.paf.repository.ResourceRepository;
import com.smartcampus.paf.repository.UserRepository;
import com.smartcampus.paf.service.ResourceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class ResourceServiceImpl implements ResourceService {

    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;

    // ── Existing CRUD methods ─────────────────────────────────────────────────

    @Override
    @Transactional
    public ResourceResponseDTO createResource(ResourceRequestDTO dto, String adminEmail) {
        if (resourceRepository.existsByNameIgnoreCase(dto.getName())) {
            throw new DuplicateResourceException("A resource with name '" + dto.getName() + "' already exists.");
        }
        if (!dto.getAvailabilityEnd().isAfter(dto.getAvailabilityStart())) {
            throw new IllegalArgumentException("Availability end time must be after start time.");
        }
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Admin user not found: " + adminEmail));

        Resource resource = Resource.builder()
                .name(dto.getName())
                .type(dto.getType())
                .capacity(dto.getCapacity())
                .location(dto.getLocation())
                .description(dto.getDescription())
                .availabilityStart(dto.getAvailabilityStart())
                .availabilityEnd(dto.getAvailabilityEnd())
                .status(dto.getStatus() != null ? dto.getStatus() : ResourceStatus.ACTIVE)
                .building(dto.getBuilding())
                .floor(dto.getFloor())
                .roomNumber(dto.getRoomNumber())
                .brand(dto.getBrand())
                .model(dto.getModel())
                .serialNumber(dto.getSerialNumber())
                .imageUrl(dto.getImageUrl())
                .createdBy(admin)
                .build();

        Resource saved = resourceRepository.save(resource);
        log.info("Resource created: {} by {}", saved.getId(), adminEmail);
        return mapToDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ResourceResponseDTO getResourceById(String id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
        return mapToDTO(resource);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ResourceResponseDTO> searchResources(
            ResourceType type, ResourceStatus status, Integer minCapacity,
            String location, String keyword, Pageable pageable) {
        return resourceRepository.searchResources(type, status, minCapacity, location, keyword, pageable)
                .map(this::mapToDTO);
    }

    @Override
    @Transactional
    public ResourceResponseDTO updateResource(String id, ResourceRequestDTO dto) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));

        if (resourceRepository.existsByNameIgnoreCaseAndIdNot(dto.getName(), id)) {
            throw new DuplicateResourceException("A resource with name '" + dto.getName() + "' already exists.");
        }
        if (!dto.getAvailabilityEnd().isAfter(dto.getAvailabilityStart())) {
            throw new IllegalArgumentException("Availability end time must be after start time.");
        }

        resource.setName(dto.getName());
        resource.setType(dto.getType());
        resource.setCapacity(dto.getCapacity());
        resource.setLocation(dto.getLocation());
        resource.setDescription(dto.getDescription());
        resource.setAvailabilityStart(dto.getAvailabilityStart());
        resource.setAvailabilityEnd(dto.getAvailabilityEnd());
        resource.setBuilding(dto.getBuilding());
        resource.setFloor(dto.getFloor());
        resource.setRoomNumber(dto.getRoomNumber());
        resource.setBrand(dto.getBrand());
        resource.setModel(dto.getModel());
        resource.setSerialNumber(dto.getSerialNumber());
        resource.setImageUrl(dto.getImageUrl());
        if (dto.getStatus() != null) resource.setStatus(dto.getStatus());

        Resource updated = resourceRepository.save(resource);
        log.info("Resource updated: {}", updated.getId());
        return mapToDTO(updated);
    }

    @Override
    @Transactional
    public ResourceResponseDTO updateResourceStatus(String id, ResourceStatus status) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
        resource.setStatus(status);
        Resource updated = resourceRepository.save(resource);
        log.info("Resource {} status updated to {}", id, status);
        return mapToDTO(updated);
    }

    @Override
    @Transactional
    public void deleteResource(String id) {
        if (!resourceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Resource not found with id: " + id);
        }
        resourceRepository.deleteById(id);
        log.info("Resource deleted: {}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Long> getResourceStats() {
        Map<String, Long> stats = new LinkedHashMap<>();
        stats.put("total",            resourceRepository.count());
        stats.put("active",           resourceRepository.countByStatus(ResourceStatus.ACTIVE));
        stats.put("outOfService",     resourceRepository.countByStatus(ResourceStatus.OUT_OF_SERVICE));
        stats.put("underMaintenance", resourceRepository.countByStatus(ResourceStatus.UNDER_MAINTENANCE));
        stats.put("lectureHalls",     resourceRepository.countByType(ResourceType.LECTURE_HALL));
        stats.put("labs",             resourceRepository.countByType(ResourceType.LAB));
        stats.put("meetingRooms",     resourceRepository.countByType(ResourceType.MEETING_ROOM));
        stats.put("equipment",        resourceRepository.countByType(ResourceType.EQUIPMENT));
        return stats;
    }

    // ── Feature 1: Usage Analytics ────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public ResourceAnalyticsDTO getAnalytics() {

        // Top resources by booking count (limit 5)
        List<Object[]> topRaw = bookingRepository.findBookingCountPerResource();
        List<ResourceAnalyticsDTO.ResourceBookingCount> topResources = topRaw.stream()
                .limit(5)
                .map(row -> ResourceAnalyticsDTO.ResourceBookingCount.builder()
                        .resourceId((String) row[0])
                        .resourceName((String) row[1])
                        .resourceType((String) row[2])
                        .bookingCount((Long) row[3])
                        .build())
                .collect(Collectors.toList());

        // Bookings per resource type
        List<Object[]> typeRaw = bookingRepository.findBookingCountPerType();
        Map<String, Long> bookingsByType = new LinkedHashMap<>();
        for (Object[] row : typeRaw) {
            bookingsByType.put((String) row[0], (Long) row[1]);
        }

        // Bookings per hour
        List<Object[]> hourRaw = bookingRepository.findBookingCountPerHour();
        Map<Integer, Long> bookingsByHour = new TreeMap<>();
        for (Object[] row : hourRaw) {
            bookingsByHour.put(((Number) row[0]).intValue(), (Long) row[1]);
        }

        // Utilisation rates — for each resource with bookings
        List<Resource> allResources = resourceRepository.findAll();
        List<ResourceAnalyticsDTO.ResourceUtilisation> utilisationRates = new ArrayList<>();
        for (Resource res : allResources) {
            List<Booking> approved = bookingRepository.findApprovedByResourceId(res.getId());
            long totalBookedMinutes = approved.stream()
                    .mapToLong(b -> ChronoUnit.MINUTES.between(b.getStartTime(), b.getEndTime()))
                    .sum();
            long availMinutesPerDay = ChronoUnit.MINUTES.between(
                    res.getAvailabilityStart(), res.getAvailabilityEnd());
            // Estimate over 30 days
            long totalAvailMinutes = availMinutesPerDay * 30;
            double utilPct = totalAvailMinutes > 0
                    ? Math.min(100.0, (totalBookedMinutes * 100.0) / totalAvailMinutes)
                    : 0.0;

            utilisationRates.add(ResourceAnalyticsDTO.ResourceUtilisation.builder()
                    .resourceId(res.getId())
                    .resourceName(res.getName())
                    .utilisationPercent(Math.round(utilPct * 10.0) / 10.0)
                    .totalBookedHours(totalBookedMinutes / 60)
                    .availableHoursPerDay(availMinutesPerDay / 60)
                    .build());
        }
        // Sort by utilisation descending
        utilisationRates.sort((a, b) -> Double.compare(b.getUtilisationPercent(), a.getUtilisationPercent()));

        // Summary counts
        long totalBookings     = bookingRepository.count();
        long approvedBookings  = bookingRepository.countByStatus(BookingStatus.APPROVED);
        long pendingBookings   = bookingRepository.countByStatus(BookingStatus.PENDING);
        long cancelledBookings = bookingRepository.countByStatus(BookingStatus.CANCELLED);

        return ResourceAnalyticsDTO.builder()
                .topResources(topResources)
                .bookingsByType(bookingsByType)
                .bookingsByHour(bookingsByHour)
                .utilisationRates(utilisationRates)
                .totalBookings(totalBookings)
                .approvedBookings(approvedBookings)
                .pendingBookings(pendingBookings)
                .cancelledBookings(cancelledBookings)
                .build();
    }

    // ── Feature 3: Day Availability Calendar ─────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public DayAvailabilityDTO getDayAvailability(String resourceId, LocalDate date) {
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + resourceId));

        List<Booking> bookings = bookingRepository.findBookingsForResourceOnDate(resourceId, date);

        List<DayAvailabilityDTO.BookedSlot> slots = bookings.stream()
                .map(b -> DayAvailabilityDTO.BookedSlot.builder()
                        .bookingId(b.getId())
                        .startTime(b.getStartTime().toString())
                        .endTime(b.getEndTime().toString())
                        .status(b.getStatus().name())
                        .bookedByName(b.getUser() != null ? b.getUser().getName() : "Unknown")
                        .purpose(b.getPurpose())
                        .build())
                .collect(Collectors.toList());

        return DayAvailabilityDTO.builder()
                .resourceId(resource.getId())
                .resourceName(resource.getName())
                .date(date)
                .availabilityStart(resource.getAvailabilityStart().toString())
                .availabilityEnd(resource.getAvailabilityEnd().toString())
                .bookedSlots(slots)
                .build();
    }

    // ── Mapper ────────────────────────────────────────────────────────────────

    private ResourceResponseDTO mapToDTO(Resource r) {
        return ResourceResponseDTO.builder()
                .id(r.getId())
                .name(r.getName())
                .type(r.getType())
                .capacity(r.getCapacity())
                .location(r.getLocation())
                .description(r.getDescription())
                .availabilityStart(r.getAvailabilityStart())
                .availabilityEnd(r.getAvailabilityEnd())
                .status(r.getStatus())
                .building(r.getBuilding())
                .floor(r.getFloor())
                .roomNumber(r.getRoomNumber())
                .brand(r.getBrand())
                .model(r.getModel())
                .serialNumber(r.getSerialNumber())
                .imageUrl(r.getImageUrl())
                .createdById(r.getCreatedBy() != null ? r.getCreatedBy().getId() : null)
                .createdByName(r.getCreatedBy() != null ? r.getCreatedBy().getName() : null)
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }
}
