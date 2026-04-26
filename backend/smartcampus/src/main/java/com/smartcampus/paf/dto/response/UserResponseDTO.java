package com.smartcampus.paf.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.Set;

@Data
@AllArgsConstructor
public class UserResponseDTO {
    private String id;
    private String email;
    private String name;
    private String pictureUrl;
    private Set<String> roles;
}