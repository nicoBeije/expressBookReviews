const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  let user = req.body;
  if (!user.username || !user.password) {
    return res
      .status(400)
      .json({ message: "Username and Password are required" });
  }
  if (isValid(user.username)) {
    users.push(user);
    return res.status(200).json({ message: "User registered successfully" });
  } else {
    return res.status(400).json({ message: "User already exists" });
  }
});

// Get the book list available in the shop
function fetchBooks() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(books); // Simulate delay and resolve with local books data
    }, 1000); // Delay of 1_000ms
  });
}

// Get the book list available in the shop
public_users.get("/", (req, res) => {
  fetchBooks()
    .then((books) => {
      res.json(books);
    })
    .catch((err) => {
      res.status(500).json({ message: "Failed to fetch books", error: err });
    });
});

// Get book details based on ISBN
async function fetchBookByISBN(isbn) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const book = books[isbn];
      if (book) {
        resolve({ data: book }); // Simulate an Axios-like response with data wrapped in an object
      } else {
        reject(new Error("Book not found"));
      }
    }, 100); // Simulate network delay
  });
}

// Route to get book details by ISBN
public_users.get("/isbn/:isbn", async (req, res) => {
  const isbn = req.params.isbn;
  try {
    const response = await fetchBookByISBN(isbn);
    res.json(response.data); // Access data as if it's from an Axios response
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

// Get book details based on author
async function fetchBooksByAuthor(author) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate database/API latency
      const bookList = Object.values(books).filter(
        (book) => book.author === author
      );
      if (bookList.length > 0) {
        resolve(bookList); // Successfully found books
      } else {
        reject(new Error("No books found for the specified author")); // No books found
      }
    }, 100);
  });
}

// Route to get book details by author using async-await
public_users.get("/author/:author", async (req, res) => {
  const author = req.params.author;
  try {
    const bookList = await fetchBooksByAuthor(author);
    res.json(bookList); // Send the list of books as JSON
  } catch (error) {
    res.status(404).json({ message: error.message }); // Handle errors like not finding any books
  }
});

// Get all books based on title
async function fetchBooksByTitle(title) {
  return new Promise((resolve, reject) => {
      setTimeout(() => {  // Simulate database/API latency
          const bookList = Object.values(books).filter(book => book.title.toLowerCase() === title.toLowerCase());
          if (bookList.length > 0) {
              resolve(bookList);  // Successfully found books
          } else {
              reject(new Error("No books found with the specified title"));  // No books found
          }
      }, 100);
  });
}

// Route to get book details by title using async-await
public_users.get("/title/:title", async (req, res) => {
  const title = req.params.title;
  try {
      const bookList = await fetchBooksByTitle(title);
      res.json(bookList);  // Send the list of books as JSON
  } catch (error) {
      res.status(404).json({ message: error.message });  // Handle errors like not finding any books
  }
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  let isbn = req.params.isbn;
  if (books[isbn]) {
    return res.send(JSON.stringify(books[isbn].reviews));
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
