package com.smartcampus.paf.service.impl;

import com.smartcampus.paf.dto.request.ResourceRequestDTO;
import com.smartcampus.paf.dto.response.ResourceResponseDTO;
import com.smartcampus.paf.exception.DuplicateResourceException;
import com.smartcampus.paf.exception.ResourceNotFoundException;
import com.smartcampus.paf.model.Resource;
import com.smartcampus.paf.model.User;
import com.smartcampus.paf.model.enums.ResourceStatus;
import com.smartcampus.paf.model.enums.ResourceType;
import com.smartcampus.paf.repository.ResourceRepository;
import com.smartcampus.paf.repository.UserRepository;
import com.smartcampus.paf.service.ResourceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ResourceServiceImpl implements ResourceService {

    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public ResourceResponseDTO createResource(ResourceRequestDTO dto, String adminEmail) {
        // Validate name uniqueness
        if (resourceRepository.existsByNameIgnoreCase(dto.getName())) {
            throw new DuplicateResourceException("A resource with name '" + dto.getName() + "' already exists.");
        }
        // Validate availability window
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

        // Check name uniqueness excluding current resource
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
        if (dto.getStatus() != null) {
            resource.setStatus(dto.getStatus());
        }

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
        stats.put("total", resourceRepository.count());
        stats.put("active", resourceRepository.countByStatus(ResourceStatus.ACTIVE));
        stats.put("outOfService", resourceRepository.countByStatus(ResourceStatus.OUT_OF_SERVICE));
        stats.put("underMaintenance", resourceRepository.countByStatus(ResourceStatus.UNDER_MAINTENANCE));
        stats.put("lectureHalls", resourceRepository.countByType(ResourceType.LECTURE_HALL));
        stats.put("labs", resourceRepository.countByType(ResourceType.LAB));
        stats.put("meetingRooms", resourceRepository.countByType(ResourceType.MEETING_ROOM));
        stats.put("equipment", resourceRepository.countByType(ResourceType.EQUIPMENT));
        return stats;
    }

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
