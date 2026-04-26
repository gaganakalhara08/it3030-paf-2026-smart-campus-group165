package com.smartcampus.paf.exception;

public class InvalidBookingRequestException extends RuntimeException {
    
    public InvalidBookingRequestException(String message) {
        super(message);
    }
    
    public InvalidBookingRequestException(String message, Throwable cause) {
        super(message, cause);
    }
}