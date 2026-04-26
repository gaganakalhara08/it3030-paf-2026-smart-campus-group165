package com.smartcampus.paf.service.impl;

import com.smartcampus.paf.dto.request.CreateTicketRequestDTO;
import com.smartcampus.paf.dto.request.TicketStatusUpdateRequestDTO;
import com.smartcampus.paf.dto.request.UpdateTicketRequestDTO;
import com.smartcampus.paf.dto.response.TicketAttachmentResponseDTO;
import com.smartcampus.paf.dto.response.TicketCommentResponseDTO;
import com.smartcampus.paf.dto.response.TicketResponseDTO;
import com.smartcampus.paf.exception.InvalidTicketOperationException;
import com.smartcampus.paf.exception.TicketNotFoundException;
import com.smartcampus.paf.exception.UnauthorizedException;
import com.smartcampus.paf.model.Ticket;
import com.smartcampus.paf.model.TicketAttachment;
import com.smartcampus.paf.model.TicketComment;
import com.smartcampus.paf.model.User;
import com.smartcampus.paf.model.enums.Role;
import com.smartcampus.paf.model.enums.TicketStatus;
import com.smartcampus.paf.repository.TicketAttachmentRepository;
import com.smartcampus.paf.repository.TicketCommentRepository;
import com.smartcampus.paf.repository.TicketRepository;
import com.smartcampus.paf.repository.UserRepository;
import com.smartcampus.paf.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.List;
import java.util.stream.Collectors;
import com.smartcampus.paf.service.NotificationService;

@Service
@RequiredArgsConstructor
@Transactional
public class TicketServiceImpl implements TicketService {
    
    private final TicketRepository ticketRepository;
    private final TicketAttachmentRepository attachmentRepository;
    private final TicketCommentRepository commentRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    
    // Helper method to convert Ticket to TicketResponseDTO
    private TicketResponseDTO convertToDTO(Ticket ticket, String currentUserEmail) {
        TicketResponseDTO dto = new TicketResponseDTO();
        dto.setId(ticket.getId());
        
        // User info
        if (ticket.getUser() != null) {
            dto.setUserId(ticket.getUser().getId());
            dto.setUserName(ticket.getUser().getName());
            dto.setUserEmail(ticket.getUser().getEmail());
        }
        
        // Assigned to info
        if (ticket.getAssignedTo() != null) {
            dto.setAssignedToId(ticket.getAssignedTo().getId());
            dto.setAssignedToName(ticket.getAssignedTo().getName());
            dto.setAssignedToEmail(ticket.getAssignedTo().getEmail());
        }
        
        // Resource info
        dto.setResourceId(ticket.getResourceId());
        dto.setResourceName(ticket.getResourceName());
        dto.setResourceLocation(ticket.getResourceLocation());
        
        // Ticket details
        dto.setTitle(ticket.getTitle());
        dto.setDescription(ticket.getDescription());
        dto.setCategory(ticket.getCategory());
        dto.setPriority(ticket.getPriority());
        dto.setStatus(ticket.getStatus());
        dto.setContactEmail(ticket.getContactEmail());
        dto.setContactPhone(ticket.getContactPhone());
        
        // Status specific fields
        dto.setRejectionReason(ticket.getRejectionReason());
        dto.setResolutionNotes(ticket.getResolutionNotes());
        
        // Attachments
        List<TicketAttachmentResponseDTO> attachmentDTOs = ticket.getAttachments().stream()
                .map(this::convertAttachmentToDTO)
                .collect(Collectors.toList());
        dto.setAttachments(attachmentDTOs);
        
        // Comments
        List<TicketCommentResponseDTO> commentDTOs = ticket.getComments().stream()
                .map(comment -> convertCommentToDTO(comment, currentUserEmail))
                .collect(Collectors.toList());
        dto.setComments(commentDTOs);
        
        // Timestamps
        dto.setCreatedAt(ticket.getCreatedAt());
        dto.setUpdatedAt(ticket.getUpdatedAt());
        dto.setResolvedAt(ticket.getResolvedAt());
        dto.setClosedAt(ticket.getClosedAt());
        
        return dto;
    }
    
