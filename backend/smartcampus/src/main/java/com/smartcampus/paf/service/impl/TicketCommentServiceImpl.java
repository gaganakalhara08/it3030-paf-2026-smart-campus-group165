package com.smartcampus.paf.service.impl;

import com.smartcampus.paf.dto.request.TicketCommentRequestDTO;
import com.smartcampus.paf.dto.response.TicketCommentResponseDTO;
import com.smartcampus.paf.exception.TicketCommentNotFoundException;
import com.smartcampus.paf.exception.TicketNotFoundException;
import com.smartcampus.paf.exception.UnauthorizedException;
import com.smartcampus.paf.model.Ticket;
import com.smartcampus.paf.model.TicketComment;
import com.smartcampus.paf.model.User;
import com.smartcampus.paf.repository.TicketCommentRepository;
import com.smartcampus.paf.repository.TicketRepository;
import com.smartcampus.paf.repository.UserRepository;
import com.smartcampus.paf.service.TicketCommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class TicketCommentServiceImpl implements TicketCommentService {
    
    private final TicketCommentRepository commentRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    
    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("User not found: " + email));
    }
    
    private TicketCommentResponseDTO convertToDTO(TicketComment comment, String currentUserEmail) {
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
    
    @Override
    public TicketCommentResponseDTO addComment(String ticketId, TicketCommentRequestDTO request, String userEmail) {
        User user = getUserByEmail(userEmail);
        
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException("Ticket not found: " + ticketId));
        
        TicketComment comment = new TicketComment();
        comment.setTicket(ticket);
        comment.setUser(user);
        comment.setContent(request.getContent());
        
        TicketComment savedComment = commentRepository.save(comment);
        ticket.getComments().add(savedComment);
        
        return convertToDTO(savedComment, userEmail);
    }
    
    @Override
    public List<TicketCommentResponseDTO> getTicketComments(String ticketId, String userEmail) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException("Ticket not found: " + ticketId));
        
        return commentRepository.findByTicketIdOrderByCreatedAtDesc(ticketId)
                .stream()
                .map(comment -> convertToDTO(comment, userEmail))
                .collect(Collectors.toList());
    }
    
    @Override
    public TicketCommentResponseDTO getCommentById(String commentId, String userEmail) {
        TicketComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new TicketCommentNotFoundException("Comment not found: " + commentId));
        
        return convertToDTO(comment, userEmail);
    }
    
    @Override
    public TicketCommentResponseDTO updateComment(String commentId, TicketCommentRequestDTO request, String userEmail) {
        User user = getUserByEmail(userEmail);
        
        TicketComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new TicketCommentNotFoundException("Comment not found: " + commentId));
        
        // Authorization: Only comment owner can edit
        if (!comment.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("You can only edit your own comments");
        }
        
        comment.setContent(request.getContent());
        TicketComment updatedComment = commentRepository.save(comment);
        
        return convertToDTO(updatedComment, userEmail);
    }
    
    @Override
    public void deleteComment(String commentId, String userEmail) {
        User user = getUserByEmail(userEmail);
        
        TicketComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new TicketCommentNotFoundException("Comment not found: " + commentId));
        
        // Authorization: Only comment owner can delete
        if (!comment.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("You can only delete your own comments");
        }
        
        commentRepository.delete(comment);
    }
}
