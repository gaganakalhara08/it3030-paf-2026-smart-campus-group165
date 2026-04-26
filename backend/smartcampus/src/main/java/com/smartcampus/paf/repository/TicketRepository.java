package com.smartcampus.paf.repository;

import com.smartcampus.paf.model.Ticket;
import com.smartcampus.paf.model.enums.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, String> {
    
    // Find tickets by user
    List<Ticket> findByUserId(String userId);
    List<Ticket> findByUserIdOrderByCreatedAtDesc(String userId);
    
    // Find by status
    List<Ticket> findByStatus(TicketStatus status);
    List<Ticket> findByUserIdAndStatus(String userId, TicketStatus status);
    
    // Find assigned tickets
    List<Ticket> findByAssignedToId(String userId);
    List<Ticket> findByAssignedToIdOrderByCreatedAtDesc(String userId);
    
    // Find by resource
    List<Ticket> findByResourceId(String resourceId);
    
    // Find by other criteria
    List<Ticket> findByStatusOrderByPriorityDescCreatedAtDesc(TicketStatus status);
    
    // Count tickets
    long countByStatus(TicketStatus status);
    long countByUserIdAndStatus(String userId, TicketStatus status);
    long countByAssignedToId(String userId);
}
