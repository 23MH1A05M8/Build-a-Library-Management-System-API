const Member = require("../models/Member");
const Transaction = require("../models/Transaction");

// Create a new member
exports.createMember = async (req, res) => {
  try {
    let members = req.body;

    // If single object → convert to array
    if (!Array.isArray(members)) {
      members = [members];
    }

    let results = [];

    for (let data of members) {
      try {
        const newMember = await Member.create(data);
        results.push({
          message: "Member created successfully",
          member: newMember
        });
      } catch (err) {
        results.push({
          error: "Failed to create member",
          details: err.message,
          input: data
        });
      }
    }

    res.status(201).json({ results });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all members
exports.getAllMembers = async (req, res) => {
  try {
    const members = await Member.findAll();
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get member by ID
exports.getMemberById = async (req, res) => {
  try {
    const member = await Member.findByPk(req.params.id);
    if (!member) return res.status(404).json({ error: "Member not found" });
    res.json(member);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update member by ID
exports.updateMember = async (req, res) => {
  try {
    const member = await Member.findByPk(req.params.id);
    if (!member) return res.status(404).json({ error: "Member not found" });
    await member.update(req.body);
    res.json(member);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete member by ID
exports.deleteMember = async (req, res) => {
  try {
    const member = await Member.findByPk(req.params.id);
    if (!member) return res.status(404).json({ error: "Member not found" });
    await member.destroy();
    res.json({ message: "Member deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get books currently borrowed by a member
exports.getBorrowedBooks = async (req, res) => {
  try {
    const member = await Member.findByPk(req.params.id);
    if (!member) return res.status(404).json({ error: "Member not found" });

    const transactions = await Transaction.findAll({
      where: { member_id: member.id, status: "active" },
      include: "Book",
    });

    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
