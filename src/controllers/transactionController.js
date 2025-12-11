const Book = require("../models/Book");
const Member = require("../models/Member");
const Transaction = require("../models/Transaction");
const Fine = require("../models/Fine");
const { Op } = require("sequelize");

// Borrow a Book
exports.borrowBook = async (req, res) => {
  try {
    const { member_id, book_id } = req.body;

    // 1. Check member exists
    const member = await Member.findByPk(member_id);
    if (!member) return res.status(404).json({ message: "Member not found" });

    // 2. Block suspended members
    if (member.status === "suspended") {
      return res.status(403).json({ message: "Member is suspended" });
    }

    // 3. Block members with unpaid fines
    const unpaidFines = await Fine.findOne({
      where: { member_id, paid_at: null }
    });
    if (unpaidFines) {
      return res.status(403).json({ message: "Member has unpaid fines" });
    }

    // 4. Check active borrowed books count
    const activeBorrows = await Transaction.count({
      where: { member_id, status: "active" }
    });
    if (activeBorrows >= 3) {
      return res.status(403).json({ message: "Borrowing limit reached (3 books)" });
    }

    // 5. Check book exists
    const book = await Book.findByPk(book_id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    // 6. Check availability and status
    if (book.available_copies <= 0) {
      return res.status(400).json({ message: "No copies available" });
    }
    if (book.status === "borrowed") {
      return res.status(400).json({ message: "Book is already borrowed" });
    }

    // 7. Borrow operation
    const borrowedAt = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    const transaction = await Transaction.create({
      member_id,
      book_id,
      borrowed_at: borrowedAt,
      due_date: dueDate,
      status: "active"
    });

    // 8. Update book copies and status
    await book.update({
      available_copies: book.available_copies - 1,
      status: book.available_copies - 1 === 0 ? "borrowed" : "available"
    });

    return res.json({
      message: "Book borrowed successfully",
      transaction
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error borrowing book" });
  }
};

// Return a Book
exports.returnBook = async (req, res) => {
  try {
    const transactionId = req.params.id;
    const transaction = await Transaction.findByPk(transactionId);
    if (!transaction)
      return res.status(404).json({ message: "Transaction not found" });

    // Only skip if already returned
    if (transaction.status === "returned") {
  return res.status(400).json({ message: "Book already returned" });
}

    const book = await Book.findByPk(transaction.book_id);
    const member = await Member.findByPk(transaction.member_id);

    // Calculate overdue days
    const now = new Date();
    const due = new Date(transaction.due_date);
    const overdueDays = Math.max(0, Math.ceil((now - due) / (1000 * 60 * 60 * 24)));

    let fineAmount = 0;

    if (overdueDays > 0 && transaction.status !== "overdue") {
      fineAmount = overdueDays * 0.5;

      // Create fine entry
      await Fine.create({
        member_id: member.id,
        transaction_id: transaction.id,
        amount: fineAmount
      });

      // Mark transaction as overdue before returning
      await transaction.update({ status: "overdue" });
    }

    // Update transaction to returned
    await transaction.update({
      status: "returned",
      returned_at: now
    });

    // Update book
    const newAvailable = Math.min(book.available_copies + 1, book.total_copies);
await book.update({
  available_copies: newAvailable,
  status: newAvailable > 0 ? "available" : "borrowed"
});


   const { Sequelize } = require("sequelize"); // make sure Sequelize is imported

// Count returned transactions that were overdue
const overdueCount = await Transaction.count({
  where: {
    member_id: member.id,
    returned_at: { [Op.ne]: null },
    [Op.and]: Sequelize.literal('returned_at > due_date')
  }
});

// Suspend member if they have 3 or more overdue returns
if (overdueCount >= 3) {
  await member.update({ status: "suspended" });
}


    return res.json({
      message: "Book returned successfully",
      fineAmount
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error returning book" });
  }
};
