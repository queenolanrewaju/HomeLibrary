package com.example.backend;

import org.springframework.data.mongodb.core.mapping.Document;
    

@Document(collection = "books")


public class Book {

    private String title;
    private String author;
    private String isbn;
    private String review;
    private Character bookmark;
    private String id;


    public Book(String title, String author, String isbn, String review, Character bookmark, String id) {
        this.title = title;
        this.author = author;
        this.isbn = isbn;
        this.review = review;
        this.bookmark = bookmark;
        this.id = id;
    }

    public String getTitle() { return title; }
    public String getAuthor() { return author; }
    public String getIsbn() { return isbn; }
    public String getReview() { return review; }
    public Character getBookmark() { return bookmark; }
    public String getId() { return id; }


    public void setTitle(String title) { this.title = title; }
    public void setAuthor(String author) { this.author = author; }
    public void setIsbn(String isbn) { this.isbn = isbn; }
    public void setReview(String review) { this.review = review; }
    public void setBookmark(Character bookmark) { this.bookmark = bookmark; }





    
}
