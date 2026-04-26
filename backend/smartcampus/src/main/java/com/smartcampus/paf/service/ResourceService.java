package com.smartcampus.paf.service;

import com.smartcampus.paf.dto.request.ResourceRequestDTO;
import com.smartcampus.paf.dto.response.DayAvailabilityDTO;
import com.smartcampus.paf.dto.response.ResourceAnalyticsDTO;
import com.smartcampus.paf.dto.response.ResourceResponseDTO;
import com.smartcampus.paf.model.enums.ResourceStatus;
import com.smartcampus.paf.model.enums.ResourceType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.Map;

public interface ResourceService {

    ResourceResponseDTO createResource(ResourceRequestDTO dto, String adminEmail);

    ResourceResponseDTO getResourceById(String id);

    Page<ResourceResponseDTO> searchResources(
            ResourceType type,
            ResourceStatus status,
            Integer minCapacity,
            String location,
            String keyword,
            Pageable pageable
    );

    ResourceResponseDTO updateResource(String id, ResourceRequestDTO dto);

    ResourceResponseDTO updateResourceStatus(String id, ResourceStatus status);

    void deleteResource(String id);

    Map<String, Long> getResourceStats();

    // ── Feature 1: Usage Analytics
    ResourceAnalyticsDTO getAnalytics();

    // ── Feature 3: Day Availability Calendar
    DayAvailabilityDTO getDayAvailability(String resourceId, LocalDate date);
}
