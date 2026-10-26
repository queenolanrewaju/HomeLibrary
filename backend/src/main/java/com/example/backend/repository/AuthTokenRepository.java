package com.example.backend.repository;

import com.example.backend.AuthToken;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface AuthTokenRepository extends MongoRepository<AuthToken, String> {
}
