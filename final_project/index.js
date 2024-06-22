// index.js
const express = require('express');
const jwt = require('jsonwebtoken');
const books = require('./router/booksdb.js');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer", session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false } // Set secure: true if using HTTPS
}));

app.use("/customer/auth/*", function auth(req, res, next) {
    const token = req.session.token;
    if (!token) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    jwt.verify(token, "your_jwt_secret_key", (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Unauthorized: Invalid token" });
        }
        req.user = decoded;
        next();
    });
});

const PORT = 5000;

app.use("/booksdb", (req, res) => {
    res.json(books);
});

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running"));
