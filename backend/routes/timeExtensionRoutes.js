const express = require("express");
const router = express.Router();

const {
  createTimeExtension,
} = require("../controllers/timeExtensionController");

// ======================================================
// CREATE / APPROVE TIME EXTENSION
// POST /api/time-extensions
// ======================================================

router.post(
  "/time-extensions",
  createTimeExtension
);

module.exports = router;