const db = require("../config/db");

// ======================================================
// CREATE NOTIFICATION
// INTERNAL HELPER
// ======================================================

const createNotification = async ({
  garageId,
  notificationType,
  title,
  message,
  targetPage,
  referenceId = null,
  priority = "MEDIUM",
}) => {
  try {
    const numericGarageId = Number(
      garageId
    );

    if (
      !Number.isInteger(
        numericGarageId
      ) ||
      numericGarageId <= 0
    ) {
      throw new Error(
        "A valid garage ID is required."
      );
    }

    const normalizedPriority =
      String(
        priority || "MEDIUM"
      )
        .trim()
        .toUpperCase();

    const allowedPriorities = [
      "LOW",
      "MEDIUM",
      "HIGH",
    ];

    const finalPriority =
      allowedPriorities.includes(
        normalizedPriority
      )
        ? normalizedPriority
        : "MEDIUM";

    const [result] =
      await db.query(
        `
        INSERT INTO notification (
          garage_id,
          notification_type,
          title,
          message,
          target_page,
          reference_id,
          priority,
          is_read,
          created_date,
          created_time
        )
        VALUES (
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          FALSE,
          CURDATE(),
          CURTIME()
        )
        `,
        [
          numericGarageId,
          String(
            notificationType || ""
          ).trim(),
          String(
            title || ""
          ).trim(),
          String(
            message || ""
          ).trim(),
          String(
            targetPage || ""
          ).trim(),
          referenceId
            ? Number(
                referenceId
              )
            : null,
          finalPriority,
        ]
      );

    return {
      success: true,
      notificationId:
        result.insertId,
    };
  } catch (error) {
    console.error(
      "Create notification helper error:",
      error
    );

    return {
      success: false,
      error:
        error.message ||
        "Unable to create notification.",
    };
  }
};

// ======================================================
// GET GARAGE NOTIFICATIONS
//
// GET /api/notifications/garage/:garageId
//
// Optional:
// ?targetPage=stock-management
// ?unreadOnly=true
// ======================================================

const getGarageNotifications =
  async (req, res) => {
    try {
      const garageId = Number(
        req.params.garageId
      );

      if (
        !Number.isInteger(
          garageId
        ) ||
        garageId <= 0
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "A valid garage ID is required.",
          });
      }

      const targetPage =
        String(
          req.query.targetPage ||
            ""
        ).trim();

      const unreadOnly =
        String(
          req.query.unreadOnly ||
            ""
        )
          .trim()
          .toLowerCase() ===
        "true";

      const conditions = [
        "garage_id = ?",
      ];

      const values = [
        garageId,
      ];

      if (targetPage) {
        conditions.push(
          "target_page = ?"
        );

        values.push(
          targetPage
        );
      }

      if (unreadOnly) {
        conditions.push(
          "is_read = FALSE"
        );
      }

      const [rows] =
        await db.query(
          `
          SELECT
            notification_id,
            garage_id,
            notification_type,
            title,
            message,
            target_page,
            reference_id,
            priority,
            is_read,
            created_date,
            created_time

          FROM notification

          WHERE
            ${conditions.join(
              " AND "
            )}

          ORDER BY
            created_date DESC,
            created_time DESC,
            notification_id DESC

          LIMIT 100
          `,
          values
        );

      const notifications =
        rows.map((row) => ({
          notificationId:
            row.notification_id,

          garageId:
            row.garage_id,

          notificationType:
            row.notification_type,

          title:
            row.title,

          message:
            row.message,

          targetPage:
            row.target_page,

          referenceId:
            row.reference_id,

          priority:
            row.priority,

          isRead:
            Boolean(
              row.is_read
            ),

          createdDate:
            row.created_date,

          createdTime:
            row.created_time,
        }));

      const unreadCount =
        notifications.filter(
          (item) =>
            !item.isRead
        ).length;

      return res
        .status(200)
        .json({
          success: true,

          garageId,

          targetPage:
            targetPage ||
            null,

          unreadCount,

          count:
            notifications.length,

          notifications,
        });
    } catch (error) {
      console.error(
        "========== GET GARAGE NOTIFICATIONS ERROR =========="
      );

      console.error(
        "Code:",
        error.code
      );

      console.error(
        "Message:",
        error.message
      );

      console.error(
        "SQL Message:",
        error.sqlMessage
      );

      console.error(
        "SQL:",
        error.sql
      );

      console.error(
        "===================================================="
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            error.sqlMessage ||
            "Unable to load notifications.",
        });
    }
  };

// ======================================================
// GET UNREAD COUNT
//
// GET /api/notifications/garage/:garageId/unread-count
//
// Optional:
// ?targetPage=stock-management
// ======================================================

