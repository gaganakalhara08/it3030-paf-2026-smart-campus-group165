package com.smartcampus.paf.dto.request;

import com.smartcampus.paf.model.enums.TicketCategory;
import com.smartcampus.paf.model.enums.TicketPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;
import java.util.List;

@Data
public class CreateTicketRequestDTO {
    
    @NotBlank(message = "Resource ID is required")
    private String resourceId;
    
    @NotBlank(message = "Resource name is required")
    private String resourceName;
    
    @NotBlank(message = "Resource location is required")
    private String resourceLocation;
    
    @NotBlank(message = "Title is required")
    private String title;
    
    @NotBlank(message = "Description is required")
    private String description;
    
    @NotNull(message = "Category is required")
    private TicketCategory category;
    
    @NotNull(message = "Priority is required")
    private TicketPriority priority;
    
    @NotBlank(message = "Contact email is required")
    private String contactEmail;
    
    @NotBlank(message = "Contact number is required")
    @Pattern(regexp = "^\\d{10}$", message = "Contact number must be exactly 10 digits")
    private String contactPhone;
    
    // List of base64 encoded image data with metadata
    private List<AttachmentDTO> attachments;
    
    @Data
    public static class AttachmentDTO {
        @NotBlank(message = "File name is required")
        private String fileName;
        
        @NotBlank(message = "File type is required")
        private String fileType;
        
        @NotNull(message = "File size is required")
        private Long fileSize;
        
        @NotBlank(message = "File data is required")
        private String fileData; // Base64 encoded
    }
}
