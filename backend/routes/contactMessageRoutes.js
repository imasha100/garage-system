const express = require("express");

const {
  createContactMessage,
  getContactMessagesByGarage,
  getContactMessageById,
  updateContactMessageStatus,
  deleteContactMessage,
} = require("../controllers/contactMessageController");

const router = express.Router();

// ======================================================
// CREATE CONTACT MESSAGE
// POST /api/contact-messages
// ======================================================
router.post(
  "/",
  createContactMessage
);

// ======================================================
// GET CONTACT MESSAGES BY GARAGE
// GET /api/contact-messages/garage/:garageId
// ======================================================
router.get(
  "/garage/:garageId",
  getContactMessagesByGarage
);

// ======================================================
// GET ONE CONTACT MESSAGE
// GET /api/contact-messages/:messageId
// ======================================================
router.get(
  "/:messageId",
  getContactMessageById
);

// ======================================================
// UPDATE CONTACT MESSAGE STATUS
// PUT /api/contact-messages/:messageId/status
// ======================================================
router.put(
  "/:messageId/status",
  updateContactMessageStatus
);

// ======================================================
// DELETE CONTACT MESSAGE
// DELETE /api/contact-messages/:messageId
// ======================================================
router.delete(
  "/:messageId",
  deleteContactMessage
);

module.exports = router;