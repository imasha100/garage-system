const express = require("express");
const router = express.Router();

const {
  getGarageNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} = require("../controllers/notificationController");

// ======================================================
// GET GARAGE NOTIFICATIONS
//
// GET /api/notifications/garage/:garageId
//
// Optional:
// ?targetPage=stock-management
// ?unreadOnly=true
// ======================================================

router.get(
  "/notifications/garage/:garageId",
  getGarageNotifications
);

// ======================================================
// GET UNREAD NOTIFICATION COUNT
//
// GET /api/notifications/garage/:garageId/unread-count
//
// Optional:
// ?targetPage=stock-management
// ======================================================

router.get(
  "/notifications/garage/:garageId/unread-count",
  getUnreadNotificationCount
);

// ======================================================
// MARK ALL GARAGE NOTIFICATIONS AS READ
//
// PUT /api/notifications/garage/:garageId/read-all
//
// Optional Body:
// {
//   "targetPage": "stock-management"
// }
// ======================================================

router.put(
  "/notifications/garage/:garageId/read-all",
  markAllNotificationsAsRead
);

// ======================================================
// MARK ONE NOTIFICATION AS READ
//
// PUT /api/notifications/:notificationId/read
// ======================================================

router.put(
  "/notifications/:notificationId/read",
  markNotificationAsRead
);

// ======================================================
// DELETE ONE NOTIFICATION
//
// DELETE /api/notifications/:notificationId
// ======================================================

router.delete(
  "/notifications/:notificationId",
  deleteNotification
);

// ======================================================
// EXPORT ROUTER
// ======================================================

module.exports = router;