const db = require("../config/db");

// ======================================================
// CREATE NOTIFICATION
// INTERNAL HELPER
//
// Supports:
// - Garage notifications
// - External Driver notifications
// - Customer notifications
// - Assistance Officer notifications
// - Technician notifications
// ======================================================

const createNotification = async ({
  garageId,
  driverId = null,
  customerId = null,
  assistanceId = null,
  technicianId = null,
  notificationType,
  title,
  message,
  targetPage,
  referenceId = null,
  priority = "MEDIUM",
}) => {
  try {
    const numericGarageId =
      Number(garageId);

    const numericDriverId =
      driverId === null ||
      driverId === undefined ||
      driverId === ""
        ? null
        : Number(driverId);

    const numericCustomerId =
      customerId === null ||
      customerId === undefined ||
      customerId === ""
        ? null
        : Number(customerId);

    const numericAssistanceId =
      assistanceId === null ||
      assistanceId === undefined ||
      assistanceId === ""
        ? null
        : Number(assistanceId);

    const numericTechnicianId =
      technicianId === null ||
      technicianId === undefined ||
      technicianId === ""
        ? null
        : Number(technicianId);

    // ==================================================
    // GARAGE VALIDATION
    // garage_id remains required by the current DB schema.
    // ==================================================

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

    // ==================================================
    // OPTIONAL RECIPIENT VALIDATION
    // ==================================================

    if (
      numericDriverId !== null &&
      (
        !Number.isInteger(
          numericDriverId
        ) ||
        numericDriverId <= 0
      )
    ) {
      throw new Error(
        "A valid driver ID is required."
      );
    }

    if (
      numericCustomerId !== null &&
      (
        !Number.isInteger(
          numericCustomerId
        ) ||
        numericCustomerId <= 0
      )
    ) {
      throw new Error(
        "A valid customer ID is required."
      );
    }

    if (
      numericAssistanceId !== null &&
      (
        !Number.isInteger(
          numericAssistanceId
        ) ||
        numericAssistanceId <= 0
      )
    ) {
      throw new Error(
        "A valid assistance ID is required."
      );
    }

    if (
      numericTechnicianId !== null &&
      (
        !Number.isInteger(
          numericTechnicianId
        ) ||
        numericTechnicianId <= 0
      )
    ) {
      throw new Error(
        "A valid technician ID is required."
      );
    }

    // Prevent one notification row from being assigned
    // to multiple individual recipient types at once.

    const recipientCount = [
      numericDriverId,
      numericCustomerId,
      numericAssistanceId,
      numericTechnicianId,
    ].filter(
      (value) => value !== null
    ).length;

    if (
      recipientCount > 1
    ) {
      throw new Error(
        "A notification can target only one individual recipient type."
      );
    }

    // ==================================================
    // PRIORITY
    // ==================================================

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

    // ==================================================
    // INSERT NOTIFICATION
    // ==================================================

    const [result] =
      await db.query(
        `
        INSERT INTO notification (
          garage_id,
          truck_driver_driver_id,
          customer_customer_id,
          assistance_assistance_id,
          technician_technician_id,
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
          numericDriverId,
          numericCustomerId,
          numericAssistanceId,
          numericTechnicianId,
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
//
// NOTE:
// Garage notifications exclude notifications
// targeted to Driver / Customer / Assistance / Technician.
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

        "truck_driver_driver_id IS NULL",

        "customer_customer_id IS NULL",

        "assistance_assistance_id IS NULL",

        "technician_technician_id IS NULL",
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
            truck_driver_driver_id,
            customer_customer_id,
            assistance_assistance_id,
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

          driverId:
            row.truck_driver_driver_id,

          customerId:
            row.customer_customer_id,

          assistanceId:
            row.assistance_assistance_id,

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
// GET GARAGE UNREAD COUNT
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

        "truck_driver_driver_id IS NULL",

        "customer_customer_id IS NULL",

        "assistance_assistance_id IS NULL",

        "technician_technician_id IS NULL",

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
// GET EXTERNAL DRIVER NOTIFICATIONS
//
// GET /api/notifications/driver/:driverId
//
// Optional:
// ?targetPage=tow-assignments
// ?unreadOnly=true
// ======================================================

const getDriverNotifications =
  async (req, res) => {
    try {
      const driverId = Number(
        req.params.driverId
      );

      if (
        !Number.isInteger(
          driverId
        ) ||
        driverId <= 0
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "A valid external driver ID is required.",
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
        "truck_driver_driver_id = ?",
      ];

      const values = [
        driverId,
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
            truck_driver_driver_id,
            customer_customer_id,
            assistance_assistance_id,
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

          driverId:
            row.truck_driver_driver_id,

          customerId:
            row.customer_customer_id,

          assistanceId:
            row.assistance_assistance_id,

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

          driverId,

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
        "========== GET DRIVER NOTIFICATIONS ERROR =========="
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
            "Unable to load external driver notifications.",
        });
    }
  };

// ======================================================
// GET DRIVER UNREAD COUNT
//
// GET /api/notifications/driver/:driverId/unread-count
// ======================================================

const getDriverUnreadNotificationCount =
  async (req, res) => {
    try {
      const driverId = Number(
        req.params.driverId
      );

      if (
        !Number.isInteger(
          driverId
        ) ||
        driverId <= 0
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "A valid external driver ID is required.",
          });
      }

      const targetPage =
        String(
          req.query.targetPage ||
            ""
        ).trim();

      const conditions = [
        "truck_driver_driver_id = ?",
        "is_read = FALSE",
      ];

      const values = [
        driverId,
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

          driverId,

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
        "Get driver unread notification count error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            error.sqlMessage ||
            "Unable to load driver unread notification count.",
        });
    }
  };
  // ======================================================
// GET CUSTOMER NOTIFICATIONS
//
// GET /api/notifications/customer/:customerId
//
// Optional:
// ?targetPage=mobility-recovery
// ?unreadOnly=true
// ======================================================

const getCustomerNotifications =
  async (req, res) => {
    try {
      const customerId = Number(
        req.params.customerId
      );

      if (
        !Number.isInteger(
          customerId
        ) ||
        customerId <= 0
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "A valid customer ID is required.",
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
        "customer_customer_id = ?",
      ];

      const values = [
        customerId,
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
            truck_driver_driver_id,
            customer_customer_id,
            assistance_assistance_id,
            technician_technician_id,
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

          driverId:
            row.truck_driver_driver_id,

          customerId:
            row.customer_customer_id,

          assistanceId:
            row.assistance_assistance_id,

          technicianId:
            row.technician_technician_id,

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

          customerId,

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
        "Get customer notifications error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            error.sqlMessage ||
            "Unable to load customer notifications.",
        });
    }
  };

// ======================================================
// GET CUSTOMER UNREAD COUNT
//
// GET /api/notifications/customer/:customerId/unread-count
// ======================================================

const getCustomerUnreadNotificationCount =
  async (req, res) => {
    try {
      const customerId = Number(
        req.params.customerId
      );

      if (
        !Number.isInteger(
          customerId
        ) ||
        customerId <= 0
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "A valid customer ID is required.",
          });
      }

      const targetPage =
        String(
          req.query.targetPage ||
            ""
        ).trim();

      const conditions = [
        "customer_customer_id = ?",
        "is_read = FALSE",
      ];

      const values = [
        customerId,
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

          customerId,

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
        "Get customer unread notification count error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            error.sqlMessage ||
            "Unable to load customer unread notification count.",
        });
    }
  };

// ======================================================
// GET TECHNICIAN NOTIFICATIONS
//
// GET /api/notifications/technician/:technicianId
//
// Optional:
// ?targetPage=technician-intake
// ?unreadOnly=true
// ======================================================

const getTechnicianNotifications =
  async (req, res) => {
    try {
      const technicianId = Number(
        req.params.technicianId
      );

      if (
        !Number.isInteger(
          technicianId
        ) ||
        technicianId <= 0
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "A valid technician ID is required.",
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
        "technician_technician_id = ?",
      ];

      const values = [
        technicianId,
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
            truck_driver_driver_id,
            customer_customer_id,
            assistance_assistance_id,
            technician_technician_id,
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

          driverId:
            row.truck_driver_driver_id,

          customerId:
            row.customer_customer_id,

          assistanceId:
            row.assistance_assistance_id,

          technicianId:
            row.technician_technician_id,

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

          technicianId,

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
        "========== GET TECHNICIAN NOTIFICATIONS ERROR =========="
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
        "========================================================"
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            error.sqlMessage ||
            "Unable to load technician notifications.",
        });
    }
  };

// ======================================================
// GET TECHNICIAN UNREAD COUNT
//
// GET /api/notifications/technician/:technicianId/unread-count
// ======================================================

const getTechnicianUnreadNotificationCount =
  async (req, res) => {
    try {
      const technicianId = Number(
        req.params.technicianId
      );

      if (
        !Number.isInteger(
          technicianId
        ) ||
        technicianId <= 0
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "A valid technician ID is required.",
          });
      }

      const targetPage =
        String(
          req.query.targetPage ||
            ""
        ).trim();

      const conditions = [
        "technician_technician_id = ?",
        "is_read = FALSE",
      ];

      const values = [
        technicianId,
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

          technicianId,

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
        "Get technician unread notification count error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            error.sqlMessage ||
            "Unable to load technician unread notification count.",
        });
    }
  };

// ======================================================
// GET ASSISTANCE NOTIFICATIONS
//
// GET /api/notifications/assistance/:assistanceId
//
// Optional:
// ?targetPage=incident-dispatch
// ?unreadOnly=true
// ======================================================

const getAssistanceNotifications =
  async (req, res) => {
    try {
      const assistanceId = Number(
        req.params.assistanceId
      );

      if (
        !Number.isInteger(
          assistanceId
        ) ||
        assistanceId <= 0
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "A valid assistance officer ID is required.",
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
        "n.assistance_assistance_id = ?",
      ];

      const values = [
        assistanceId,
      ];

      if (targetPage) {
        conditions.push(
          "n.target_page = ?"
        );

        values.push(
          targetPage
        );
      }

      if (unreadOnly) {
        conditions.push(
          "n.is_read = FALSE"
        );
      }

      const [rows] =
        await db.query(
          `
          SELECT
            n.notification_id,
            n.garage_id,
            n.truck_driver_driver_id,
            n.customer_customer_id,
            n.assistance_assistance_id,
            n.technician_technician_id,
            n.notification_type,
            n.title,
            n.message,
            n.target_page,
            n.reference_id,
            n.priority,
            n.is_read,
            n.created_date,
            n.created_time,

            td.dispatch_id
              AS dispatch_id,

            td.dispatch_status
              AS dispatch_status,

            td.service_request_request_id
              AS request_id,

            sr.ticket_number
              AS ticket_number,

            sr.customer_name
              AS customer_name,

            sr.contact_number
              AS customer_contact,

            sr.vehicle_number
              AS vehicle_number,

            sr.vehicle_type
              AS vehicle_type,

            sr.location
              AS customer_location,

            t.truck_number
              AS truck_number,

            t.truck_type
              AS truck_type,

            t.truck_model
              AS truck_model,

            d.full_name
              AS driver_name,

            d.contact_number
              AS driver_contact,

            g.garage_name
              AS garage_name,

            g.address
              AS garage_address

          FROM notification n

          LEFT JOIN tow_dispatch td
            ON td.dispatch_id =
               n.reference_id

          LEFT JOIN service_request sr
            ON sr.request_id =
               td.service_request_request_id

          LEFT JOIN tow_truck t
            ON t.truck_id =
               td.tow_truck_truck_id

          LEFT JOIN truck_driver d
            ON d.driver_id =
               td.truck_driver_driver_id

          LEFT JOIN garage g
            ON g.garage_id =
               sr.garage_garage_id

          WHERE
            ${conditions.join(
              " AND "
            )}

          ORDER BY
            n.created_date DESC,
            n.created_time DESC,
            n.notification_id DESC

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

          driverId:
            row.truck_driver_driver_id,

          customerId:
            row.customer_customer_id,

          assistanceId:
            row.assistance_assistance_id,

          technicianId:
            row.technician_technician_id,

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

          // ============================================
          // DISPATCH DETAILS
          // ============================================

          dispatchId:
            row.dispatch_id !==
              null &&
            row.dispatch_id !==
              undefined
              ? Number(
                  row.dispatch_id
                )
              : null,

          dispatchStatus:
            row.dispatch_status ||
            null,

          requestId:
            row.request_id !==
              null &&
            row.request_id !==
              undefined
              ? Number(
                  row.request_id
                )
              : null,

          ticketNumber:
            row.ticket_number ||
            null,

          // ============================================
          // CUSTOMER DETAILS
          // ============================================

          customerName:
            row.customer_name ||
            null,

          customerContact:
            row.customer_contact ||
            null,

          customerLocation:
            row.customer_location ||
            null,

          // ============================================
          // VEHICLE DETAILS
          // ============================================

          vehicleNumber:
            row.vehicle_number ||
            null,

          vehicleType:
            row.vehicle_type ||
            null,

          // ============================================
          // TOW TRUCK DETAILS
          // ============================================

          truckNumber:
            row.truck_number ||
            null,

          truckType:
            row.truck_type ||
            null,

          truckModel:
            row.truck_model ||
            null,

          // ============================================
          // DRIVER DETAILS
          // ============================================

          driverName:
            row.driver_name ||
            null,

          driverContact:
            row.driver_contact ||
            null,

          // ============================================
          // GARAGE DETAILS
          // ============================================

          garageName:
            row.garage_name ||
            null,

          garageAddress:
            row.garage_address ||
            null,
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

          assistanceId,

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
        "========== GET ASSISTANCE NOTIFICATIONS ERROR =========="
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
        "========================================================"
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            error.sqlMessage ||
            "Unable to load assistance notifications.",
        });
    }
  };

