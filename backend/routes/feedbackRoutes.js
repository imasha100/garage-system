const express = require("express");
const router = express.Router();

const {
  submitFeedback,
  getGarageFeedback,
  getCustomerFeedback,
} = require("../controllers/feedbackController");

// ======================================================
// SUBMIT CUSTOMER FEEDBACK
// POST /api/feedback
// ======================================================

router.post(
  "/feedback",
  submitFeedback
);

// ======================================================
// GET FEEDBACK FOR ONE GARAGE
// GET /api/feedback/garage/:garageId
// ======================================================

router.get(
  "/feedback/garage/:garageId",
  getGarageFeedback
);

// ======================================================
// GET FEEDBACK HISTORY FOR ONE CUSTOMER
// GET /api/feedback/customer/:customerId
// ======================================================

router.get(
  "/feedback/customer/:customerId",
  getCustomerFeedback
);

module.exports = router;