package com.example.backend;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

// One document per logged-in device. The random token string is the "key" the client holds.
@Document(collection = "auth_tokens")
public class AuthToken {
    @Id
    private String token;

    private String userId;

    // Mongo deletes the document automatically once this time has passed (TTL index).
    @Indexed(expireAfterSeconds = 0)
    private Instant expiresAt;

    public AuthToken() {}

    public AuthToken(String token, String userId, Instant expiresAt) {
        this.token = token;
        this.userId = userId;
        this.expiresAt = expiresAt;
    }

    public String getToken() { return token; }
    public String getUserId() { return userId; }
    public Instant getExpiresAt() { return expiresAt; }
}
