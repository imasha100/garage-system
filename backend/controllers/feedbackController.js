const db = require("../config/db");

// ======================================================
// FORMAT FEEDBACK RESPONSE
// ======================================================

const formatFeedback = (row) => ({
  feedbackId: row.feedback_id,
  rating: Number(row.rating) || 0,
  comment: row.comment || "",
  feedbackDate: row.feedback_date,

  customerId: row.customer_customer_id,
  customerName: row.customer_name || "Customer",
  customerContact: row.customer_contact || "",

  jobId: row.service_job_job_id,

  requestId: row.request_id,
  ticketNumber: row.ticket_number || "",

  vehicleNumber: row.vehicle_number || "",
  vehicleType: row.vehicle_type || "",
  vehicleModel: row.vehicle_model || "",

  garageId: row.garage_id,
  garageName: row.garage_name || "",

  technicianName: row.technician_name || "Not Assigned",
  jobStatus: row.job_status || "",

  flag: Number(row.rating) <= 2,

  flagMessage:
    Number(row.rating) <= 2
      ? "SYSTEM FLAG: LOW CUSTOMER SATISFACTION DETECTED"
      : "",
});

// ======================================================
// SUBMIT CUSTOMER FEEDBACK
// POST /api/feedback
// ======================================================

const submitFeedback = async (req, res) => {
  try {
    const customerId = Number(req.body.customerId);
    const jobId = Number(req.body.jobId);
    const rating = Number(req.body.rating);

    const comment = String(
      req.body.comment || ""
    ).trim();

    if (
      !Number.isInteger(customerId) ||
      customerId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid customer ID is required.",
      });
    }

    if (
      !Number.isInteger(jobId) ||
      jobId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid service job ID is required.",
      });
    }

    if (
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Rating must be between 1 and 5.",
      });
    }

    if (comment.length > 400) {
      return res.status(400).json({
        success: false,
        message:
          "Feedback comment cannot contain more than 400 characters.",
      });
    }

    const [customerRows] = await db.query(
      `
        SELECT customer_id
        FROM customer
        WHERE customer_id = ?
        LIMIT 1
      `,
      [customerId]
    );

    if (customerRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    const [jobRows] = await db.query(
      `
        SELECT
          sj.job_id,
          sr.customer_customer_id
        FROM service_job sj

        INNER JOIN service_request sr
          ON sr.request_id =
             sj.service_request_request_id

        WHERE sj.job_id = ?

        LIMIT 1
      `,
      [jobId]
    );

    if (jobRows.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Service job not found.",
      });
    }

    if (
      Number(
        jobRows[0].customer_customer_id
      ) !== customerId
    ) {
      return res.status(403).json({
        success: false,
        message:
          "This service job does not belong to the selected customer.",
      });
    }

    const [duplicateRows] =
      await db.query(
        `
          SELECT feedback_id
          FROM feedback
          WHERE customer_customer_id = ?
            AND service_job_job_id = ?
          LIMIT 1
        `,
        [customerId, jobId]
      );

    if (duplicateRows.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          "Feedback has already been submitted for this service job.",
      });
    }

    const [insertResult] =
      await db.query(
        `
          INSERT INTO feedback (
            rating,
            comment,
            feedback_date,
            customer_customer_id,
            service_job_job_id
          )
          VALUES (?, ?, CURDATE(), ?, ?)
        `,
        [
          rating,
          comment || null,
          customerId,
          jobId,
        ]
      );

    return res.status(201).json({
      success: true,
      message:
        "Feedback submitted successfully.",

      feedback: {
        feedbackId:
          insertResult.insertId,

        rating,
        comment,
        feedbackDate:
          new Date()
            .toISOString()
            .slice(0, 10),

        customerId,
        jobId,
      },
    });
  } catch (error) {
    console.error(
      "========== SUBMIT FEEDBACK ERROR =========="
    );

    console.error("Code:", error.code);
    console.error("Message:", error.message);
    console.error(
      "SQL Message:",
      error.sqlMessage
    );
    console.error("SQL:", error.sql);

    console.error(
      "==========================================="
    );

    return res.status(500).json({
      success: false,
      message:
        error.sqlMessage ||
        "Unable to submit feedback.",
    });
  }
};