// ======================================================
// GET ASSISTANCE UNREAD COUNT
//
// GET /api/notifications/assistance/:assistanceId/unread-count
// ======================================================

const getAssistanceUnreadNotificationCount =
  async (req, res) => {
    try {
      const assistanceId = Number(
        req.params.assistanceId
      );

      if (
        !Number.isInteger(
          assistanceId
        ) ||
        assistanceId <= 0
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "A valid assistance officer ID is required.",
          });
      }

      const targetPage =
        String(
          req.query.targetPage ||
            ""
        ).trim();

      const conditions = [
        "assistance_assistance_id = ?",
        "is_read = FALSE",
      ];

      const values = [
        assistanceId,
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

          assistanceId,

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
        "Get assistance unread notification count error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            error.sqlMessage ||
            "Unable to load assistance unread notification count.",
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
          req.params.notificationId
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

      // ==================================================
      // CHECK NOTIFICATION
      // ==================================================

      const [notificationRows] =
        await db.query(
          `
          SELECT
            notification_id,
            is_read
          FROM notification
          WHERE notification_id = ?
          LIMIT 1
          `,
          [notificationId]
        );

      if (
        notificationRows.length ===
        0
      ) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "Notification not found.",
          });
      }

      // ==================================================
      // MARK AS READ
      // ==================================================

      await db.query(
        `
        UPDATE notification
        SET is_read = TRUE
        WHERE notification_id = ?
        `,
        [notificationId]
      );

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
        "Mark notification as read error:",
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
//
// IMPORTANT:
// Garage notifications exclude individual notifications
// for Driver / Customer / Assistance / Technician.
// ======================================================

