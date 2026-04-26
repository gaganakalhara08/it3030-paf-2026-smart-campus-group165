package com.smartcampus.paf.controller;

import com.smartcampus.paf.model.Notification;
import com.smartcampus.paf.model.User;
import com.smartcampus.paf.repository.UserRepository;
import com.smartcampus.paf.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public NotificationController(NotificationService notificationService,
                                  UserRepository userRepository) {
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    private User getCurrentUser(Authentication authentication) {
        String email = authentication.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // ✅ GET all notifications
    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications(Authentication authentication) {
        User user = getCurrentUser(authentication);
        return ResponseEntity.ok(notificationService.getUserNotifications(user));
    }

    // ✅ GET unread notifications
    @GetMapping("/unread")
    public ResponseEntity<List<Notification>> getUnread(Authentication authentication) {
        User user = getCurrentUser(authentication);
        return ResponseEntity.ok(notificationService.getUnreadNotifications(user));
    }

    // ✅ MARK as read
    @PutMapping("/{id}/read")
    public ResponseEntity<String> markAsRead(@PathVariable String id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok("Notification marked as read");
    }

    // 🔥 DELETE notification (NEW)
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteNotification(@PathVariable String id,
                                                     Authentication authentication) {

        User user = getCurrentUser(authentication);
        notificationService.deleteNotification(id, user);

        return ResponseEntity.ok("Notification deleted successfully");
    }
}