package com.smartcampus.paf.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TicketCommentResponseDTO {
    
    private String id;
    
    private String ticketId;
    
    private String userId;
    private String userName;
    private String userEmail;
    
    private String content;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    private boolean isOwner; // Flag to indicate if current user owns this comment
}
