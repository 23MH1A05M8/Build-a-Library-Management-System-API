const Transaction = require("../models/Transaction");
const Book = require("../models/Book");
const Member = require("../models/Member");
const { Op } = require("sequelize");

// Get all overdue transactions
exports.getOverdueTransactions = async (req, res) => {
  try {
    const today = new Date();

    // Find transactions that are active and past due
    const overdueTransactions = await Transaction.findAll({
      where: {
        status: "active",
        due_date: { [Op.lt]: today }
      },
      include: [Book, Member]
    });

    // Optionally mark them as overdue
    for (let tx of overdueTransactions) {
      await tx.update({ status: "overdue" });
    }

    res.json(overdueTransactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching overdue transactions" });
  }
};
