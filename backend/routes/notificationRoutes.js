const express = require("express");
const router = express.Router();

const {
  getGarageNotifications,
  getUnreadNotificationCount,

  getDriverNotifications,
  getDriverUnreadNotificationCount,

  getCustomerNotifications,
  getCustomerUnreadNotificationCount,

  getAssistanceNotifications,
  getAssistanceUnreadNotificationCount,

  markNotificationAsRead,
  markAllNotificationsAsRead,
  markDriverNotificationsAsRead,
  markCustomerNotificationsAsRead,
  markAssistanceNotificationsAsRead,

  deleteNotification,
} = require("../controllers/notificationController");

// ======================================================
// GARAGE NOTIFICATIONS
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
// GET GARAGE UNREAD NOTIFICATION COUNT
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
// EXTERNAL DRIVER NOTIFICATIONS
// ======================================================

// GET EXTERNAL DRIVER NOTIFICATIONS
//
// GET /api/notifications/driver/:driverId
//
// Optional:
// ?targetPage=tow-assignments
// ?unreadOnly=true
// ======================================================

router.get(
  "/notifications/driver/:driverId",
  getDriverNotifications
);

// ======================================================
// GET EXTERNAL DRIVER UNREAD COUNT
//
// GET /api/notifications/driver/:driverId/unread-count
//
// Optional:
// ?targetPage=tow-assignments
// ======================================================

router.get(
  "/notifications/driver/:driverId/unread-count",
  getDriverUnreadNotificationCount
);

// ======================================================
// MARK ALL EXTERNAL DRIVER NOTIFICATIONS AS READ
//
// PUT /api/notifications/driver/:driverId/read-all
//
// Optional Body:
// {
//   "targetPage": "tow-assignments"
// }
// ======================================================

router.put(
  "/notifications/driver/:driverId/read-all",
  markDriverNotificationsAsRead
);

// ======================================================
// CUSTOMER NOTIFICATIONS
// ======================================================

// GET CUSTOMER NOTIFICATIONS
//
// GET /api/notifications/customer/:customerId
//
// Optional:
// ?targetPage=mobility-recovery
// ?unreadOnly=true
// ======================================================

router.get(
  "/notifications/customer/:customerId",
  getCustomerNotifications
);

// ======================================================
// GET CUSTOMER UNREAD COUNT
//
// GET /api/notifications/customer/:customerId/unread-count
//
// Optional:
// ?targetPage=mobility-recovery
// ======================================================

router.get(
  "/notifications/customer/:customerId/unread-count",
  getCustomerUnreadNotificationCount
);

// ======================================================
// MARK ALL CUSTOMER NOTIFICATIONS AS READ
//
// PUT /api/notifications/customer/:customerId/read-all
//
// Optional Body:
// {
//   "targetPage": "mobility-recovery"
// }
// ======================================================

router.put(
  "/notifications/customer/:customerId/read-all",
  markCustomerNotificationsAsRead
);

// ======================================================
// ASSISTANCE NOTIFICATIONS
// ======================================================

// GET ASSISTANCE NOTIFICATIONS
//
// GET /api/notifications/assistance/:assistanceId
//
// Optional:
// ?targetPage=incident-dispatch
// ?unreadOnly=true
// ======================================================

router.get(
  "/notifications/assistance/:assistanceId",
  getAssistanceNotifications
);

// ======================================================
// GET ASSISTANCE UNREAD COUNT
//
// GET /api/notifications/assistance/:assistanceId/unread-count
//
// Optional:
// ?targetPage=incident-dispatch
// ======================================================

router.get(
  "/notifications/assistance/:assistanceId/unread-count",
  getAssistanceUnreadNotificationCount
);

// ======================================================
// MARK ALL ASSISTANCE NOTIFICATIONS AS READ
//
// PUT /api/notifications/assistance/:assistanceId/read-all
//
// Optional Body:
// {
//   "targetPage": "incident-dispatch"
// }
// ======================================================

router.put(
  "/notifications/assistance/:assistanceId/read-all",
  markAssistanceNotificationsAsRead
);

// ======================================================
// COMMON NOTIFICATION ROUTES
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