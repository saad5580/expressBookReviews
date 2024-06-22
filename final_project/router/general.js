// router/general.js
const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    const userExists = users.some(user => user.username === username);

    if (userExists) {
        return res.status(400).json({ message: "Username already exists" });
    }

    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop using async-await
public_users.get('/', async (req, res) => {
    try {
        const response = await axios.get('https://muhas6638-5000.theianext-1-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/booksdb');
        const booksList = response.data;
        return res.status(200).json(booksList);
    } catch (error) {
        console.error('Error fetching books list:', error.message);
        return res.status(500).json({ message: "Error fetching books list", error: error.message });
    }
});

// Get book details based on ISBN using async-await
public_users.get('/isbn/:isbn', async (req, res) => {
    const isbn = req.params.isbn;
    try {
        const response = await axios.get('https://muhas6638-5000.theianext-1-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/booksdb');
        const books = response.data;
        const book = books[isbn];
        if (book) {
            return res.status(200).json(book);
        } else {
            return res.status(404).json({ message: "Book not found" });
        }
    } catch (error) {
        console.error('Error fetching book details:', error.response ? error.response.data : error.message);
        return res.status(500).json({ message: "Error fetching book details", error: error.response ? error.response.data : error.message });
    }
});

// Get book details based on author using async-await
public_users.get('/author/:author', async (req, res) => {
    const author = req.params.author;
    try {
        const response = await axios.get('https://muhas6638-5000.theianext-1-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/booksdb');
        const books = response.data;
        const booksByAuthor = Object.values(books).filter(book => book.author === author);
        if (booksByAuthor.length > 0) {
            return res.status(200).json(booksByAuthor);
        } else {
            return res.status(404).json({ message: "No books found by this author" });
        }
    } catch (error) {
        console.error('Error fetching books by author:', error.message);
        return res.status(500).json({ message: "Error fetching books by author", error: error.message });
    }
});

// Get book details based on title using async-await
public_users.get('/title/:title', async (req, res) => {
    const title = req.params.title;
    try {
        const response = await axios.get('https://muhas6638-5000.theianext-1-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/booksdb');
        const books = response.data;
        const booksByTitle = Object.values(books).filter(book => book.title === title);
        if (booksByTitle.length > 0) {
            return res.status(200).json(booksByTitle);
        } else {
            return res.status(404).json({ message: "No books found with this title" });
        }
    } catch (error) {
        console.error('Error fetching books by title:', error.message);
        return res.status(500).json({ message: "Error fetching books by title", error: error.message });
    }
});

// Get book reviews based on ISBN
public_users.get('/review/:isbn', async (req, res) => {
    const isbn = req.params.isbn;
    try {
        const book = books[isbn];
        if (book) {
            return res.status(200).json(book.reviews);
        } else {
            return res.status(404).json({ message: "Book not found" });
        }
    } catch (error) {
        console.error('Error fetching book reviews:', error.message);
        return res.status(500).json({ message: "Error fetching book reviews", error: error.message });
    }
});

module.exports.general = public_users;
