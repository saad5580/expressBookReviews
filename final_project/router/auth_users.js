// router/auth_user.js
const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    return typeof username === 'string' && username.trim().length > 0;
}

const authenticatedUser = (username, password) => {
    const user = users.find(user => user.username === username && user.password === password);
    return user !== undefined;
}

// Only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (!isValid(username)) {
        return res.status(400).json({ message: "Invalid username" });
    }

    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid username or password" });
    }

    // Generate a JWT token
    const token = jwt.sign({ username }, "your_jwt_secret_key", { expiresIn: '1h' });

    // Save the token in the session
    req.session.token = token;

    return res.status(200).json({ message: "Login successful", token });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.body.review;
    const token = req.session.token;

    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    jwt.verify(token, "your_jwt_secret_key", (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Invalid token" });
        }

        const username = decoded.username;
        const book = books[isbn];

        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        if (!book.reviews) {
            book.reviews = {};
        }
        book.reviews[username] = review;

        return res.status(200).json({ message: "Review added/updated successfully", reviews: book.reviews });
    });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const token = req.session.token;

    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    jwt.verify(token, "your_jwt_secret_key", (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Invalid token" });
        }

        const username = decoded.username;
        const book = books[isbn];

        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        if (book.reviews && book.reviews[username]) {
            delete book.reviews[username];
            return res.status(200).json({ message: "Review deleted successfully", reviews: book.reviews });
        } else {
            return res.status(404).json({ message: "Review not found" });
        }
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