const markAllNotificationsAsRead =
  async (req, res) => {
    try {
      const garageId =
        Number(
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
          req.body?.targetPage ||
            ""
        ).trim();

      const conditions = [
        "garage_id = ?",
        "truck_driver_driver_id IS NULL",
        "customer_customer_id IS NULL",
        "assistance_assistance_id IS NULL",
        "technician_technician_id IS NULL",
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
            "Garage notifications marked as read.",

          updatedCount:
            result.affectedRows,

          garageId,

          targetPage:
            targetPage ||
            null,
        });
    } catch (error) {
      console.error(
        "Mark garage notifications as read error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            error.sqlMessage ||
            "Unable to mark garage notifications as read.",
        });
    }
  };

// ======================================================
// MARK ALL DRIVER NOTIFICATIONS AS READ
//
// PUT /api/notifications/driver/:driverId/read-all
//
// Optional body:
// {
//   "targetPage": "tow-assignments"
// }
// ======================================================

const markDriverNotificationsAsRead =
  async (req, res) => {
    try {
      const driverId =
        Number(
          req.params.driverId
        );

      if (
        !Number.isInteger(
          driverId
        ) ||
        driverId <= 0
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "A valid external driver ID is required.",
          });
      }

      const targetPage =
        String(
          req.body?.targetPage ||
            ""
        ).trim();

      const conditions = [
        "truck_driver_driver_id = ?",
        "is_read = FALSE",
      ];

      const values = [
        driverId,
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
            "Driver notifications marked as read.",

          updatedCount:
            result.affectedRows,

          driverId,

          targetPage:
            targetPage ||
            null,
        });
    } catch (error) {
      console.error(
        "Mark driver notifications as read error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            error.sqlMessage ||
            "Unable to mark driver notifications as read.",
        });
    }
  };

