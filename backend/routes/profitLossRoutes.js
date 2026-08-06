const express = require("express");
const router = express.Router();

const {
  getGarageProfitLoss,
} = require("../controllers/profitLossController");

// ======================================================
// GET GARAGE PROFIT & LOSS
// GET /api/profit-loss/garage/:garageId
// ======================================================

router.get(
  "/profit-loss/garage/:garageId",
  getGarageProfitLoss
);

module.exports = router;