const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
  {
    username: "nico",
    password: "1234",
  },
  {
    username: "jane",
    password: "5678",
  },
];

const isValid = (username) => {
  //returns boolean
  //write code to check is the username is valid
  let user = users.find((user) => user.username === username);
  if (user) {
    return false;
  } else {
    return true;
  }
};

// Hint: The code must validate and sign in a customer based on the username and password created in Exercise 6. It must also save the user credentials for the session as a JWT.
// As you are required to login as a customer, while testing the output on Postman, use the endpoint as "customer/login"

const authenticatedUser = (username, password) => {
  //returns boolean
  //write code to check if username and password match the one we have in records.
  let user = users.find(
    (user) => user.username === username && user.password === password
  );
  if (user) {
    return true;
  } else {
    return false;
  }
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  let user = req.body;
  if (authenticatedUser(user.username, user.password)) {
    // Ensure the secret here matches what's used in jwt.verify
    let token = jwt.sign({ username: user.username }, "access", {
      expiresIn: "1h",
    });
    // Store token in session
    req.session.authorization = { accessToken: token };
    return res
      .status(200)
      .json({ message: "User logged in successfully", token: token });
  } else {
    return res.status(400).json({ message: "Invalid credentials" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  const username = req.user.username; // Ensure JWT includes username directly

  if (!review) {
    return res.status(400).json({ message: "Review content is required" });
  }

  if (books[isbn]) {
    if (!books[isbn].reviews) {
      books[isbn].reviews = {};
    }

    // Simplified logic for updating or adding a review
    books[isbn].reviews[username] = review;

    return res.status(200).json({
      message: "Review added or updated successfully",
      book: {
        isbn: isbn,
        title: books[isbn].title,
        author: books[isbn].author,
        reviews: books[isbn].reviews,
      },
    });
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user.username; // Retrieved from JWT after authentication

  if (books[isbn] && books[isbn].reviews && books[isbn].reviews[username]) {
    delete books[isbn].reviews[username]; // Delete the user's review
    return res.status(200).json({
      message: "Review deleted successfully",
      book: {
        isbn: isbn,
        title: books[isbn].title,
        author: books[isbn].author,
        reviews: books[isbn].reviews,
      },
    });
  } else if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  } else {
    return res.status(404).json({ message: "Review not found" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