const getUnreadNotificationCount =
  async (req, res) => {
    try {
      const garageId = Number(
        req.params.garageId
      );

      if (
        !Number.isInteger(
          garageId
        ) ||
        garageId <= 0
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "A valid garage ID is required.",
          });
      }

      const targetPage =
        String(
          req.query.targetPage ||
            ""
        ).trim();

      const conditions = [
        "garage_id = ?",
        "is_read = FALSE",
      ];

      const values = [
        garageId,
      ];

      if (targetPage) {
        conditions.push(
          "target_page = ?"
        );

        values.push(
          targetPage
        );
      }

      const [rows] =
        await db.query(
          `
          SELECT
            COUNT(*) AS unread_count

          FROM notification

          WHERE
            ${conditions.join(
              " AND "
            )}
          `,
          values
        );

      return res
        .status(200)
        .json({
          success: true,

          garageId,

          targetPage:
            targetPage ||
            null,

          unreadCount:
            Number(
              rows[0]
                ?.unread_count ||
                0
            ),
        });
    } catch (error) {
      console.error(
        "Get unread notification count error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            error.sqlMessage ||
            "Unable to load unread notification count.",
        });
    }
  };

// ======================================================
// MARK ONE NOTIFICATION AS READ
//
// PUT /api/notifications/:notificationId/read
// ======================================================

const markNotificationAsRead =
  async (req, res) => {
    try {
      const notificationId =
        Number(
          req.params
            .notificationId
        );

      if (
        !Number.isInteger(
          notificationId
        ) ||
        notificationId <= 0
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "A valid notification ID is required.",
          });
      }

      const [result] =
        await db.query(
          `
          UPDATE notification

          SET
            is_read = TRUE

          WHERE
            notification_id = ?
          `,
          [
            notificationId,
          ]
        );

      if (
        result.affectedRows ===
        0
      ) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Notification was not found.",
          });
      }

      return res
        .status(200)
        .json({
          success: true,

          message:
            "Notification marked as read.",

          notificationId,
        });
    } catch (error) {
      console.error(
        "Mark notification read error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            error.sqlMessage ||
            "Unable to mark notification as read.",
        });
    }
  };

// ======================================================
// MARK ALL GARAGE NOTIFICATIONS AS READ
//
// PUT /api/notifications/garage/:garageId/read-all
//
// Optional body:
// {
//   "targetPage": "stock-management"
// }
// ======================================================

const markAllNotificationsAsRead =
  async (req, res) => {
    try {
      const garageId = Number(
        req.params.garageId
      );

      if (
        !Number.isInteger(
          garageId
        ) ||
        garageId <= 0
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "A valid garage ID is required.",
          });
      }

      const targetPage =
        String(
          req.body
            ?.targetPage || ""
        ).trim();

      const conditions = [
        "garage_id = ?",
        "is_read = FALSE",
      ];

      const values = [
        garageId,
      ];

      if (targetPage) {
        conditions.push(
          "target_page = ?"
        );

        values.push(
          targetPage
        );
      }

      const [result] =
        await db.query(
          `
          UPDATE notification

          SET
            is_read = TRUE

          WHERE
            ${conditions.join(
              " AND "
            )}
          `,
          values
        );

      return res
        .status(200)
        .json({
          success: true,

          message:
            "Notifications marked as read.",

          updatedCount:
            result.affectedRows,

          garageId,

          targetPage:
            targetPage ||
            null,
        });
    } catch (error) {
      console.error(
        "Mark all notifications read error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            error.sqlMessage ||
            "Unable to mark notifications as read.",
        });
    }
  };

// ======================================================
// DELETE ONE NOTIFICATION
//
// DELETE /api/notifications/:notificationId
// ======================================================

const deleteNotification =
  async (req, res) => {
    try {
      const notificationId =
        Number(
          req.params
            .notificationId
        );

      if (
        !Number.isInteger(
          notificationId
        ) ||
        notificationId <= 0
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "A valid notification ID is required.",
          });
      }

      const [result] =
        await db.query(
          `
          DELETE FROM notification

          WHERE
            notification_id = ?
          `,
          [
            notificationId,
          ]
        );

      if (
        result.affectedRows ===
        0
      ) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Notification was not found.",
          });
      }

      return res
        .status(200)
        .json({
          success: true,

          message:
            "Notification deleted successfully.",

          notificationId,
        });
    } catch (error) {
      console.error(
        "Delete notification error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            error.sqlMessage ||
            "Unable to delete notification.",
        });
    }
  };

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  createNotification,
  getGarageNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
};