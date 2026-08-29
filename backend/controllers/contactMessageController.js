const db = require("../config/db");

const {
  createNotification,
} = require("./notificationController");

// ======================================================
// CREATE CONTACT MESSAGE
// Start Page -> Contact Us
// ======================================================

const createContactMessage = async (req, res) => {
  try {
    const {
      garageId,
      fullName,
      email,
      contactNumber,
      message,
    } = req.body;

    // --------------------------------------------------
    // VALIDATION
    // --------------------------------------------------

    if (
      !garageId ||
      !fullName?.trim() ||
      !email?.trim() ||
      !contactNumber?.trim() ||
      !message?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please select a garage and complete all contact form fields.",
      });
    }

    const parsedGarageId = Number(garageId);

    if (
      !Number.isInteger(parsedGarageId) ||
      parsedGarageId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid garage.",
      });
    }

    // --------------------------------------------------
    // CHECK SELECTED GARAGE EXISTS
    // --------------------------------------------------

    const [garageRows] = await db.query(
      `
        SELECT
          garage_id,
          garage_name,
          address
        FROM garage
        WHERE garage_id = ?
        LIMIT 1
      `,
      [parsedGarageId]
    );

    if (!garageRows.length) {
      return res.status(404).json({
        success: false,
        message:
          "The selected garage could not be found.",
      });
    }

    const garage = garageRows[0];

    // --------------------------------------------------
    // SAVE CONTACT MESSAGE
    // --------------------------------------------------

    const [result] = await db.query(
      `
        INSERT INTO contact_message
        (
          garage_garage_id,
          email,
          contact_number,
          message,
          submitted_date,
          submitted_time,
          full_name,
          status
        )
        VALUES
        (
          ?,
          ?,
          ?,
          ?,
          CURDATE(),
          CURTIME(),
          ?,
          'NEW'
        )
      `,
      [
        parsedGarageId,
        email.trim(),
        contactNumber.trim(),
        message.trim(),
        fullName.trim(),
      ]
    );

    const messageId = result.insertId;

    // --------------------------------------------------
    // GARAGE OWNER NOTIFICATION
    // Garage-level notification.
    // --------------------------------------------------

    try {
      await createNotification({
        garageId: parsedGarageId,

        notificationType:
          "NEW_CONTACT_INQUIRY",

        title:
          "New Contact Inquiry",

        message: `${fullName.trim()} sent a new contact message to ${
          garage.garage_name ||
          "your garage"
        }.`,

        targetPage:
          "contact-messages",

        referenceId:
          messageId,

        priority:
          "NORMAL",
      });
    } catch (notificationError) {
      // Contact message is already saved.
      // Notification failure should not delete/fail the message.

      console.error(
        "Contact message notification error:",
        notificationError
      );
    }

    // --------------------------------------------------
    // SUCCESS RESPONSE
    // --------------------------------------------------

    return res.status(201).json({
      success: true,

      message:
        "Your message has been sent successfully.",

      data: {
        messageId,

        garageId:
          parsedGarageId,

        garageName:
          garage.garage_name,

        garageAddress:
          garage.address,

        status:
          "NEW",
      },
    });
  } catch (error) {
    console.error(
      "Create contact message error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to send your message. Please try again.",
    });
  }
};

// ======================================================
// GET CONTACT MESSAGES BY GARAGE
// Garage Owner -> Contact Messages
// ======================================================

const getContactMessagesByGarage = async (
  req,
  res
) => {
  try {
    const garageId =
      Number(req.params.garageId);

    if (
      !Number.isInteger(garageId) ||
      garageId <= 0
    ) {
      return res.status(400).json({
        success: false,

        message:
          "A valid garage ID is required.",
      });
    }

    const [rows] = await db.query(
      `
        SELECT
          cm.message_id,
          cm.garage_garage_id,
          cm.full_name,
          cm.email,
          cm.contact_number,
          cm.message,
          cm.submitted_date,
          cm.submitted_time,
          cm.status,

          g.garage_name,
          g.address AS garage_address

        FROM contact_message cm

        LEFT JOIN garage g
          ON g.garage_id =
             cm.garage_garage_id

        WHERE cm.garage_garage_id = ?

        ORDER BY
          cm.submitted_date DESC,
          cm.submitted_time DESC,
          cm.message_id DESC
      `,
      [garageId]
    );

    return res.status(200).json({
      success: true,
      messages: rows,
    });
  } catch (error) {
    console.error(
      "Get contact messages error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to load contact messages.",
    });
  }
};