// ======================================================
// GET FEEDBACK FOR ONE GARAGE
// GET /api/feedback/garage/:garageId
// ======================================================

const getGarageFeedback = async (
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
          f.feedback_id,
          f.rating,
          f.comment,
          f.feedback_date,
          f.customer_customer_id,
          f.service_job_job_id,

          c.full_name
            AS customer_name,

          c.contact_number
            AS customer_contact,

          sj.job_id,
          sj.job_status,
          sj.garage_garage_id
            AS garage_id,

          sr.request_id,
          sr.ticket_number,

          v.vehicle_number,
          v.vehicle_type,
          v.vehicle_model,

          g.garage_name,

          t.full_name
            AS technician_name

        FROM feedback f

        INNER JOIN customer c
          ON c.customer_id =
             f.customer_customer_id

        INNER JOIN service_job sj
          ON sj.job_id =
             f.service_job_job_id

        INNER JOIN service_request sr
          ON sr.request_id =
             sj.service_request_request_id

        LEFT JOIN vehicle v
          ON v.vehicle_id =
             sr.vehicle_vehicle_id

        INNER JOIN garage g
          ON g.garage_id =
             sj.garage_garage_id

        LEFT JOIN technician t
          ON t.technician_id =
             sj.technician_technician_id

        WHERE sj.garage_garage_id = ?

        ORDER BY
          f.feedback_date DESC,
          f.feedback_id DESC
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

      feedback:
        rows.map(formatFeedback),
    });
  } catch (error) {
    console.error(
      "========== GET GARAGE FEEDBACK ERROR =========="
    );

    console.error("Code:", error.code);
    console.error("Message:", error.message);
    console.error(
      "SQL Message:",
      error.sqlMessage
    );
    console.error("SQL:", error.sql);

    console.error(
      "==============================================="
    );

    return res.status(500).json({
      success: false,
      message:
        error.sqlMessage ||
        "Unable to load garage feedback.",
    });
  }
};

// ======================================================
// GET CUSTOMER FEEDBACK HISTORY
// GET /api/feedback/customer/:customerId
// ======================================================

const getCustomerFeedback = async (
  req,
  res
) => {
  try {
    const customerId =
      Number(req.params.customerId);

    if (
      !Number.isInteger(customerId) ||
      customerId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid customer ID is required.",
      });
    }

    const [rows] = await db.query(
      `
        SELECT
          f.feedback_id,
          f.rating,
          f.comment,
          f.feedback_date,
          f.customer_customer_id,
          f.service_job_job_id,

          c.full_name
            AS customer_name,

          c.contact_number
            AS customer_contact,

          sj.job_id,
          sj.job_status,
          sj.garage_garage_id
            AS garage_id,

          sr.request_id,
          sr.ticket_number,

          v.vehicle_number,
          v.vehicle_type,
          v.vehicle_model,

          g.garage_name,

          t.full_name
            AS technician_name

        FROM feedback f

        INNER JOIN customer c
          ON c.customer_id =
             f.customer_customer_id

        INNER JOIN service_job sj
          ON sj.job_id =
             f.service_job_job_id

        INNER JOIN service_request sr
          ON sr.request_id =
             sj.service_request_request_id

        LEFT JOIN vehicle v
          ON v.vehicle_id =
             sr.vehicle_vehicle_id

        INNER JOIN garage g
          ON g.garage_id =
             sj.garage_garage_id

        LEFT JOIN technician t
          ON t.technician_id =
             sj.technician_technician_id

        WHERE f.customer_customer_id = ?

        ORDER BY
          f.feedback_date DESC,
          f.feedback_id DESC
      `,
      [customerId]
    );

    return res.status(200).json({
      success: true,
      feedback:
        rows.map(formatFeedback),
    });
  } catch (error) {
    console.error(
      "========== GET CUSTOMER FEEDBACK ERROR =========="
    );

    console.error("Code:", error.code);
    console.error("Message:", error.message);
    console.error(
      "SQL Message:",
      error.sqlMessage
    );
    console.error("SQL:", error.sql);

    console.error(
      "================================================="
    );

    return res.status(500).json({
      success: false,
      message:
        error.sqlMessage ||
        "Unable to load customer feedback.",
    });
  }
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  submitFeedback,
  getGarageFeedback,
  getCustomerFeedback,
};