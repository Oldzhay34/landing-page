package com.aksa.odyssey.auth.api.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(@NotBlank String sicil, @NotBlank String password) {
}
