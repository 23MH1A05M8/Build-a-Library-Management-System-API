const Transaction = require("../models/Transaction");
const Book = require("../models/Book");
const Member = require("../models/Member");
const Fine = require("../models/Fine");
const { Op } = require("sequelize");

// DAILY OVERDUE FINE RATE
const DAILY_FINE = 0.5;

// Get all overdue transactions
exports.getOverdueTransactions = async (req, res) => {
  try {
    const today = new Date();

    // 1. Find overdue transactions
    const overdueTransactions = await Transaction.findAll({
      where: {
        due_date: { [Op.lt]: today },
        status: { [Op.in]: ["active", "overdue"] }
      },
      include: [Book, Member]
    });

    // 2. Process each overdue transaction
    for (let tx of overdueTransactions) {

      // Mark as overdue
      if (tx.status !== "overdue") {
        await tx.update({ status: "overdue" });
      }

      // Check if a fine already exists
      const existingFine = await Fine.findOne({
        where: {
          transaction_id: tx.id,
          paid_at: null
        }
      });

      // If fine does not exist → create one
      if (!existingFine) {
        const dueDate = new Date(tx.due_date);
        const overdueDays = Math.ceil(
          (today - dueDate) / (1000 * 60 * 60 * 24)
        );

        const fineAmount = overdueDays * DAILY_FINE;

        await Fine.create({
          member_id: tx.member_id,
          transaction_id: tx.id,
          amount: fineAmount
        });
      }

      // Suspend member if they have 3 or more overdue books
      const overdueCount = await Transaction.count({
        where: {
          member_id: tx.member_id,
          status: "overdue"
        }
      });

      const member = await Member.findByPk(tx.member_id);

      if (overdueCount >= 3 && member.status !== "suspended") {
        await member.update({ status: "suspended" });
      }
    }

    return res.json(overdueTransactions);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error detecting overdue transactions" });
  }
};
