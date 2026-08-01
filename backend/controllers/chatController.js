const db = require("../config/db");

// ======================================================
// HELPER FUNCTIONS
// ======================================================

const formatDateValue = (value) => {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    return value.slice(0, 10);
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString().slice(0, 10);
};

const formatTimeValue = (value) => {
  if (!value) {
    return null;
  }

  return String(value).slice(0, 8);
};

const formatDateTimeValue = (value) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toISOString();
};

const normalizeSenderType = (value) => {
  const senderType = String(value || "")
    .trim()
    .toLowerCase();

  if (senderType === "customer") {
    return "Customer";
  }

  if (
    senderType === "assistance" ||
    senderType === "assistance officer"
  ) {
    return "Assistance";
  }

  return null;
};

const formatConversation = (row) => ({
  requestId: row.request_id,

  ticketNumber:
    row.ticket_number || "",

  customerId:
    row.customer_id ?? null,

  customerName:
    row.customer_name || "Customer",

  customerContact:
    row.customer_contact || "",

  vehicleId:
    row.vehicle_id ?? null,

  vehicleNumber:
    row.vehicle_number || "",

  vehicleType:
    row.vehicle_type || "",

  vehicleModel:
    row.vehicle_model || "",

  requestType:
    row.request_type || "Garage Service",

  requestStatus:
    row.request_status || "Pending",

  requestDate:
    formatDateValue(row.request_date),

  requestTime:
    formatTimeValue(row.request_time),

  garageId:
    row.garage_id ?? null,

  garageName:
    row.garage_name || "",

  assistanceId:
    row.assistance_id ?? null,

  assistanceName:
    row.assistance_name || "",

  jobId:
    row.job_id ?? null,

  jobType:
    row.job_type || "",

  jobStatus:
    row.job_status || row.request_status || "Pending",

  technicianId:
    row.technician_id ?? null,

  technicianName:
    row.technician_name || "Not Assigned",

  startDate:
    formatDateValue(row.start_date),

  startTime:
    formatTimeValue(row.start_time),

  endDate:
    formatDateValue(row.end_date),

  endTime:
    formatTimeValue(row.end_time),

  estimatedCompletionTime:
    formatDateTimeValue(
      row.estimated_completion_time
    ),

  actualCompletionTime:
    formatDateTimeValue(
      row.actual_completion_time
    ),

  remarks:
    row.remarks || "",

  lastMessage:
    row.last_message || "",

  lastMessageSender:
    row.last_message_sender || "",

  lastMessageDate:
    formatDateValue(row.last_message_date),

  lastMessageTime:
    formatTimeValue(row.last_message_time),

  unreadCount:
    Number(row.unread_count) || 0,
});

const formatMessage = (row) => ({
  chatId:
    row.chat_id,

  requestId:
    row.request_request_id,

  customerId:
    row.customer_customer_id ?? null,

  assistanceId:
    row.assistance_assistance_id ?? null,

  message:
    row.message_content || "",

  senderType:
    row.sender_type || "",

  sentDate:
    formatDateValue(row.sent_date),

  sentTime:
    formatTimeValue(row.sent_time),

  messageStatus:
    row.message_status || "Sent",
});

// ======================================================
// GET GARAGE CONVERSATIONS
// GET /api/chats/garage/:garageId
// ======================================================

