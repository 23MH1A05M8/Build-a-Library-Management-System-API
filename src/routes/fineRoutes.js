const express = require("express");
const router = express.Router();
const { payFine,list,getById } = require("../controllers/fineController");


router.get('/fines', list);
router.get('/fines/:id', getById);

// Endpoint to pay a fine
router.post("/fines/:id/pay", payFine);

module.exports = router;
