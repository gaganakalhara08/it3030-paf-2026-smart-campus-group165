package com.smartcampus.paf.dto.request;

import com.smartcampus.paf.model.enums.TicketCategory;
import com.smartcampus.paf.model.enums.TicketPriority;
import com.smartcampus.paf.model.enums.TicketStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class UpdateTicketRequestDTO {
    
    private String title;
    
    private String description;
    
    private TicketCategory category;
    
    private TicketPriority priority;
    
    private String contactEmail;
    
    @Pattern(regexp = "^\\d{10}$", message = "Contact number must be exactly 10 digits")
    private String contactPhone;
    
    private String resolutionNotes;
}
