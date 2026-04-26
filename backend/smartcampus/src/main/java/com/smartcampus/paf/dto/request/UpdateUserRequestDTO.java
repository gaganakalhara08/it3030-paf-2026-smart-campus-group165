package com.smartcampus.paf.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateUserRequestDTO {
    
    @NotBlank(message = "Name is required")
    private String name;
    
    private String pictureUrl;
}