package com.smartcampus.paf.exception;

import java.time.LocalDate;
import java.time.LocalTime;

public class TimeSlotConflictException extends RuntimeException {
    
    public TimeSlotConflictException(String resourceId, LocalDate date, LocalTime startTime, LocalTime endTime) {
        super(String.format("Time slot conflict for resource '%s' on %s from %s to %s", 
              resourceId, date, startTime, endTime));
    }
    
    public TimeSlotConflictException(String message) {
        super(message);
    }
}