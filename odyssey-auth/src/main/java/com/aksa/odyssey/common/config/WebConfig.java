package com.aksa.odyssey.common.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

/**
 * Odyssey kabugu API cagrilarini kendi nginx'i uzerinden proxy'liyor; tarayici
 * acisindan istek same-origin ama bu servise ulasan istekte Origin basligi
 * Odyssey'in alan adi olarak geliyor. Liste bu yuzden gerekli - icinde
 * olmayan bir origin'den gelen POST /api/auth/login 403 doner.
 */
@Configuration
@ConfigurationProperties(prefix = "app.cors")
public class WebConfig implements WebMvcConfigurer {

    private List<String> allowedOrigins = List.of("http://localhost:4173");

    public List<String> getAllowedOrigins() {
        return allowedOrigins;
    }

    public void setAllowedOrigins(List<String> allowedOrigins) {
        this.allowedOrigins = allowedOrigins;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(allowedOrigins.toArray(new String[0]))
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
