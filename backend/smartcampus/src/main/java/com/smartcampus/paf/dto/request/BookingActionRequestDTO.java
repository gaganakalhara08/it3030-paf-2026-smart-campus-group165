package com.smartcampus.paf.dto.request;

import lombok.Data;

@Data
public class BookingActionRequestDTO {

    private String reason; // For rejection or cancellation
}