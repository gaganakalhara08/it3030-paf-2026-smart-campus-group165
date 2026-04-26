package com.smartcampus.paf.repository;

import com.smartcampus.paf.model.TicketComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TicketCommentRepository extends JpaRepository<TicketComment, String> {
    
    // Find comments by ticket
    List<TicketComment> findByTicketIdOrderByCreatedAtDesc(String ticketId);
    List<TicketComment> findByTicketId(String ticketId);
    
    // Find comments by user
    List<TicketComment> findByUserId(String userId);
    
    // Count comments for a ticket
    long countByTicketId(String ticketId);
    
    // Find by ticket and user (for edit/delete permission check)
    int countByTicketIdAndUserId(String ticketId, String userId);
}
