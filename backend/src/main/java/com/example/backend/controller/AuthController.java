package com.example.backend.controller;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;

import com.example.backend.AuthToken;
import com.example.backend.User;
import com.example.backend.repository.AuthTokenRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Duration TOKEN_LIFETIME = Duration.ofDays(30);
    private static final SecureRandom RANDOM = new SecureRandom();

    private final UserRepository users;
    private final AuthTokenRepository tokens;
    private final PasswordEncoder encoder;

    public AuthController(UserRepository users, AuthTokenRepository tokens, PasswordEncoder encoder) {
        this.users = users;
        this.tokens = tokens;
        this.encoder = encoder;
    }

    public record RegisterRequest(String name, String email, String password) {}
    public record LoginRequest(String email, String password) {}
    public record AuthResponse(String token, User user) {}

    @PostMapping("/register")
    public AuthResponse register(@RequestBody RegisterRequest req) {
        if (isBlank(req.name()) || isBlank(req.email()) || isBlank(req.password())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Name, email and password are required");
        }
        if (req.password().length() < 8) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must be at least 8 characters");
        }
        String email = req.email().trim().toLowerCase();
        if (users.findByEmail(email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }
        User user = users.save(new User(req.name().trim(), email, encoder.encode(req.password())));
        return new AuthResponse(issueToken(user), user);
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest req) {
        String email = req.email() == null ? "" : req.email().trim().toLowerCase();
        User user = users.findByEmail(email).orElse(null);
        // Same message for "no such user" and "wrong password" so attackers can't probe which emails exist.
        if (user == null || req.password() == null || !encoder.matches(req.password(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }
        return new AuthResponse(issueToken(user), user);
    }

    @GetMapping("/me")
    public User me(@RequestHeader(value = "Authorization", required = false) String header) {
        return currentUser(header);
    }

    @PostMapping("/logout")
    public void logout(@RequestHeader(value = "Authorization", required = false) String header) {
        String token = bearer(header);
        if (token != null) {
            tokens.deleteById(token);
        }
    }

    private User currentUser(String header) {
        String token = bearer(header);
        AuthToken stored = token == null ? null : tokens.findById(token).orElse(null);
        // The TTL index only sweeps about once a minute, so also check expiry ourselves.
        if (stored == null || stored.getExpiresAt().isBefore(Instant.now())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not logged in");
        }
        return users.findById(stored.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not logged in"));
    }

    private String issueToken(User user) {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        tokens.save(new AuthToken(token, user.getId(), Instant.now().plus(TOKEN_LIFETIME)));
        return token;
    }

    private static String bearer(String header) {
        return header != null && header.startsWith("Bearer ") ? header.substring(7) : null;
    }

    private static boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
}
