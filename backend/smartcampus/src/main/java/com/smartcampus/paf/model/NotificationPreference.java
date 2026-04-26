package com.smartcampus.paf.model;

import jakarta.persistence.*;

@Entity
public class NotificationPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    private User user;

    private boolean bookingEnabled = true;
    private boolean ticketEnabled = true;
    private boolean commentEnabled = true;

    // ===== GETTERS =====

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public boolean isBookingEnabled() {
        return bookingEnabled;
    }

    public boolean isTicketEnabled() {
        return ticketEnabled;
    }

    public boolean isCommentEnabled() {
        return commentEnabled;
    }

    // ===== SETTERS =====

    public void setId(Long id) {
        this.id = id;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public void setBookingEnabled(boolean bookingEnabled) {
        this.bookingEnabled = bookingEnabled;
    }

    public void setTicketEnabled(boolean ticketEnabled) {
        this.ticketEnabled = ticketEnabled;
    }

    public void setCommentEnabled(boolean commentEnabled) {
        this.commentEnabled = commentEnabled;
    }
}