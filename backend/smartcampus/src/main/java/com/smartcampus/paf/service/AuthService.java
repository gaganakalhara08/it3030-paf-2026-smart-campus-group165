package com.smartcampus.paf.service;

import com.smartcampus.paf.dto.request.LoginRequestDTO;
import com.smartcampus.paf.dto.request.SignupRequestDTO;
import com.smartcampus.paf.dto.response.AuthResponseDTO;

public interface AuthService {

    void signup(SignupRequestDTO request);

    AuthResponseDTO login(LoginRequestDTO request);
}