const getGarageConversations = async (
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

    const [garageRows] = await db.query(
      `
        SELECT
          garage_id,
          garage_name
        FROM garage
        WHERE garage_id = ?
        LIMIT 1
      `,
      [garageId]
    );

    if (garageRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Garage not found.",
      });
    }

    const [rows] = await db.query(
      `
        SELECT
          sr.request_id,
          sr.ticket_number,

          sr.customer_customer_id
            AS customer_id,

          COALESCE(
            c.full_name,
            sr.customer_name,
            'Customer'
          ) AS customer_name,

          COALESCE(
            c.contact_number,
            sr.contact_number,
            ''
          ) AS customer_contact,

          sr.vehicle_vehicle_id
            AS vehicle_id,

          COALESCE(
            v.vehicle_number,
            sr.vehicle_number,
            ''
          ) AS vehicle_number,

          COALESCE(
            v.vehicle_type,
            sr.vehicle_type,
            ''
          ) AS vehicle_type,

          COALESCE(
            v.vehicle_model,
            ''
          ) AS vehicle_model,

          sr.request_type,
          sr.request_status,
          sr.request_date,
          sr.request_time,

          sr.garage_garage_id
            AS garage_id,

          g.garage_name,

          sr.assistance_assistance_id
            AS assistance_id,

          a.full_name
            AS assistance_name,

          sj.job_id,
          sj.job_type,
          sj.job_status,
          sj.start_date,
          sj.start_time,
          sj.end_date,
          sj.end_time,
          sj.estimated_completion_time,
          sj.actual_completion_time,
          sj.remarks,

          sj.technician_technician_id
            AS technician_id,

          t.full_name
            AS technician_name,

          latest_chat.message_content
            AS last_message,

          latest_chat.sender_type
            AS last_message_sender,

          latest_chat.sent_date
            AS last_message_date,

          latest_chat.sent_time
            AS last_message_time,

          (
            SELECT COUNT(*)
            FROM chat unread_chat
            WHERE
              unread_chat.request_request_id =
                sr.request_id

              AND LOWER(
                unread_chat.sender_type
              ) = 'customer'

              AND LOWER(
                unread_chat.message_status
              ) <> 'read'
          ) AS unread_count

        FROM service_request sr

        INNER JOIN garage g
          ON g.garage_id =
             sr.garage_garage_id

        LEFT JOIN customer c
          ON c.customer_id =
             sr.customer_customer_id

        LEFT JOIN vehicle v
          ON v.vehicle_id =
             sr.vehicle_vehicle_id

        LEFT JOIN assistance a
          ON a.assistance_id =
             sr.assistance_assistance_id

        LEFT JOIN service_job sj
          ON sj.job_id = (
            SELECT MAX(sj2.job_id)
            FROM service_job sj2
            WHERE
              sj2.service_request_request_id =
                sr.request_id
          )

        LEFT JOIN technician t
          ON t.technician_id =
             sj.technician_technician_id

        LEFT JOIN chat latest_chat
          ON latest_chat.chat_id = (
            SELECT MAX(c2.chat_id)
            FROM chat c2
            WHERE
              c2.request_request_id =
                sr.request_id
          )

        WHERE
          sr.garage_garage_id = ?

          AND sr.request_status NOT IN (
            'Rejected',
            'Cancelled'
          )

        ORDER BY
          COALESCE(
            latest_chat.sent_date,
            sr.request_date
          ) DESC,

          COALESCE(
            latest_chat.sent_time,
            sr.request_time
          ) DESC,

          sr.request_id DESC
      `,
      [garageId]
    );

    return res.status(200).json({
      success: true,

      garage: {
        garageId:
          garageRows[0].garage_id,

        garageName:
          garageRows[0].garage_name,
      },

      conversations:
        rows.map(formatConversation),
    });
  } catch (error) {
    console.error(
      "========== GET GARAGE CHATS ERROR =========="
    );

    console.error("Code:", error.code);
    console.error("Message:", error.message);
    console.error(
      "SQL Message:",
      error.sqlMessage
    );
    console.error("SQL:", error.sql);

    console.error(
      "============================================"
    );

    return res.status(500).json({
      success: false,

      message:
        error.sqlMessage ||
        "Failed to load conversations.",
    });
  }
};

// ======================================================
// GET MESSAGES FOR ONE SERVICE REQUEST
// GET /api/chats/:requestId/messages
// ======================================================

const getConversationMessages = async (
  req,
  res
) => {
  try {
    const requestId =
      Number(req.params.requestId);

    if (
      !Number.isInteger(requestId) ||
      requestId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid service request ID is required.",
      });
    }

    const [requestRows] = await db.query(
      `
        SELECT
          request_id,
          ticket_number,
          customer_customer_id,
          assistance_assistance_id,
          garage_garage_id
        FROM service_request
        WHERE request_id = ?
        LIMIT 1
      `,
      [requestId]
    );

    if (requestRows.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Service request not found.",
      });
    }

    const [messageRows] = await db.query(
      `
        SELECT
          chat_id,
          message_content,
          sender_type,
          sent_date,
          sent_time,
          message_status,
          customer_customer_id,
          assistance_assistance_id,
          request_request_id

        FROM chat

        WHERE request_request_id = ?

        ORDER BY
          sent_date ASC,
          sent_time ASC,
          chat_id ASC
      `,
      [requestId]
    );

    return res.status(200).json({
      success: true,

      request: {
        requestId:
          requestRows[0].request_id,

        ticketNumber:
          requestRows[0].ticket_number || "",

        customerId:
          requestRows[0].customer_customer_id ??
          null,

        assistanceId:
          requestRows[0]
            .assistance_assistance_id ??
          null,

        garageId:
          requestRows[0].garage_garage_id,
      },

      messages:
        messageRows.map(formatMessage),
    });
  } catch (error) {
    console.error(
      "========== GET CHAT MESSAGES ERROR =========="
    );

    console.error("Code:", error.code);
    console.error("Message:", error.message);
    console.error(
      "SQL Message:",
      error.sqlMessage
    );
    console.error("SQL:", error.sql);

    console.error(
      "============================================="
    );

    return res.status(500).json({
      success: false,

      message:
        error.sqlMessage ||
        "Failed to load chat messages.",
    });
  }
};

