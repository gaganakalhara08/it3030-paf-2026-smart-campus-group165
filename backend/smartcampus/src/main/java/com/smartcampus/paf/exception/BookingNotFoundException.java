package com.smartcampus.paf.exception;

public class BookingNotFoundException extends RuntimeException {
    
    public BookingNotFoundException(String bookingId) {
        super("Booking not found with ID: " + bookingId);
    }
    
    public BookingNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}