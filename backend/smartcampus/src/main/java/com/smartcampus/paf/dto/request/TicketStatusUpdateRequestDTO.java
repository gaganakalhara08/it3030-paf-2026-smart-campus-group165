package com.smartcampus.paf.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TicketStatusUpdateRequestDTO {
    
    @NotBlank(message = "Status is required")
    private String status;
    
    private String resolutionNotes;
    
    private String rejectionReason;
}
