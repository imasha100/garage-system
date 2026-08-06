const express = require("express");
const router = express.Router();

const {
  addStock,
  getGarageStock,
  getGarageBillItems,
} = require("../controllers/stockController");

// ======================================================
// ADD STOCK
// POST /api/stock
// ======================================================

router.post(
  "/stock",
  addStock
);

// ======================================================
// GET GARAGE STOCK
// GET /api/stock/garage/:garageId
// ======================================================

router.get(
  "/stock/garage/:garageId",
  getGarageStock
);

// ======================================================
// GET AVAILABLE STOCK ITEMS FOR BILLING
// GET /api/stock/garage/:garageId/bill-items
// ======================================================

router.get(
  "/stock/garage/:garageId/bill-items",
  getGarageBillItems
);

module.exports = router;