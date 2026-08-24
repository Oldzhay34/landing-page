package com.aksa.odyssey;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Odyssey kimlik dogrulama servisi.
 *
 * Bu servis Odyssey kabugunun DIS katmanidir: yalnizca kullanicilar ve oturum
 * (login / refresh / logout / me / profile) ile ilgilenir. Uretilen JWT'yi
 * Capacity Planner backend'i AYNI imza anahtariyla (APP_JWT_SECRET) dogrular,
 * ama artik token URETMEZ - kullanici tablosuna da ihtiyaci yoktur, cunku
 * yetkilendirme icin gereken her sey (rol, takim, departman) token icinde
 * claim olarak tasinir (bkz. JwtTokenProvider).
 */
@SpringBootApplication
public class OdysseyAuthApplication {

    public static void main(String[] args) {
        SpringApplication.run(OdysseyAuthApplication.class, args);
    }
}
