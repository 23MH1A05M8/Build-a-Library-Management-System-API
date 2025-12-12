const Fine = require("../models/Fine");
const Member = require("../models/Member");
const Transaction = require("../models/Transaction");

exports.list = async (req, res) => {
  try {
    const fines = await Fine.findAll({
      include: [Member, Transaction]
    });

    // Group fines by member
    const grouped = {};

    fines.forEach(fine => {
      const mId = fine.member_id;

      if (!grouped[mId]) {
        grouped[mId] = {
          member_id: fine.member_id,
          member_name: fine.Member.name,
          member_status: fine.Member.status,
          total_fine: 0,
          fines: []
        };
      }

      grouped[mId].total_fine += parseFloat(fine.amount);

      grouped[mId].fines.push({
        fine_id: fine.id,
        transaction_id: fine.transaction_id,
        amount: parseFloat(fine.amount),
        paid_at: fine.paid_at,
        transaction_status: fine.Transaction.status
      });
    });

    res.json(Object.values(grouped));

  } catch (err) {
    res.status(500).json({ error: "Error fetching fines" });
  }
};


// GET /fines/:id → Get a single fine
exports.getById = async (req, res) => {
  try {
    const fine = await Fine.findByPk(req.params.id, {
      include: [Member, Transaction]
    });

    if (!fine)
      return res.status(404).json({ error: "Fine not found" });

    res.json(fine);
  } catch (err) {
    res.status(500).json({ error: "Error fetching fine" });
  }
};

// Mark a fine as paid
exports.payFine = async (req, res) => {
  try {
    const fineId = req.params.id;

    // Find the fine by ID
    const fine = await Fine.findByPk(fineId);

    if (!fine) return res.status(404).json({ message: "Fine not found" });

    if (fine.paid_at) return res.status(400).json({ message: "Fine already paid" });

    // Mark fine as paid
    fine.paid_at = new Date();
    await fine.save();

    res.json({ message: "Fine paid successfully", fine });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error paying fine" });
  }
};
