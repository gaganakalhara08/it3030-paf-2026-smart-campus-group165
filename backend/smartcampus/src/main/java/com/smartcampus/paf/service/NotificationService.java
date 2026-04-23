package com.smartcampus.paf.service;

import com.smartcampus.paf.model.Notification;
import com.smartcampus.paf.model.User;

import java.util.List;

public interface NotificationService {

    void notifyUser(User user,
                    String title,
                    String message,
                    String type,
                    String action,
                    Long referenceId);

    List<Notification> getUserNotifications(User user);

    List<Notification> getUnreadNotifications(User user);

    void markAsRead(String notificationId);
}