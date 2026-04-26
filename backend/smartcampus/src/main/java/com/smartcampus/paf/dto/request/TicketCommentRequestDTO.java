package com.smartcampus.paf.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TicketCommentRequestDTO {
    
    @NotBlank(message = "Comment content is required")
    private String content;
}
