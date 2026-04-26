package com.smartcampus.paf.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RoleUpdateRequestDTO {
    
    @NotBlank(message = "Role is required")
    private String role;  // ROLE_USER, ROLE_TECHNICIAN, ROLE_ADMIN
}