const express = require("express");
const router = express.Router();

const {
  registerAssistance,
  getAllAssistances,
  getAssistanceById,
  updateAssistance,
} = require("../controllers/assistanceController");

// Register Assistance Officer
router.post(
  "/assistances",
  registerAssistance
);

// Get All Assistance Officers
router.get(
  "/assistances",
  getAllAssistances
);

// Get Single Assistance Officer
router.get(
  "/assistances/:id",
  getAssistanceById
);

// Update Assistance Officer
router.put(
  "/assistances/:id",
  updateAssistance
);

module.exports = router;