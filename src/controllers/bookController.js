const Book = require("../models/Book");

// Create a new book
exports.createBook = async (req, res) => {
  try {
    let books = req.body;

    // If request is a single object, convert to array
    if (!Array.isArray(books)) {
      books = [books];
    }

    let results = [];

    for (let data of books) {
      const { isbn, title, author, total_copies, available_copies } = data;

      // Check ISBN in database
      let existingBook = await Book.findOne({ where: { isbn } });

      if (existingBook) {
        // ISBN exists but details mismatch → reject
        if (
          existingBook.title !== title ||
          existingBook.author !== author
        ) {
          results.push({
            isbn,
            error: "ISBN exists but book title/author mismatch. Cannot merge."
          });
          continue;
        }

        // If details match → update copies
        existingBook.total_copies += total_copies;
        existingBook.available_copies += available_copies;
        await existingBook.save();

        results.push({
          isbn,
          message: "Copies updated",
          book: existingBook
        });
      } else {
        // Create new book
        const newBook = await Book.create(data);
        results.push({
          isbn,
          message: "Book created",
          book: newBook
        });
      }
    }

    res.status(201).json({ results });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all books
exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.findAll();
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single book by ID
exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) return res.status(404).json({ error: "Book not found" });
    res.json(book);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update book by ID
exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) return res.status(404).json({ error: "Book not found" });
    await book.update(req.body);
    res.json(book);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete book by ID
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) return res.status(404).json({ error: "Book not found" });
    await book.destroy();
    res.json({ message: "Book deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all available books
exports.getAvailableBooks = async (req, res) => {
  try {
    const books = await Book.findAll({ where: { status: "available" } });
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
