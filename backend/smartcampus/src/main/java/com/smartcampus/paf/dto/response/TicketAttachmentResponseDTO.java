package com.smartcampus.paf.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TicketAttachmentResponseDTO {
    
    private String id;
    
    private String fileName;
    private String fileType;
    private Long fileSize;
    
    private String fileData; // Base64 encoded
    
    private LocalDateTime uploadedAt;
}
