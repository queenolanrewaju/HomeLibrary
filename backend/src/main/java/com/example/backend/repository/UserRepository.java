package com.example.backend.repository;

import com.example.backend.User;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserRepository
        extends MongoRepository<User, String> {

}