package com.example.backend.repository;

import java.util.Optional;

import com.example.backend.User;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface BookRepository extends MongoRepository<User, String> {
    
}
