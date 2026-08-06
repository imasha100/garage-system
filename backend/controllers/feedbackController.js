const db = require("../config/db");

// ======================================================
// FORMAT FEEDBACK RESPONSE
// ======================================================

const formatFeedback = (row) => ({
  feedbackId: row.feedback_id,

  rating:
    Number(row.rating) || 0,

  comment:
    row.comment || "",

  feedbackDate:
    row.feedback_date,

  customerId:
    row.customer_customer_id ?? null,

  customerName:
    row.customer_name ||
    "Customer",

  customerContact:
    row.customer_contact ||
    "",

  jobId:
    row.service_job_job_id,

  requestId:
    row.request_id,

  ticketNumber:
    row.ticket_number ||
    "",

  vehicleNumber:
    row.vehicle_number ||
    "",

  vehicleType:
    row.vehicle_type ||
    "",

  vehicleModel:
    row.vehicle_model ||
    "",

  garageId:
    row.garage_id,

  garageName:
    row.garage_name ||
    "",

  technicianName:
    row.technician_name ||
    "Not Assigned",

  jobStatus:
    row.job_status ||
    "",

  flag:
    Number(row.rating) <= 2,

  flagMessage:
    Number(row.rating) <= 2
      ? "SYSTEM FLAG: LOW CUSTOMER SATISFACTION DETECTED"
      : "",
});

// ======================================================
// SUBMIT CUSTOMER FEEDBACK
// POST /api/feedback
// ======================================================

