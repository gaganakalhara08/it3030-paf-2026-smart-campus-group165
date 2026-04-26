package com.smartcampus.paf.controller;
import com.smartcampus.paf.model.NotificationPreference;
import com.smartcampus.paf.model.User;
import com.smartcampus.paf.repository.NotificationPreferenceRepository;
import com.smartcampus.paf.repository.UserRepository;   
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api/notifications/preferences")
public class NotificationPreferenceController {

    @Autowired
    private NotificationPreferenceRepository repository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public NotificationPreference getPreferences(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();

        return repository.findByUser(user)
                .orElseGet(() -> {
                    NotificationPreference pref = new NotificationPreference();
                    pref.setUser(user);
                    return repository.save(pref);
                });
    }

    @PutMapping
    public NotificationPreference updatePreferences(
            Authentication auth,
            @RequestBody NotificationPreference updated) {

        User user = userRepository.findByEmail(auth.getName()).orElseThrow();

        NotificationPreference pref = repository.findByUser(user)
                .orElse(new NotificationPreference());

        pref.setUser(user);
        pref.setBookingEnabled(updated.isBookingEnabled());
        pref.setTicketEnabled(updated.isTicketEnabled());
        pref.setCommentEnabled(updated.isCommentEnabled());

        return repository.save(pref);
    }
}