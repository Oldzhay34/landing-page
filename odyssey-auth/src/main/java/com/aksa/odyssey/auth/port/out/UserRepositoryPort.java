package com.aksa.odyssey.auth.port.out;

import com.aksa.odyssey.auth.domain.AuthUser;

import java.util.Optional;

public interface UserRepositoryPort {
    Optional<AuthUser> findBySicil(String sicil);

    void save(AuthUser user);
}