const submitFeedback = async (
  req,
  res
) => {
  try {
    // ==================================================
    // FRONTEND ONLY NEEDS:
    // jobId
    // rating
    // comment
    // ==================================================

    const jobId =
      Number(
        req.body.jobId
      );

    const rating =
      Number(
        req.body.rating
      );

    const comment =
      String(
        req.body.comment || ""
      ).trim();

    // ==================================================
    // VALIDATE JOB ID
    // ==================================================

    if (
      !Number.isInteger(
        jobId
      ) ||
      jobId <= 0
    ) {
      return res.status(400).json({
        success: false,

        message:
          "A valid service job ID is required.",
      });
    }

    // ==================================================
    // VALIDATE RATING
    // ==================================================

    if (
      !Number.isInteger(
        rating
      ) ||
      rating < 1 ||
      rating > 5
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Rating must be between 1 and 5.",
      });
    }

    // ==================================================
    // VALIDATE COMMENT
    // ==================================================

    if (
      comment.length >
      400
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Feedback comment cannot contain more than 400 characters.",
      });
    }

    // ==================================================
    // GET SERVICE JOB + REQUEST DETAILS
    // ==================================================

    const [jobRows] =
      await db.query(
        `
        SELECT
          sj.job_id,
          sj.job_status,
          sj.garage_garage_id,
          sj.technician_technician_id,
          sj.service_request_request_id,

          sr.request_id,
          sr.customer_customer_id,
          sr.customer_name,
          sr.contact_number,
          sr.vehicle_number,
          sr.vehicle_type

        FROM service_job sj

        INNER JOIN service_request sr
          ON sr.request_id =
             sj.service_request_request_id

        WHERE sj.job_id = ?

        LIMIT 1
        `,
        [jobId]
      );

    // ==================================================
    // JOB NOT FOUND
    // ==================================================

    if (
      jobRows.length === 0
    ) {
      return res.status(404).json({
        success: false,

        message:
          "Service job not found.",
      });
    }

    const job =
      jobRows[0];

    // ==================================================
    // ONLY COMPLETED JOBS CAN RECEIVE FEEDBACK
    // ==================================================

    const jobStatus =
      String(
        job.job_status || ""
      )
        .trim()
        .toUpperCase();

    if (
      jobStatus !==
      "COMPLETED"
    ) {
      return res.status(409).json({
        success: false,

        message:
          "Feedback can only be submitted after the service is completed.",
      });
    }

    // ==================================================
    // CUSTOMER ID
    // Customer table may not be used for every request.
    // ==================================================

    const possibleCustomerId =
      Number(
        job.customer_customer_id
      );

    const customerId =
      Number.isInteger(
        possibleCustomerId
      ) &&
      possibleCustomerId > 0
        ? possibleCustomerId
        : null;

    // ==================================================
    // PREVENT DUPLICATE FEEDBACK
    // One feedback per service job
    // ==================================================

    const [duplicateRows] =
      await db.query(
        `
        SELECT
          feedback_id

        FROM feedback

        WHERE
          service_job_job_id = ?

        LIMIT 1
        `,
        [jobId]
      );

    if (
      duplicateRows.length >
      0
    ) {
      return res.status(409).json({
        success: false,

        message:
          "Feedback has already been submitted for this service job.",
      });
    }

    // ==================================================
    // INSERT FEEDBACK
    // ==================================================

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

        VALUES (
          ?,
          ?,
          CURDATE(),
          ?,
          ?
        )
        `,
        [
          rating,
          comment || null,
          customerId,
          jobId,
        ]
      );

    // ==================================================
    // SUCCESS
    // ==================================================

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
            .slice(
              0,
              10
            ),

        customerId,

        customerName:
          job.customer_name ||
          "Customer",

        customerContact:
          job.contact_number ||
          "",

        requestId:
          job.request_id,

        vehicleNumber:
          job.vehicle_number ||
          "",

        vehicleType:
          job.vehicle_type ||
          "",

        jobId,

        garageId:
          job.garage_garage_id,

        technicianId:
          job.technician_technician_id,
      },
    });
  } catch (error) {
    console.error(
      "========== SUBMIT FEEDBACK ERROR =========="
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

const getGarageFeedback =
  async (
    req,
    res
  ) => {
    try {
      const garageId =
        Number(
          req.params
            .garageId
        );

      // ================================================
      // VALIDATE GARAGE ID
      // ================================================

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

      // ================================================
      // CHECK GARAGE
      // ================================================

      const [garageRows] =
        await db.query(
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

      if (
        garageRows.length ===
        0
      ) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "Garage not found.",
          });
      }

      const garage =
        garageRows[0];

      // ================================================
      // LOAD FEEDBACK
      // ================================================

      const [rows] =
        await db.query(
          `
          SELECT
            f.feedback_id,
            f.rating,
            f.comment,
            f.feedback_date,
            f.customer_customer_id,
            f.service_job_job_id,

            sj.job_id,
            sj.job_status,

            sj.garage_garage_id
              AS garage_id,

            sr.request_id,
            sr.ticket_number,

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

            g.garage_name,

            COALESCE(
              t.full_name,
              'Not Assigned'
            ) AS technician_name

          FROM feedback f

          INNER JOIN service_job sj
            ON sj.job_id =
               f.service_job_job_id

          INNER JOIN service_request sr
            ON sr.request_id =
               sj.service_request_request_id

          LEFT JOIN customer c
            ON c.customer_id =
               f.customer_customer_id

          LEFT JOIN vehicle v
            ON v.vehicle_id =
               sr.vehicle_vehicle_id

          INNER JOIN garage g
            ON g.garage_id =
               sj.garage_garage_id

          LEFT JOIN technician t
            ON t.technician_id =
               sj.technician_technician_id

          WHERE
            sj.garage_garage_id = ?

          ORDER BY
            f.feedback_date DESC,
            f.feedback_id DESC
          `,
          [garageId]
        );

      // ================================================
      // FORMAT FEEDBACK
      // ================================================

      const feedback =
        rows.map(
          formatFeedback
        );

      // ================================================
      // SUMMARY
      // ================================================

      const totalReviews =
        feedback.length;

      const totalRating =
        feedback.reduce(
          (
            total,
            item
          ) =>
            total +
            (Number(
              item.rating
            ) || 0),
          0
        );

      const averageRating =
        totalReviews > 0
          ? Number(
              (
                totalRating /
                totalReviews
              ).toFixed(1)
            )
          : 0;

      const lowRatingCount =
        feedback.filter(
          (item) =>
            Number(
              item.rating
            ) < 3
        ).length;

      const fiveStarCount =
        feedback.filter(
          (item) =>
            Number(
              item.rating
            ) === 5
        ).length;

      // ================================================
      // COMMON COMPLAINT DETECTION
      // ================================================

      const complaintRules = [
        {
          label:
            "Turnaround Time",

          keywords: [
            "late",
            "delay",
            "slow",
            "waiting",
            "wait",
            "time",
            "turnaround",
          ],
        },

        {
          label:
            "Interior Cleaning",

          keywords: [
            "dirty",
            "cleaning",
            "unclean",
            "smudge",
            "interior",
            "dust",
          ],
        },

        {
          label:
            "Oil Leakage",

          keywords: [
            "oil leak",
            "leakage",
            "leaking",
            "oil",
          ],
        },

        {
          label:
            "HVAC Noise",

          keywords: [
            "hvac",
            "air condition",
            "air conditioning",
            "ac noise",
            "noise",
          ],
        },

        {
          label:
            "Brake Squeal",

          keywords: [
            "brake",
            "squeal",
            "squeak",
            "brake noise",
          ],
        },

        {
          label:
            "Service Price",

          keywords: [
            "price",
            "cost",
            "expensive",
            "charge",
            "charges",
          ],
        },

        {
          label:
            "Navigation Lag",

          keywords: [
            "navigation",
            "lag",
            "screen",
            "infotainment",
          ],
        },
      ];

      const complaints =
        complaintRules
          .map(
            (rule) => {
              const count =
                feedback.filter(
                  (
                    item
                  ) => {
                    // Only treat lower ratings
                    // as complaint feedback.
                    if (
                      Number(
                        item.rating
                      ) >= 4
                    ) {
                      return false;
                    }

                    const text =
                      String(
                        item.comment ||
                          ""
                      )
                        .trim()
                        .toLowerCase();

                    return rule.keywords.some(
                      (
                        keyword
                      ) =>
                        text.includes(
                          keyword
                        )
                    );
                  }
                ).length;

              return {
                label:
                  rule.label,

                count,
              };
            }
          )
          .filter(
            (item) =>
              item.count > 0
          )
          .sort(
            (
              a,
              b
            ) =>
              b.count -
              a.count
          );

      // ================================================
      // RESPONSE
      // ================================================

      return res
        .status(200)
        .json({
          success: true,

          garage: {
            garageId:
              garage
                .garage_id,

            garageName:
              garage
                .garage_name ||
              "",
          },

          summary: {
            averageRating,

            totalReviews,

            lowRatingCount,

            fiveStarCount,
          },

          feedback,

          complaints,
        });
    } catch (error) {
      console.error(
        "========== GET GARAGE FEEDBACK ERROR =========="
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
        "==============================================="
      );

      return res
        .status(500)
        .json({
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

const getCustomerFeedback =
  async (
    req,
    res
  ) => {
    try {
      const customerId =
        Number(
          req.params
            .customerId
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

      // ================================================
      // GET CUSTOMER FEEDBACK
      // ================================================

      const [rows] =
        await db.query(
          `
          SELECT
            f.feedback_id,
            f.rating,
            f.comment,
            f.feedback_date,
            f.customer_customer_id,
            f.service_job_job_id,

            sj.job_id,
            sj.job_status,

            sj.garage_garage_id
              AS garage_id,

            sr.request_id,
            sr.ticket_number,

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

            g.garage_name,

            COALESCE(
              t.full_name,
              'Not Assigned'
            ) AS technician_name

          FROM feedback f

          INNER JOIN service_job sj
            ON sj.job_id =
               f.service_job_job_id

          INNER JOIN service_request sr
            ON sr.request_id =
               sj.service_request_request_id

          LEFT JOIN customer c
            ON c.customer_id =
               f.customer_customer_id

          LEFT JOIN vehicle v
            ON v.vehicle_id =
               sr.vehicle_vehicle_id

          INNER JOIN garage g
            ON g.garage_id =
               sj.garage_garage_id

          LEFT JOIN technician t
            ON t.technician_id =
               sj.technician_technician_id

          WHERE
            f.customer_customer_id = ?

          ORDER BY
            f.feedback_date DESC,
            f.feedback_id DESC
          `,
          [customerId]
        );

      return res
        .status(200)
        .json({
          success: true,

          feedback:
            rows.map(
              formatFeedback
            ),
        });
    } catch (error) {
      console.error(
        "========== GET CUSTOMER FEEDBACK ERROR =========="
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
        "================================================="
      );

      return res
        .status(500)
        .json({
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