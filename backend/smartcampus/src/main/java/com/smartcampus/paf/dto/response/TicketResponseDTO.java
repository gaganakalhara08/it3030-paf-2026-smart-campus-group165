package com.smartcampus.paf.dto.response;

import com.smartcampus.paf.model.enums.TicketCategory;
import com.smartcampus.paf.model.enums.TicketPriority;
import com.smartcampus.paf.model.enums.TicketStatus;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class TicketResponseDTO {
    
    private String id;
    
    private String userId;
    private String userName;
    private String userEmail;
    
    private String assignedToId;
    private String assignedToName;
    private String assignedToEmail;
    
    private String resourceId;
    private String resourceName;
    private String resourceLocation;
    
    private String title;
    private String description;
    
    private TicketCategory category;
    private TicketPriority priority;
    private TicketStatus status;
    
    private String contactEmail;
    private String contactPhone;
    
    private String rejectionReason;
    private String resolutionNotes;
    
    private List<TicketAttachmentResponseDTO> attachments;
    private List<TicketCommentResponseDTO> comments;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;
    private LocalDateTime closedAt;
}
