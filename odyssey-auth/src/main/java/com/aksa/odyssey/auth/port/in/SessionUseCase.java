package com.aksa.odyssey.auth.port.in;

import com.aksa.odyssey.auth.domain.AuthUser;

/** Oturum yasam dongusu: giris, access token yenileme, cikis. */
public interface SessionUseCase {

    TokenPair login(String sicil, String password);

    TokenPair refresh(String refreshToken);

    void logout(String refreshToken);

    record TokenPair(AuthUser user, String accessToken, String refreshToken) {
    }
}
