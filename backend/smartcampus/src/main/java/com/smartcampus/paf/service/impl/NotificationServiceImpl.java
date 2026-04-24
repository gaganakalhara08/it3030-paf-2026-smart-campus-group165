package com.smartcampus.paf.service.impl;

import com.smartcampus.paf.model.Notification;
import com.smartcampus.paf.model.User;
import com.smartcampus.paf.repository.NotificationRepository;
import com.smartcampus.paf.service.NotificationService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationServiceImpl(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Override
    public void notifyUser(User user,
                           String title,
                           String message,
                           String type,
                           String action,
                           String referenceId) {

        System.out.println("🔥 NOTIFICATION METHOD CALLED");

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setAction(action);
        notification.setReferenceId(referenceId);
        notification.setRead(false);

        notificationRepository.save(notification);
    }

    @Override
    public List<Notification> getUserNotifications(User user) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user);
    }

    @Override
    public List<Notification> getUnreadNotifications(User user) {
        return notificationRepository.findByUserAndIsReadFalse(user);
    }

    @Override
    public void markAsRead(String notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    // 🔥 ONLY THIS METHOD ADDED
    @Override
    public void deleteNotification(String notificationId, User user) {

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        // 🔐 Ensure user owns this notification
        if (!notification.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to delete this notification");
        }

        notificationRepository.delete(notification);
    }
}