// ======================================================
// SEND CHAT MESSAGE
// POST /api/chats/messages
//
// Body:
// {
//   "requestId": 1,
//   "senderType": "Assistance",
//   "message": "Your vehicle is ready."
// }
// ======================================================

const sendChatMessage = async (
  req,
  res
) => {
  try {
    const requestId =
      Number(req.body.requestId);

    const senderType =
      normalizeSenderType(
        req.body.senderType
      );

    const message = String(
      req.body.message || ""
    ).trim();

    if (
      !Number.isInteger(requestId) ||
      requestId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid service request ID is required.",
      });
    }

    if (!senderType) {
      return res.status(400).json({
        success: false,
        message:
          "Sender type must be Customer or Assistance.",
      });
    }

    if (!message) {
      return res.status(400).json({
        success: false,
        message:
          "Message content is required.",
      });
    }

    if (message.length > 500) {
      return res.status(400).json({
        success: false,
        message:
          "Message cannot contain more than 500 characters.",
      });
    }

    const [requestRows] = await db.query(
      `
        SELECT
          request_id,
          ticket_number,
          customer_customer_id,
          assistance_assistance_id,
          garage_garage_id,
          request_status

        FROM service_request

        WHERE request_id = ?

        LIMIT 1
      `,
      [requestId]
    );

    if (requestRows.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Service request not found.",
      });
    }

    const serviceRequest =
      requestRows[0];

    if (
      serviceRequest.request_status ===
        "Rejected" ||
      serviceRequest.request_status ===
        "Cancelled"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Messages cannot be sent for a rejected or cancelled request.",
      });
    }

    const customerId =
      serviceRequest.customer_customer_id ??
      null;

    const assistanceId =
      serviceRequest
        .assistance_assistance_id ??
      null;

    if (
      senderType === "Assistance" &&
      !assistanceId
    ) {
      return res.status(409).json({
        success: false,
        message:
          "An assistance officer has not been assigned to this request.",
      });
    }

    const [insertResult] = await db.query(
      `
        INSERT INTO chat (
          message_content,
          sender_type,
          sent_date,
          sent_time,
          message_status,
          customer_customer_id,
          assistance_assistance_id,
          request_request_id
        )
        VALUES (
          ?,
          ?,
          CURRENT_DATE(),
          CURRENT_TIME(),
          'Sent',
          ?,
          ?,
          ?
        )
      `,
      [
        message,
        senderType,
        customerId,
        assistanceId,
        requestId,
      ]
    );

    const [newMessageRows] =
      await db.query(
        `
          SELECT
            chat_id,
            message_content,
            sender_type,
            sent_date,
            sent_time,
            message_status,
            customer_customer_id,
            assistance_assistance_id,
            request_request_id

          FROM chat

          WHERE chat_id = ?

          LIMIT 1
        `,
        [insertResult.insertId]
      );

    return res.status(201).json({
      success: true,
      message:
        "Chat message sent successfully.",

      chatMessage:
        formatMessage(
          newMessageRows[0]
        ),
    });
  } catch (error) {
    console.error(
      "========== SEND CHAT MESSAGE ERROR =========="
    );

    console.error("Code:", error.code);
    console.error("Message:", error.message);
    console.error(
      "SQL Message:",
      error.sqlMessage
    );
    console.error("SQL:", error.sql);

    console.error(
      "============================================="
    );

    return res.status(500).json({
      success: false,

      message:
        error.sqlMessage ||
        "Failed to send chat message.",
    });
  }
};

// ======================================================
// MARK CUSTOMER MESSAGES AS READ
// PUT /api/chats/:requestId/read
// ======================================================

const markConversationAsRead = async (
  req,
  res
) => {
  try {
    const requestId =
      Number(req.params.requestId);

    if (
      !Number.isInteger(requestId) ||
      requestId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid service request ID is required.",
      });
    }

    const [result] = await db.query(
      `
        UPDATE chat

        SET message_status = 'Read'

        WHERE request_request_id = ?

          AND LOWER(sender_type) =
              'customer'

          AND LOWER(message_status) <>
              'read'
      `,
      [requestId]
    );

    return res.status(200).json({
      success: true,

      message:
        "Conversation marked as read.",

      updatedMessages:
        result.affectedRows,
    });
  } catch (error) {
    console.error(
      "========== MARK CHAT READ ERROR =========="
    );

    console.error("Code:", error.code);
    console.error("Message:", error.message);
    console.error(
      "SQL Message:",
      error.sqlMessage
    );
    console.error("SQL:", error.sql);

    console.error(
      "=========================================="
    );

    return res.status(500).json({
      success: false,

      message:
        error.sqlMessage ||
        "Failed to mark messages as read.",
    });
  }
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  getGarageConversations,
  getConversationMessages,
  sendChatMessage,
  markConversationAsRead,
};