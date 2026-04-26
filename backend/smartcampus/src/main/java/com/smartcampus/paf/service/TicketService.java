package com.smartcampus.paf.service;

import com.smartcampus.paf.dto.request.CreateTicketRequestDTO;
import com.smartcampus.paf.dto.request.TicketStatusUpdateRequestDTO;
import com.smartcampus.paf.dto.request.UpdateTicketRequestDTO;
import com.smartcampus.paf.dto.response.TicketResponseDTO;
import com.smartcampus.paf.model.enums.TicketStatus;
import java.util.List;

public interface TicketService {
    
    // CREATE
    TicketResponseDTO createTicket(CreateTicketRequestDTO request, String userEmail);
    
    // READ - Student/User operations
    TicketResponseDTO getTicketById(String ticketId, String userEmail);
    List<TicketResponseDTO> getUserTickets(String userEmail);
    List<TicketResponseDTO> getUserTicketsByStatus(String userEmail, TicketStatus status);
    
    // READ - Admin operations
    List<TicketResponseDTO> getAllTickets();
    List<TicketResponseDTO> getAllTicketsByStatus(TicketStatus status);
    List<TicketResponseDTO> getTicketsByResourceId(String resourceId);
    List<TicketResponseDTO> getAssignedTickets(String userEmail);
    
    // UPDATE - Status updates (Admin/Technician)
    TicketResponseDTO updateTicketStatus(String ticketId, TicketStatusUpdateRequestDTO request, String userEmail);
    TicketResponseDTO assignTicket(String ticketId, String assignToUserId, String adminEmail);
    TicketResponseDTO unassignTicket(String ticketId, String adminEmail);
    
    // UPDATE - General updates (User/Admin)
    TicketResponseDTO updateTicket(String ticketId, UpdateTicketRequestDTO request, String userEmail);
    
    // DELETE
    void deleteTicket(String ticketId, String userEmail);
}
