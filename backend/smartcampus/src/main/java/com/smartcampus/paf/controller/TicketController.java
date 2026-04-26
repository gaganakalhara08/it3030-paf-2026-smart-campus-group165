package com.smartcampus.paf.controller;

import com.smartcampus.paf.dto.request.CreateTicketRequestDTO;
import com.smartcampus.paf.dto.request.TicketStatusUpdateRequestDTO;
import com.smartcampus.paf.dto.request.UpdateTicketRequestDTO;
import com.smartcampus.paf.dto.response.TicketResponseDTO;
import com.smartcampus.paf.exception.UnauthorizedException;
import com.smartcampus.paf.model.enums.TicketStatus;
import com.smartcampus.paf.security.JwtTokenProvider;
import com.smartcampus.paf.service.TicketService;
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
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class TicketController {
    
    private final TicketService ticketService;
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
    
    // ==================== CREATE OPERATIONS ====================
    
    /**
     * Create a new ticket
     * Any authenticated user can create a ticket
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TicketResponseDTO> createTicket(
            @Valid @RequestBody CreateTicketRequestDTO request,
            @RequestHeader("Authorization") String authHeader) {
        String userEmail = getEmailFromToken(authHeader);
        TicketResponseDTO response = ticketService.createTicket(request, userEmail);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    // ==================== READ OPERATIONS ====================
    
    /**
     * Get a specific ticket by ID
     * User can view own ticket or admin/technician can view any
     */
    @GetMapping("/{ticketId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TicketResponseDTO> getTicket(
            @PathVariable String ticketId,
            @RequestHeader("Authorization") String authHeader) {
        String userEmail = getEmailFromToken(authHeader);
        TicketResponseDTO response = ticketService.getTicketById(ticketId, userEmail);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get all tickets for the current user
     * Returns only user's own tickets
     */
    @GetMapping("/user/my-tickets")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<TicketResponseDTO>> getUserTickets(
            @RequestHeader("Authorization") String authHeader) {
        String userEmail = getEmailFromToken(authHeader);
        List<TicketResponseDTO> response = ticketService.getUserTickets(userEmail);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get user's tickets filtered by status
     */
    @GetMapping("/user/my-tickets/status/{status}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<TicketResponseDTO>> getUserTicketsByStatus(
            @PathVariable String status,
            @RequestHeader("Authorization") String authHeader) {
        String userEmail = getEmailFromToken(authHeader);
        TicketStatus ticketStatus = TicketStatus.valueOf(status.toUpperCase());
        List<TicketResponseDTO> response = ticketService.getUserTicketsByStatus(userEmail, ticketStatus);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get all tickets (Admin only)
     */
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TicketResponseDTO>> getAllTickets() {
        List<TicketResponseDTO> response = ticketService.getAllTickets();
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get all tickets by status (Admin only)
     */
    @GetMapping("/admin/all/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TicketResponseDTO>> getAllTicketsByStatus(
            @PathVariable String status) {
        TicketStatus ticketStatus = TicketStatus.valueOf(status.toUpperCase());
        List<TicketResponseDTO> response = ticketService.getAllTicketsByStatus(ticketStatus);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get tickets by resource ID (Admin only)
     */
    @GetMapping("/admin/resource/{resourceId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TicketResponseDTO>> getTicketsByResource(
            @PathVariable String resourceId) {
        List<TicketResponseDTO> response = ticketService.getTicketsByResourceId(resourceId);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get all tickets assigned to the current technician/staff
     */
    @GetMapping("/assigned/my-assignments")
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'STAFF')")
    public ResponseEntity<List<TicketResponseDTO>> getAssignedTickets(
            @RequestHeader("Authorization") String authHeader) {
        String userEmail = getEmailFromToken(authHeader);
        List<TicketResponseDTO> response = ticketService.getAssignedTickets(userEmail);
        return ResponseEntity.ok(response);
    }
    
    // ==================== UPDATE OPERATIONS ====================
    
    /**
     * Update ticket status (Admin/Technician only)
     */
    @PutMapping("/{ticketId}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<TicketResponseDTO> updateTicketStatus(
            @PathVariable String ticketId,
            @Valid @RequestBody TicketStatusUpdateRequestDTO request,
            @RequestHeader("Authorization") String authHeader) {
        String userEmail = getEmailFromToken(authHeader);
        TicketResponseDTO response = ticketService.updateTicketStatus(ticketId, request, userEmail);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Assign ticket to a technician/staff (Admin only)
     */
    @PutMapping("/{ticketId}/assign/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TicketResponseDTO> assignTicket(
            @PathVariable String ticketId,
            @PathVariable String userId,
            @RequestHeader("Authorization") String authHeader) {
        String adminEmail = getEmailFromToken(authHeader);
        TicketResponseDTO response = ticketService.assignTicket(ticketId, userId, adminEmail);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Unassign ticket from technician/staff (Admin only)
     */
    @PutMapping("/{ticketId}/unassign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TicketResponseDTO> unassignTicket(
            @PathVariable String ticketId,
            @RequestHeader("Authorization") String authHeader) {
        String adminEmail = getEmailFromToken(authHeader);
        TicketResponseDTO response = ticketService.unassignTicket(ticketId, adminEmail);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Update ticket details
     * User can update own OPEN ticket or admin can update anytime
     */
    @PutMapping("/{ticketId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TicketResponseDTO> updateTicket(
            @PathVariable String ticketId,
            @Valid @RequestBody UpdateTicketRequestDTO request,
            @RequestHeader("Authorization") String authHeader) {
        String userEmail = getEmailFromToken(authHeader);
        TicketResponseDTO response = ticketService.updateTicket(ticketId, request, userEmail);
        return ResponseEntity.ok(response);
    }
    
    // ==================== DELETE OPERATIONS ====================
    
    /**
     * Delete a ticket
     * User can delete own OPEN ticket or admin can delete
     */
    @DeleteMapping("/{ticketId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> deleteTicket(
            @PathVariable String ticketId,
            @RequestHeader("Authorization") String authHeader) {
        String userEmail = getEmailFromToken(authHeader);
        ticketService.deleteTicket(ticketId, userEmail);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Ticket deleted successfully");
        return ResponseEntity.ok(response);
    }
}
