const express = require("express");
const router = express.Router();

const {
  addStock,
  getCategories,
  getNextBatchNumber,
  getGarageStock,
  getGarageBillItems,
} = require("../controllers/stockController");

// ======================================================
// GET ADMIN-CREATED STOCK CATEGORIES
// GET /api/stock/categories
// ======================================================

router.get(
  "/stock/categories",
  getCategories
);

// ======================================================
// GET NEXT AUTO-GENERATED BATCH NUMBER
// GET /api/stock/next-batch-number/:categoryId
// ======================================================

router.get(
  "/stock/next-batch-number/:categoryId",
  getNextBatchNumber
);

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