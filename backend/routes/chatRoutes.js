const express = require("express");
const router = express.Router();

const {
  getGarageConversations,
  getConversationMessages,
  sendChatMessage,
  markConversationAsRead,
} = require("../controllers/chatController");

// ======================================================
// GET CONVERSATIONS FOR ONE GARAGE
// GET /api/chats/garage/:garageId
// ======================================================

router.get(
  "/chats/garage/:garageId",
  getGarageConversations
);

// ======================================================
// GET MESSAGES FOR ONE REQUEST
// GET /api/chats/:requestId/messages
// ======================================================

router.get(
  "/chats/:requestId/messages",
  getConversationMessages
);

// ======================================================
// SEND MESSAGE
// POST /api/chats/messages
// ======================================================

router.post(
  "/chats/messages",
  sendChatMessage
);

// ======================================================
// MARK CUSTOMER MESSAGES AS READ
// PUT /api/chats/:requestId/read
// ======================================================

router.put(
  "/chats/:requestId/read",
  markConversationAsRead
);

module.exports = router;