package com.smartcampus.paf.service;

import com.smartcampus.paf.dto.request.TicketCommentRequestDTO;
import com.smartcampus.paf.dto.response.TicketCommentResponseDTO;
import java.util.List;

public interface TicketCommentService {
    
    // CREATE
    TicketCommentResponseDTO addComment(String ticketId, TicketCommentRequestDTO request, String userEmail);
    
    // READ
    List<TicketCommentResponseDTO> getTicketComments(String ticketId, String userEmail);
    TicketCommentResponseDTO getCommentById(String commentId, String userEmail);
    
    // UPDATE - Only owner can edit
    TicketCommentResponseDTO updateComment(String commentId, TicketCommentRequestDTO request, String userEmail);
    
    // DELETE - Only owner can delete
    void deleteComment(String commentId, String userEmail);
}
