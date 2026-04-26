package com.smartcampus.paf.controller;

import com.smartcampus.paf.dto.request.TicketCommentRequestDTO;
import com.smartcampus.paf.dto.response.TicketCommentResponseDTO;
import com.smartcampus.paf.exception.UnauthorizedException;
import com.smartcampus.paf.security.JwtTokenProvider;
import com.smartcampus.paf.service.TicketCommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets/{ticketId}/comments")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class TicketCommentController {
    
    private final TicketCommentService commentService;
    private final JwtTokenProvider jwtTokenProvider;
    
    // Helper method to extract email from token
    private String getEmailFromToken(String authHeader) {
        if (authHeader == null || authHeader.isBlank()) {
            throw new UnauthorizedException("Authorization header is missing");
        }
        
        if (!authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Invalid authorization header format");
        }
        
        String token = authHeader.substring(7);
        if (token.isBlank()) {
            throw new UnauthorizedException("Token is empty");
        }
        
        return jwtTokenProvider.getEmailFromToken(token);
    }
    
    /**
     * Add a comment to a ticket
     * Any authenticated user can add comments
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TicketCommentResponseDTO> addComment(
            @PathVariable String ticketId,
            @Valid @RequestBody TicketCommentRequestDTO request,
            @RequestHeader("Authorization") String authHeader) {
        String userEmail = getEmailFromToken(authHeader);
        TicketCommentResponseDTO response = commentService.addComment(ticketId, request, userEmail);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    /**
     * Get all comments for a ticket
     * Any authenticated user can view comments of a ticket
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<TicketCommentResponseDTO>> getTicketComments(
            @PathVariable String ticketId,
            @RequestHeader("Authorization") String authHeader) {
        String userEmail = getEmailFromToken(authHeader);
        List<TicketCommentResponseDTO> response = commentService.getTicketComments(ticketId, userEmail);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get a specific comment
     */
    @GetMapping("/{commentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TicketCommentResponseDTO> getComment(
            @PathVariable String ticketId,
            @PathVariable String commentId,
            @RequestHeader("Authorization") String authHeader) {
        String userEmail = getEmailFromToken(authHeader);
        TicketCommentResponseDTO response = commentService.getCommentById(commentId, userEmail);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Update a comment
     * Only comment owner can update their own comment
     */
    @PutMapping("/{commentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TicketCommentResponseDTO> updateComment(
            @PathVariable String ticketId,
            @PathVariable String commentId,
            @Valid @RequestBody TicketCommentRequestDTO request,
            @RequestHeader("Authorization") String authHeader) {
        String userEmail = getEmailFromToken(authHeader);
        TicketCommentResponseDTO response = commentService.updateComment(commentId, request, userEmail);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Delete a comment
     * Only comment owner can delete their own comment
     */
    @DeleteMapping("/{commentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> deleteComment(
            @PathVariable String ticketId,
            @PathVariable String commentId,
            @RequestHeader("Authorization") String authHeader) {
        String userEmail = getEmailFromToken(authHeader);
        commentService.deleteComment(commentId, userEmail);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Comment deleted successfully");
        return ResponseEntity.ok(response);
    }
}
