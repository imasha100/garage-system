const express = require("express");

const router = express.Router();

const {
  getGarageShiftHistory,
} = require("../controllers/shiftHistoryController");

// ======================================================
// GET GARAGE STAFF SHIFT HISTORY
//
// GET /api/shift-history/garage/:garageId
// ======================================================

router.get(
  "/shift-history/garage/:garageId",
  getGarageShiftHistory
);

module.exports = router;