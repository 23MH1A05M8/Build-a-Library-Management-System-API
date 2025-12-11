const Book = require("../models/Book");

// Create a new book
exports.createBook = async (req, res) => {
  try {
    const { isbn, total_copies, available_copies } = req.body;

    // Check if a book with the same ISBN exists
    let existingBook = await Book.findOne({
      where: { isbn }
    });

    if (existingBook) {
      // Add copies to existing book
      existingBook.total_copies += total_copies;
      existingBook.available_copies += available_copies;

      await existingBook.save();

      return res.status(200).json({
        message: "Book already exists (ISBN matched). Copies updated.",
        book: existingBook
      });
    }

    // If book does not exist, create new entry
    const newBook = await Book.create(req.body);

    res.status(201).json({
      message: "New book created successfully",
      book: newBook
    });

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
