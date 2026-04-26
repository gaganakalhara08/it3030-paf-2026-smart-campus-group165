package com.smartcampus.paf.repository;

import com.smartcampus.paf.model.TicketAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TicketAttachmentRepository extends JpaRepository<TicketAttachment, String> {
    
    // Find attachments by ticket
    List<TicketAttachment> findByTicketId(String ticketId);
    
    // Count attachments for a ticket
    long countByTicketId(String ticketId);
}
