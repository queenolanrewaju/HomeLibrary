package com.example.backend.repository;

import java.util.Optional;

import com.example.backend.Book;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface BookRepository extends MongoRepository<Book, String> {
}
