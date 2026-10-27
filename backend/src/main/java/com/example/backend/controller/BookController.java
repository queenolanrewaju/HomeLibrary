package com.example.backend.controller;

import com.example.backend.Book;
import org.springframework.web.bind.annotation.*;
import com.example.backend.repository.BookRepository;

import java.util.List;


    @RestController 
    @RequestMapping ("/api/books")

    

public class BookController {
    private final BookRepository bookRepository;

    public BookController(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    @GetMapping
    public List<Book> getAllBooks()  {
        return bookRepository.findAll();
    }
    


}