// ======================================================
// MARK ALL CUSTOMER NOTIFICATIONS AS READ
//
// PUT /api/notifications/customer/:customerId/read-all
//
// Optional body:
// {
//   "targetPage": "progress"
// }
// ======================================================

const markCustomerNotificationsAsRead =
  async (req, res) => {
    try {
      const customerId =
        Number(
          req.params.customerId
        );

      if (
        !Number.isInteger(
          customerId
        ) ||
        customerId <= 0
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "A valid customer ID is required.",
          });
      }

      const targetPage =
        String(
          req.body?.targetPage ||
            ""
        ).trim();

      const conditions = [
        "customer_customer_id = ?",
        "is_read = FALSE",
      ];

      const values = [
        customerId,
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
            "Customer notifications marked as read.",

          updatedCount:
            result.affectedRows,

          customerId,

          targetPage:
            targetPage ||
            null,
        });
    } catch (error) {
      console.error(
        "Mark customer notifications as read error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            error.sqlMessage ||
            "Unable to mark customer notifications as read.",
        });
    }
  };

// ======================================================
// MARK ALL ASSISTANCE NOTIFICATIONS AS READ
//
// PUT /api/notifications/assistance/:assistanceId/read-all
//
// Optional body:
// {
//   "targetPage": "incident-dispatch"
// }
// ======================================================

