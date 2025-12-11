const express = require("express");
const router = express.Router();
const {
  borrowBook,
  returnBook,
} = require("../controllers/transactionController");
const Transaction = require("../models/Transaction");
const Book = require("../models/Book");
const Member = require("../models/Member");

router.post("/borrow", borrowBook);
router.post("/:id/return", returnBook);

// Add this route to get all transactions
router.get("/", async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      include: [Book, Member]
    });
    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching transactions" });
  }
});

module.exports = router;
