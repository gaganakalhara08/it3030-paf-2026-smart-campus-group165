package com.smartcampus.paf.dto.request;

import com.smartcampus.paf.model.enums.ResourceStatus;
import com.smartcampus.paf.model.enums.ResourceType;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalTime;

@Data
public class ResourceRequestDTO {

    @NotBlank(message = "Resource name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;

    @NotNull(message = "Resource type is required")
    private ResourceType type;

    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1")
    @Max(value = 10000, message = "Capacity cannot exceed 10000")
    private Integer capacity;

    @NotBlank(message = "Location is required")
    @Size(max = 200, message = "Location must not exceed 200 characters")
    private String location;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    @NotNull(message = "Availability start time is required")
    private LocalTime availabilityStart;

    @NotNull(message = "Availability end time is required")
    private LocalTime availabilityEnd;

    @NotBlank(message = "Building is required")
    private String building;

    private String floor;
    private String roomNumber;

    // Equipment-specific (optional)
    private String brand;
    private String model;
    private String serialNumber;

    private String imageUrl;

    private ResourceStatus status = ResourceStatus.ACTIVE;
}