    private TicketAttachmentResponseDTO convertAttachmentToDTO(TicketAttachment attachment) {
        TicketAttachmentResponseDTO dto = new TicketAttachmentResponseDTO();
        dto.setId(attachment.getId());
        dto.setFileName(attachment.getFileName());
        dto.setFileType(attachment.getFileType());
        dto.setFileSize(attachment.getFileSize());
        dto.setFileData(attachment.getFileData());
        dto.setUploadedAt(attachment.getUploadedAt());
        return dto;
    }
    
    private TicketCommentResponseDTO convertCommentToDTO(TicketComment comment, String currentUserEmail) {
        TicketCommentResponseDTO dto = new TicketCommentResponseDTO();
        dto.setId(comment.getId());
        dto.setTicketId(comment.getTicket().getId());
        dto.setUserId(comment.getUser().getId());
        dto.setUserName(comment.getUser().getName());
        dto.setUserEmail(comment.getUser().getEmail());
        dto.setContent(comment.getContent());
        dto.setCreatedAt(comment.getCreatedAt());
        dto.setUpdatedAt(comment.getUpdatedAt());
        dto.setOwner(comment.getUser().getEmail().equals(currentUserEmail));
        return dto;
    }
    
    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("User not found: " + email));
    }
    
    private boolean isAdmin(User user) {
        return user.getRoles().contains(Role.ROLE_ADMIN);
    }
    
    private boolean isTechnician(User user) {
        return user.getRoles().contains(Role.ROLE_TECHNICIAN);
    }
    
    @Override
    public TicketResponseDTO createTicket(CreateTicketRequestDTO request, String userEmail) {
        User user = getUserByEmail(userEmail);
        
        // Validate contact number format (defense in depth in addition to DTO validation)
        if (request.getContactPhone() == null || !request.getContactPhone().matches("^\\d{10}$")) {
            throw new InvalidTicketOperationException("Contact number must be exactly 10 digits");
        }

        // Validate attachment count (max 3)
        if (request.getAttachments() != null && request.getAttachments().size() > 3) {
            throw new InvalidTicketOperationException("Maximum 3 attachments allowed per ticket");
        }

        // Validate attachment file types (PNG/JPG only)
        Set<String> allowedMimeTypes = Set.of("image/png", "image/jpeg");
        if (request.getAttachments() != null) {
            request.getAttachments().forEach(attachmentDTO -> {
                if (attachmentDTO.getFileType() == null ||
                        !allowedMimeTypes.contains(attachmentDTO.getFileType().toLowerCase())) {
                    throw new InvalidTicketOperationException("Only PNG and JPG images are allowed");
                }
            });
        }
        
        Ticket ticket = new Ticket();
        ticket.setUser(user);
        ticket.setResourceId(request.getResourceId());
        ticket.setResourceName(request.getResourceName());
        ticket.setResourceLocation(request.getResourceLocation());
        ticket.setTitle(request.getTitle());
        ticket.setDescription(request.getDescription());
        ticket.setCategory(request.getCategory());
        ticket.setPriority(request.getPriority());
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setContactEmail(request.getContactEmail());
        ticket.setContactPhone(request.getContactPhone());
        
        // Save ticket first
        Ticket savedTicket = ticketRepository.save(ticket);
        System.out.println("🚀 ABOUT TO CALL NOTIFICATION");

        // 🔔 Notify Admin
        userRepository.findAll().stream()
        .filter(u -> u.getRoles().contains(Role.ROLE_ADMIN))
        .forEach(admin ->
                notificationService.notifyUser(
                        admin,
                        "New Ticket",
                        "New ticket created by " + user.getName(),
                        "TICKET",
                        "CREATED",
                        savedTicket.getId()
                )
        );
        
        // Handle attachments
        if (request.getAttachments() != null) {
            request.getAttachments().forEach(attachmentDTO -> {
                TicketAttachment attachment = new TicketAttachment();
                attachment.setTicket(savedTicket);
                attachment.setFileName(attachmentDTO.getFileName());
                attachment.setFileType(attachmentDTO.getFileType());
                attachment.setFileSize(attachmentDTO.getFileSize());
                attachment.setFileData(attachmentDTO.getFileData());
                attachmentRepository.save(attachment);
                savedTicket.getAttachments().add(attachment);
            });
        }
        
        return convertToDTO(savedTicket, userEmail);
    }
    
    @Override
    public TicketResponseDTO getTicketById(String ticketId, String userEmail) {
        User user = getUserByEmail(userEmail);
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException("Ticket not found: " + ticketId));
        
        // Authorization check: User can see own tickets or if they are admin/technician
        if (!ticket.getUser().getId().equals(user.getId()) && 
            !isAdmin(user) && 
            (ticket.getAssignedTo() == null || !ticket.getAssignedTo().getId().equals(user.getId()))) {
            throw new UnauthorizedException("You don't have permission to view this ticket");
        }
        
        return convertToDTO(ticket, userEmail);
    }
    
    @Override
    public List<TicketResponseDTO> getUserTickets(String userEmail) {
        User user = getUserByEmail(userEmail);
        return ticketRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(ticket -> convertToDTO(ticket, userEmail))
                .collect(Collectors.toList());
    }
    
    @Override
    public List<TicketResponseDTO> getUserTicketsByStatus(String userEmail, TicketStatus status) {
        User user = getUserByEmail(userEmail);
        return ticketRepository.findByUserIdAndStatus(user.getId(), status)
                .stream()
                .map(ticket -> convertToDTO(ticket, userEmail))
                .collect(Collectors.toList());
    }
    
    @Override
    public List<TicketResponseDTO> getAllTickets() {
        return ticketRepository.findAll()
                .stream()
                .map(ticket -> convertToDTO(ticket, ""))
                .collect(Collectors.toList());
    }
    
    @Override
    public List<TicketResponseDTO> getAllTicketsByStatus(TicketStatus status) {
        return ticketRepository.findByStatusOrderByPriorityDescCreatedAtDesc(status)
                .stream()
                .map(ticket -> convertToDTO(ticket, ""))
                .collect(Collectors.toList());
    }
    
    @Override
    public List<TicketResponseDTO> getTicketsByResourceId(String resourceId) {
        return ticketRepository.findByResourceId(resourceId)
                .stream()
                .map(ticket -> convertToDTO(ticket, ""))
                .collect(Collectors.toList());
    }
    
    @Override
    public List<TicketResponseDTO> getAssignedTickets(String userEmail) {
        User user = getUserByEmail(userEmail);
        return ticketRepository.findByAssignedToIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(ticket -> convertToDTO(ticket, userEmail))
                .collect(Collectors.toList());
    }
    
    @Override
    public TicketResponseDTO updateTicketStatus(String ticketId, TicketStatusUpdateRequestDTO request, String userEmail) {
        User user = getUserByEmail(userEmail);
        
        // Authorization: Only admin/technician can update status
        if (!isAdmin(user) && !isTechnician(user)) {
            throw new UnauthorizedException("Only admin/technician can update ticket status");
        }
        
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException("Ticket not found: " + ticketId));
        
        TicketStatus newStatus = TicketStatus.valueOf(request.getStatus().toUpperCase());
        
        // Validate status transition
        validateStatusTransition(ticket.getStatus(), newStatus);
        
        ticket.setStatus(newStatus);
        
        if (newStatus == TicketStatus.RESOLVED) {
            ticket.setResolvedAt(LocalDateTime.now());
            if (request.getResolutionNotes() != null) {
                ticket.setResolutionNotes(request.getResolutionNotes());
            }
        } else if (newStatus == TicketStatus.REJECTED) {
            if (request.getRejectionReason() == null || request.getRejectionReason().isBlank()) {
                throw new InvalidTicketOperationException("Rejection reason is required");
            }
            ticket.setRejectionReason(request.getRejectionReason());
        } else if (newStatus == TicketStatus.CLOSED) {
            ticket.setClosedAt(LocalDateTime.now());
        }
        
        Ticket updatedTicket = ticketRepository.save(ticket);

        // 🔔 Notify User
        notificationService.notifyUser(
                ticket.getUser(),
                "Ticket Updated",
                "Your ticket status is now " + newStatus,
                "TICKET",
                newStatus.toString(),
                updatedTicket.getId()
        );
        return convertToDTO(updatedTicket, userEmail);
    }
    
    private void validateStatusTransition(TicketStatus currentStatus, TicketStatus newStatus) {
        // Valid transitions:
        // OPEN -> IN_PROGRESS, REJECTED
        // IN_PROGRESS -> RESOLVED, REJECTED, IN_PROGRESS (keep same)
        // RESOLVED -> CLOSED
        // Others are invalid
        
        if (currentStatus == newStatus) {
            return; // Same status is allowed
        }
        
        boolean validTransition = false;
        switch (currentStatus) {
            case OPEN:
                validTransition = newStatus == TicketStatus.IN_PROGRESS || newStatus == TicketStatus.REJECTED;
                break;
            case IN_PROGRESS:
                validTransition = newStatus == TicketStatus.RESOLVED || newStatus == TicketStatus.REJECTED;
                break;
            case RESOLVED:
                validTransition = newStatus == TicketStatus.CLOSED;
                break;
            case REJECTED:
            case CLOSED:
                validTransition = false;
                break;
        }
        
        if (!validTransition) {
            throw new InvalidTicketOperationException(
                    "Cannot transition from " + currentStatus + " to " + newStatus);
        }
    }
    
    @Override
    public TicketResponseDTO assignTicket(String ticketId, String assignToUserId, String adminEmail) {
        User admin = getUserByEmail(adminEmail);
        
        // Authorization: Only admin can assign
        if (!isAdmin(admin)) {
            throw new UnauthorizedException("Only admin can assign tickets");
        }
        
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException("Ticket not found: " + ticketId));
        
        User assignTo = userRepository.findById(assignToUserId)
                .orElseThrow(() -> new UnauthorizedException("User not found: " + assignToUserId));
        
        ticket.setAssignedTo(assignTo);
        Ticket updatedTicket = ticketRepository.save(ticket);

        // 🔔 Notify Technician
        notificationService.notifyUser(
                assignTo,
                "Ticket Assigned",
                "A ticket has been assigned to you",
                "TICKET",
                "ASSIGNED",
                updatedTicket.getId()
        );
        
        return convertToDTO(updatedTicket, adminEmail);
    }
    
    @Override
    public TicketResponseDTO unassignTicket(String ticketId, String adminEmail) {
        User admin = getUserByEmail(adminEmail);
        
        // Authorization: Only admin can unassign
        if (!isAdmin(admin)) {
            throw new UnauthorizedException("Only admin can unassign tickets");
        }
        
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException("Ticket not found: " + ticketId));
        
        ticket.setAssignedTo(null);
        Ticket updatedTicket = ticketRepository.save(ticket);
        
        return convertToDTO(updatedTicket, adminEmail);
    }
    
    @Override
    public TicketResponseDTO updateTicket(String ticketId, UpdateTicketRequestDTO request, String userEmail) {
        User user = getUserByEmail(userEmail);
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException("Ticket not found: " + ticketId));
        
        // Authorization: User can update own ticket only if OPEN status, or admin can update
        if (!ticket.getUser().getId().equals(user.getId()) && !isAdmin(user)) {
            throw new UnauthorizedException("You don't have permission to update this ticket");
        }
        
        // User can only edit if ticket is OPEN, admin can edit anytime
        if (!isAdmin(user) && ticket.getStatus() != TicketStatus.OPEN) {
            throw new InvalidTicketOperationException("Can only edit tickets in OPEN status");
        }
        
        if (request.getTitle() != null) {
            ticket.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            ticket.setDescription(request.getDescription());
        }
        if (request.getCategory() != null) {
            ticket.setCategory(request.getCategory());
        }
        if (request.getPriority() != null) {
            ticket.setPriority(request.getPriority());
        }
        if (request.getContactEmail() != null) {
            ticket.setContactEmail(request.getContactEmail());
        }
        if (request.getContactPhone() != null) {
            ticket.setContactPhone(request.getContactPhone());
        }
        if (request.getResolutionNotes() != null && (isAdmin(user) || isTechnician(user))) {
            ticket.setResolutionNotes(request.getResolutionNotes());
        }
        
        Ticket updatedTicket = ticketRepository.save(ticket);
        return convertToDTO(updatedTicket, userEmail);
    }
    
    @Override
    public void deleteTicket(String ticketId, String userEmail) {
        User user = getUserByEmail(userEmail);
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException("Ticket not found: " + ticketId));
        
        // Authorization: User can delete own OPEN ticket or admin can delete
        if (!ticket.getUser().getId().equals(user.getId()) && !isAdmin(user)) {
            throw new UnauthorizedException("You don't have permission to delete this ticket");
        }
        
        if (!isAdmin(user) && ticket.getStatus() != TicketStatus.OPEN) {
            throw new InvalidTicketOperationException("Can only delete tickets in OPEN status");
        }
        
        ticketRepository.delete(ticket);
    }
}
