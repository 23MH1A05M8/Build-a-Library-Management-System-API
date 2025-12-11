const express = require("express");
const router = express.Router();
const { getOverdueTransactions } = require("../controllers/overdueController");

// Endpoint to list overdue transactions
router.get("/transactions/overdue", getOverdueTransactions);

module.exports = router;