// ======================================================
// GET ONE CONTACT MESSAGE
// ======================================================

const getContactMessageById = async (
  req,
  res
) => {
  try {
    const messageId =
      Number(req.params.messageId);

    if (
      !Number.isInteger(messageId) ||
      messageId <= 0
    ) {
      return res.status(400).json({
        success: false,

        message:
          "A valid message ID is required.",
      });
    }

    const [rows] = await db.query(
      `
        SELECT
          cm.message_id,
          cm.garage_garage_id,
          cm.full_name,
          cm.email,
          cm.contact_number,
          cm.message,
          cm.submitted_date,
          cm.submitted_time,
          cm.status,

          g.garage_name,
          g.address AS garage_address

        FROM contact_message cm

        LEFT JOIN garage g
          ON g.garage_id =
             cm.garage_garage_id

        WHERE cm.message_id = ?

        LIMIT 1
      `,
      [messageId]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,

        message:
          "Contact message not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: rows[0],
    });
  } catch (error) {
    console.error(
      "Get contact message error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to load the contact message.",
    });
  }
};

// ======================================================
// UPDATE CONTACT MESSAGE STATUS
// NEW -> READ -> REPLIED -> CLOSED
// ======================================================

const updateContactMessageStatus = async (
  req,
  res
) => {
  try {
    const messageId =
      Number(req.params.messageId);

    const status = String(
      req.body.status || ""
    )
      .trim()
      .toUpperCase();

    if (
      !Number.isInteger(messageId) ||
      messageId <= 0
    ) {
      return res.status(400).json({
        success: false,

        message:
          "A valid message ID is required.",
      });
    }

    const allowedStatuses = [
      "NEW",
      "READ",
      "REPLIED",
      "CLOSED",
    ];

    if (
      !allowedStatuses.includes(status)
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Invalid contact message status.",
      });
    }

    const [existingRows] =
      await db.query(
        `
          SELECT
            message_id
          FROM contact_message
          WHERE message_id = ?
          LIMIT 1
        `,
        [messageId]
      );

    if (!existingRows.length) {
      return res.status(404).json({
        success: false,

        message:
          "Contact message not found.",
      });
    }

    await db.query(
      `
        UPDATE contact_message
        SET status = ?
        WHERE message_id = ?
      `,
      [
        status,
        messageId,
      ]
    );

    return res.status(200).json({
      success: true,

      message:
        "Contact message status updated successfully.",

      data: {
        messageId,
        status,
      },
    });
  } catch (error) {
    console.error(
      "Update contact message status error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to update the contact message.",
    });
  }
};

// ======================================================
// DELETE CONTACT MESSAGE
// ======================================================

const deleteContactMessage = async (
  req,
  res
) => {
  try {
    const messageId =
      Number(req.params.messageId);

    if (
      !Number.isInteger(messageId) ||
      messageId <= 0
    ) {
      return res.status(400).json({
        success: false,

        message:
          "A valid message ID is required.",
      });
    }

    const [result] = await db.query(
      `
        DELETE FROM contact_message
        WHERE message_id = ?
      `,
      [messageId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,

        message:
          "Contact message not found.",
      });
    }

    return res.status(200).json({
      success: true,

      message:
        "Contact message deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete contact message error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to delete the contact message.",
    });
  }
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  createContactMessage,
  getContactMessagesByGarage,
  getContactMessageById,
  updateContactMessageStatus,
  deleteContactMessage,
};