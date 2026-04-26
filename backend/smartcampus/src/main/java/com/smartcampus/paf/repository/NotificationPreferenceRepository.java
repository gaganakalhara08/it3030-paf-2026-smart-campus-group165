package com.smartcampus.paf.repository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.smartcampus.paf.model.NotificationPreference;
import com.smartcampus.paf.model.User;  
import java.util.Optional;

@Repository
public interface NotificationPreferenceRepository 
        extends JpaRepository<NotificationPreference, Long> {

    Optional<NotificationPreference> findByUser(User user);
        }