const markAssistanceNotificationsAsRead =
  async (req, res) => {
    try {
      const assistanceId =
        Number(
          req.params.assistanceId
        );

      if (
        !Number.isInteger(
          assistanceId
        ) ||
        assistanceId <= 0
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "A valid assistance officer ID is required.",
          });
      }

      const targetPage =
        String(
          req.body?.targetPage ||
            ""
        ).trim();

      const conditions = [
        "assistance_assistance_id = ?",
        "is_read = FALSE",
      ];

      const values = [
        assistanceId,
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
            "Assistance notifications marked as read.",

          updatedCount:
            result.affectedRows,

          assistanceId,

          targetPage:
            targetPage ||
            null,
        });
    } catch (error) {
      console.error(
        "Mark assistance notifications as read error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            error.sqlMessage ||
            "Unable to mark assistance notifications as read.",
        });
    }
  };

// ======================================================
// MARK ALL TECHNICIAN NOTIFICATIONS AS READ
//
// PUT /api/notifications/technician/:technicianId/read-all
//
// Optional body:
// {
//   "targetPage": "technician-intake"
// }
// ======================================================

const markTechnicianNotificationsAsRead =
  async (req, res) => {
    try {
      const technicianId =
        Number(
          req.params.technicianId
        );

      if (
        !Number.isInteger(
          technicianId
        ) ||
        technicianId <= 0
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "A valid technician ID is required.",
          });
      }

      const targetPage =
        String(
          req.body?.targetPage ||
            ""
        ).trim();

      const conditions = [
        "technician_technician_id = ?",
        "is_read = FALSE",
      ];

      const values = [
        technicianId,
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
            "Technician notifications marked as read.",

          updatedCount:
            result.affectedRows,

          technicianId,

          targetPage:
            targetPage ||
            null,
        });
    } catch (error) {
      console.error(
        "Mark technician notifications as read error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            error.sqlMessage ||
            "Unable to mark technician notifications as read.",
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
          req.params.notificationId
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

  getDriverNotifications,
  getDriverUnreadNotificationCount,

  getCustomerNotifications,
  getCustomerUnreadNotificationCount,

  getTechnicianNotifications,
  getTechnicianUnreadNotificationCount,

  getAssistanceNotifications,
  getAssistanceUnreadNotificationCount,

  markNotificationAsRead,

  markAllNotificationsAsRead,
  markDriverNotificationsAsRead,
  markCustomerNotificationsAsRead,
  markTechnicianNotificationsAsRead,
  markAssistanceNotificationsAsRead,

  deleteNotification,
};