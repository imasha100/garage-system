const db = require("../config/db");

const {
  createNotification,
} = require("./notificationController");

// ======================================================
// ASSIGN TECHNICIAN TO SERVICE REQUEST
// POST /api/service-jobs/assign
// ======================================================

const assignTechnicianToJob = async (req, res) => {
  let connection;

  try {
    const {
      requestId,
      technicianId,
      assistanceId,
      garageId,
    } = req.body;

    const numericRequestId = Number(requestId);
    const numericTechnicianId = Number(technicianId);
    const numericAssistanceId = Number(assistanceId);
    const numericGarageId = Number(garageId);

    // ==================================================
    // VALIDATE IDS
    // ==================================================

    if (
      !Number.isInteger(numericRequestId) ||
      numericRequestId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid service request ID is required.",
      });
    }

    if (
      !Number.isInteger(numericTechnicianId) ||
      numericTechnicianId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid technician ID is required.",
      });
    }

    if (
      !Number.isInteger(numericAssistanceId) ||
      numericAssistanceId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid assistance ID is required.",
      });
    }

    if (
      !Number.isInteger(numericGarageId) ||
      numericGarageId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid garage ID is required.",
      });
    }

    // ==================================================
    // START TRANSACTION
    // ==================================================

    connection =
      await db.getConnection();

    await connection.beginTransaction();

    // ==================================================
    // CHECK SERVICE REQUEST
    // ==================================================

    const [requestRows] =
      await connection.query(
        `
        SELECT
          request_id,
          request_status,
          garage_garage_id,
          customer_customer_id,
          customer_name,
          vehicle_number
        FROM service_request
        WHERE request_id = ?
        LIMIT 1
        `,
        [numericRequestId]
      );

    if (
      requestRows.length === 0
    ) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message:
          "Service request not found.",
      });
    }

    const serviceRequest =
      requestRows[0];

    if (
      Number(
        serviceRequest.garage_garage_id
      ) !== numericGarageId
    ) {
      await connection.rollback();

      return res.status(403).json({
        success: false,
        message:
          "This service request does not belong to this garage.",
      });
    }

    const requestStatus = String(
      serviceRequest.request_status || ""
    )
      .trim()
      .toLowerCase();

    const allowedRequestStatuses = [
      "accepted",
      "arrived at garage",
    ];

    if (
      !allowedRequestStatuses.includes(
        requestStatus
      )
    ) {
      await connection.rollback();

      return res.status(409).json({
        success: false,
        message:
          "Only accepted or garage-arrived service requests can be assigned to a technician.",
      });
    }

    // ==================================================
    // CHECK TECHNICIAN
    // ==================================================

    const [technicianRows] =
      await connection.query(
        `
        SELECT
          technician_id,
          full_name,
          garage_garage_id,
          availability_status,
          shift_status
        FROM technician
        WHERE technician_id = ?
        LIMIT 1
        FOR UPDATE
        `,
        [numericTechnicianId]
      );

    if (
      technicianRows.length === 0
    ) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message:
          "Technician not found.",
      });
    }

    const technician =
      technicianRows[0];

    // ==================================================
    // CHECK TECHNICIAN GARAGE
    // ==================================================

    if (
      Number(
        technician.garage_garage_id
      ) !== numericGarageId
    ) {
      await connection.rollback();

      return res.status(403).json({
        success: false,
        message:
          "This technician does not belong to this garage.",
      });
    }

    // ==================================================
    // CHECK TECHNICIAN SHIFT STATUS
    // ==================================================

    const technicianShiftStatus =
      String(
        technician.shift_status || ""
      )
        .trim()
        .toUpperCase();

    const isTechnicianOnShift =
      technicianShiftStatus === "ON" ||
      technicianShiftStatus === "ON_SHIFT" ||
      technicianShiftStatus === "ON-SHIFT" ||
      technicianShiftStatus === "ACTIVE";

    if (!isTechnicianOnShift) {
      await connection.rollback();

      return res.status(409).json({
        success: false,
        message:
          "This technician is currently off shift and cannot be assigned to a service request.",
      });
    }

    // ==================================================
    // CHECK MAIN TECHNICIAN ACTIVE JOB LIMIT
    // ==================================================
    // Maximum MAIN active jobs per technician = 2.
    // ==================================================

    const technicianAvailability =
      String(
        technician.availability_status || ""
      )
        .trim()
        .toUpperCase();

    if (
      technicianAvailability === "UNAVAILABLE" ||
      technicianAvailability === "INACTIVE"
    ) {
      await connection.rollback();

      return res.status(409).json({
        success: false,
        message:
          "This technician is currently unavailable.",
      });
    }

    const MAX_ACTIVE_MAIN_JOBS = 2;

    // ==================================================
    // BLOCK NEW MAIN JOB WHILE TECHNICIAN IS SUPPORTING
    // ==================================================

    const [activeSupportRows] =
      await connection.query(
        `
        SELECT
          COUNT(*) AS active_support_count
        FROM technician_assistance
        WHERE support_technician_id = ?
          AND UPPER(
            COALESCE(
              assistance_status,
              ''
            )
          ) IN (
            'ASSIGNED',
            'IN_PROGRESS'
          )
        `,
        [numericTechnicianId]
      );

    const activeSupportCount =
      Number(
        activeSupportRows[0]
          ?.active_support_count
      ) || 0;

    if (activeSupportCount > 0) {
      await connection.rollback();

      return res.status(409).json({
        success: false,
        code:
          "TECHNICIAN_ACTIVE_SUPPORT_ASSISTANCE",
        message:
          "This technician is currently assigned as a support technician. Complete the active assistance before assigning a new main job.",
      });
    }

    // ==================================================
    // COUNT ACTIVE MAIN JOBS
    // ==================================================

    const [activeJobCountRows] =
      await connection.query(
        `
        SELECT
          COUNT(*) AS active_job_count
        FROM service_job
        WHERE technician_technician_id = ?
          AND UPPER(
            COALESCE(
              job_status,
              ''
            )
          ) IN (
            'ASSIGNED',
            'IN_PROGRESS'
          )
        `,
        [numericTechnicianId]
      );

    const activeJobCount =
      Number(
        activeJobCountRows[0]
          ?.active_job_count
      ) || 0;

    if (
      activeJobCount >=
      MAX_ACTIVE_MAIN_JOBS
    ) {
      await connection.rollback();

      return res.status(409).json({
        success: false,

        code:
          "TECHNICIAN_MAIN_JOB_LIMIT_REACHED",

        message:
          "This technician already has 2 active main jobs and cannot accept another main job yet.",
      });
    }

    // ==================================================
    // PREVENT DUPLICATE ACTIVE JOB
    // ==================================================

    const [existingJobRows] =
      await connection.query(
        `
        SELECT
          job_id
        FROM service_job
        WHERE service_request_request_id = ?
          AND UPPER(
            COALESCE(
              job_status,
              ''
            )
          ) NOT IN (
            'COMPLETED',
            'CANCELLED',
            'CLEARED'
          )
        LIMIT 1
        `,
        [numericRequestId]
      );

    if (
      existingJobRows.length > 0
    ) {
      await connection.rollback();

      return res.status(409).json({
        success: false,
        message:
          "This service request already has an active service job.",
      });
    }

    // ==================================================
    // CREATE SERVICE JOB
    // ==================================================

    const [jobResult] =
      await connection.query(
        `
        INSERT INTO service_job (
          job_type,
          start_date,
          start_time,
          end_date,
          end_time,
          job_status,
          estimated_completion_time,
          actual_completion_time,
          remarks,
          service_request_request_id,
          technician_technician_id,
          garage_garage_id,
          assistance_assistance_id
        )
        VALUES (
          'GENERAL SERVICE',
          NULL,
          NULL,
          NULL,
          NULL,
          'ASSIGNED',
          NULL,
          NULL,
          NULL,
          ?,
          ?,
          ?,
          ?
        )
        `,
        [
          numericRequestId,
          numericTechnicianId,
          numericGarageId,
          numericAssistanceId,
        ]
      );

    // ==================================================
    // UPDATE TECHNICIAN AVAILABILITY
    // ==================================================

    const activeMainJobsAfterAssignment =
      activeJobCount + 1;

    const availabilityAfterAssignment =
      activeMainJobsAfterAssignment >=
      MAX_ACTIVE_MAIN_JOBS
        ? "BUSY"
        : "AVAILABLE";

    await connection.query(
      `
      UPDATE technician
      SET availability_status = ?
      WHERE technician_id = ?
      `,
      [
        availabilityAfterAssignment,
        numericTechnicianId,
      ]
    );

    await connection.commit();

    // ==================================================
    // NOTIFY CUSTOMER
    // ==================================================

    try {
      const customerId =
        Number(
          serviceRequest.customer_customer_id
        );

      const jobId =
        Number(
          jobResult.insertId
        );

      if (
        Number.isInteger(customerId) &&
        customerId > 0
      ) {
        const vehicleNumber =
          String(
            serviceRequest.vehicle_number ||
            ""
          ).trim();

        const technicianName =
          String(
            technician.full_name ||
            "Assigned technician"
          ).trim();

        const notificationMessage =
          vehicleNumber
            ? `${technicianName} has been assigned to your vehicle ${vehicleNumber}.`
            : `${technicianName} has been assigned to your vehicle.`;

        const notificationResult =
          await createNotification({
            garageId:
              numericGarageId,

            customerId,

            notificationType:
              "TECHNICIAN_ASSIGNED",

            title:
              "Technician Assigned",

            message:
              notificationMessage,

            targetPage:
              "progress",

            referenceId:
              jobId,
          });

        if (
          !notificationResult.success
        ) {
          console.error(
            "Customer technician assignment notification failed:",
            notificationResult.error
          );
        }
      }
    } catch (
      notificationError
    ) {
      console.error(
        "Technician assignment customer notification error:",
        notificationError
      );
    }

    // ==================================================
    // NOTIFY TECHNICIAN
    // ==================================================

    try {
      const jobId =
        Number(
          jobResult.insertId
        );

      const vehicleNumber =
        String(
          serviceRequest.vehicle_number ||
          "Vehicle"
        ).trim();

      const customerName =
        String(
          serviceRequest.customer_name ||
          "Customer"
        ).trim();

      const technicianNotificationMessage =
        `${vehicleNumber} has been assigned to you for ${customerName}.`;

      const technicianNotificationResult =
        await createNotification({
          garageId:
            numericGarageId,

          technicianId:
            numericTechnicianId,

          notificationType:
            "NEW_JOB_ASSIGNED",

          title:
            "New Vehicle Assigned",

          message:
            technicianNotificationMessage,

          targetPage:
            "technician-intake",

          referenceId:
            jobId,

          priority:
            "HIGH",
        });

      if (
        !technicianNotificationResult.success
      ) {
        console.error(
          "Technician job assignment notification failed:",
          technicianNotificationResult.error
        );
      }
    } catch (
      technicianNotificationError
    ) {
      console.error(
        "Technician job assignment notification error:",
        technicianNotificationError
      );
    }

    return res.status(201).json({
      success: true,

      message:
        "Technician assigned successfully.",

      job: {
        jobId:
          jobResult.insertId,

        requestId:
          numericRequestId,

        technicianId:
          numericTechnicianId,

        technicianName:
          technician.full_name,

        garageId:
          numericGarageId,

        assistanceId:
          numericAssistanceId,

        jobStatus:
          "ASSIGNED",
      },
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (
        rollbackError
      ) {
        console.error(
          "Service job rollback error:",
          rollbackError
        );
      }
    }

    console.error(
      "========== ASSIGN TECHNICIAN ERROR =========="
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
      "============================================="
    );

    return res.status(500).json({
      success: false,

      message:
        error.sqlMessage ||
        error.message ||
        "Unable to assign technician.",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// ======================================================
// GET JOBS ASSIGNED TO ONE TECHNICIAN
// GET /api/service-jobs/technician/:technicianId
// ======================================================

const getTechnicianJobs = async (
  req,
  res
) => {
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
      return res.status(400).json({
        success: false,

        message:
          "A valid technician ID is required.",
      });
    }

    const [technicianRows] =
      await db.query(
        `
        SELECT
          technician_id,
          full_name,
          garage_garage_id
        FROM technician
        WHERE technician_id = ?
        LIMIT 1
        `,
        [technicianId]
      );

    if (
      technicianRows.length === 0
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Technician not found.",
      });
    }

    const [rows] =
      await db.query(
        `
        SELECT
          sj.job_id,
          sj.job_type,
          sj.start_date,
          sj.start_time,
          sj.end_date,
          sj.end_time,
          sj.job_status,
          sj.estimated_completion_time,
          sj.actual_completion_time,
          sj.remarks,

          sj.service_request_request_id,
          sj.technician_technician_id,
          sj.garage_garage_id,
          sj.assistance_assistance_id,

          sr.request_id,
          sr.ticket_number,
          sr.request_status,

          sr.customer_customer_id,
          sr.vehicle_vehicle_id,

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

          g.garage_name,

          COALESCE(
            extension_data.total_extension_minutes,
            0
          ) AS total_extension_minutes,

          extension_data.latest_extension_reason,

          extension_data.latest_extension_datetime,

          CASE
            WHEN
              sj.estimated_completion_time IS NOT NULL
              AND COALESCE(
                extension_data.total_extension_minutes,
                0
              ) > 0
            THEN DATE_SUB(
              sj.estimated_completion_time,
              INTERVAL
                extension_data.total_extension_minutes
              MINUTE
            )
            ELSE
              sj.estimated_completion_time
          END AS original_estimated_completion_time

        FROM service_job sj

        INNER JOIN service_request sr
          ON sr.request_id =
             sj.service_request_request_id

        LEFT JOIN customer c
          ON c.customer_id =
             sr.customer_customer_id

        LEFT JOIN vehicle v
          ON v.vehicle_id =
             sr.vehicle_vehicle_id

        INNER JOIN garage g
          ON g.garage_id =
             sj.garage_garage_id

        LEFT JOIN (
          SELECT
            ter.service_job_job_id,

            SUM(
              CASE
                WHEN
                  UPPER(
                    COALESCE(
                      ter.approval_status,
                      ''
                    )
                  ) = 'APPROVED'
                THEN
                  COALESCE(
                    ter.approval_extra_time,
                    0
                  )
                ELSE 0
              END
            ) AS total_extension_minutes,

            SUBSTRING_INDEX(
              GROUP_CONCAT(
                CASE
                  WHEN
                    UPPER(
                      COALESCE(
                        ter.approval_status,
                        ''
                      )
                    ) = 'APPROVED'
                  THEN ter.reason
                  ELSE NULL
                END
                ORDER BY
                  ter.extension_request_id DESC
                SEPARATOR '|||'
              ),
              '|||',
              1
            ) AS latest_extension_reason,

            MAX(
              CASE
                WHEN
                  UPPER(
                    COALESCE(
                      ter.approval_status,
                      ''
                    )
                  ) = 'APPROVED'
                THEN
                  ter.reviewed_date_time
                ELSE NULL
              END
            ) AS latest_extension_datetime

          FROM time_extension_request ter

          GROUP BY
            ter.service_job_job_id

        ) extension_data

          ON extension_data.service_job_job_id =
             sj.job_id

        WHERE
          sj.technician_technician_id = ?

        ORDER BY
          CASE
            WHEN
              UPPER(
                sj.job_status
              ) = 'ASSIGNED'
            THEN 1

            WHEN
              UPPER(
                sj.job_status
              ) = 'IN_PROGRESS'
            THEN 2

            ELSE 3
          END,

          sj.job_id DESC
        `,
        [technicianId]
      );

    const jobs =
      rows.map(
        (row) => {
          const totalExtensionMinutes =
            Number(
              row.total_extension_minutes
            ) || 0;

          return {
            jobId:
              row.job_id,

            jobType:
              row.job_type ||
              "",

            jobStatus:
              row.job_status ||
              "",

            startDate:
              row.start_date,

            startTime:
              row.start_time,

            endDate:
              row.end_date,

            endTime:
              row.end_time,

            estimatedCompletionTime:
              row.estimated_completion_time,

            originalEstimatedCompletionTime:
              row.original_estimated_completion_time,

            actualCompletionTime:
              row.actual_completion_time,

            remarks:
              row.remarks ||
              "",

            requestId:
              row.request_id,

            ticketNumber:
              row.ticket_number ||
              "",

            requestStatus:
              row.request_status ||
              "",

            customerId:
              row.customer_customer_id ??
              null,

            customerName:
              row.customer_name ||
              "Customer",

            customerContact:
              row.customer_contact ||
              "",

            vehicleId:
              row.vehicle_vehicle_id ??
              null,

            vehicleNumber:
              row.vehicle_number ||
              "",

            vehicleType:
              row.vehicle_type ||
              "",

            vehicleModel:
              row.vehicle_model ||
              "",

            technicianId:
              row.technician_technician_id,

            garageId:
              row.garage_garage_id,

            garageName:
              row.garage_name ||
              "",

            assistanceId:
              row.assistance_assistance_id ??
              null,

            timeExtended:
              totalExtensionMinutes > 0,

            totalExtensionMinutes,

            latestExtensionReason:
              row.latest_extension_reason ||
              "",

            latestExtensionDateTime:
              row.latest_extension_datetime ||
              null,
          };
        }
      );

    return res.status(200).json({
      success: true,

      technician: {
        technicianId:
          technicianRows[0]
            .technician_id,

        fullName:
          technicianRows[0]
            .full_name,

        garageId:
          technicianRows[0]
            .garage_garage_id,
      },

      jobs,
    });
  } catch (error) {
    console.error(
      "========== GET TECHNICIAN JOBS ERROR =========="
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

    return res.status(500).json({
      success: false,

      message:
        error.sqlMessage ||
        error.message ||
        "Unable to load technician jobs.",
    });
  }
};

// ======================================================
// START SERVICE JOB
// PUT /api/service-jobs/:jobId/start
// ======================================================

const startServiceJob = async (
  req,
  res
) => {
  try {
    const jobId =
      Number(
        req.params.jobId
      );

    const {
      estimatedDays,
      estimatedTime,
    } = req.body;

    if (
      !Number.isInteger(
        jobId
      ) ||
      jobId <= 0
    ) {
      return res.status(400).json({
        success: false,

        message:
          "A valid job ID is required.",
      });
    }

    if (
      !estimatedDays &&
      !estimatedTime
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Please select either estimated days or estimated time.",
      });
    }

    if (
      estimatedDays &&
      estimatedTime
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Please select only one estimated duration.",
      });
    }

    const [jobRows] =
      await db.query(
        `
        SELECT
          job_id,
          job_status,
          technician_technician_id
        FROM service_job
        WHERE job_id = ?
        LIMIT 1
        `,
        [jobId]
      );

    if (
      jobRows.length === 0
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Service job not found.",
      });
    }

    if (
      String(
        jobRows[0]
          .job_status ||
          ""
      )
        .trim()
        .toUpperCase() !==
      "ASSIGNED"
    ) {
      return res.status(409).json({
        success: false,

        message:
          "Only assigned jobs can be started.",
      });
    }

    let estimatedCompletionSql =
      "";

    let queryValues =
      [];

    if (estimatedDays) {
      const days =
        Number(
          estimatedDays
        );

      if (
        !Number.isInteger(
          days
        ) ||
        days <= 0 ||
        days > 30
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Estimated days must be between 1 and 30.",
        });
      }

      estimatedCompletionSql =
        "DATE_ADD(NOW(), INTERVAL ? DAY)";

      queryValues = [
        days,
        jobId,
      ];
    }

    if (estimatedTime) {
      const timeParts =
        String(
          estimatedTime
        ).split(":");

      if (
        timeParts.length !==
        2
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Estimated time format is invalid.",
        });
      }

      const hours =
        Number(
          timeParts[0]
        );

      const minutes =
        Number(
          timeParts[1]
        );

      if (
        !Number.isInteger(
          hours
        ) ||
        !Number.isInteger(
          minutes
        ) ||
        hours < 0 ||
        minutes < 0 ||
        minutes > 59
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Estimated time is invalid.",
        });
      }

      const totalMinutes =
        hours * 60 +
        minutes;

      if (
        totalMinutes <=
        0
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Estimated time must be greater than zero.",
        });
      }

      estimatedCompletionSql =
        "DATE_ADD(NOW(), INTERVAL ? MINUTE)";

      queryValues = [
        totalMinutes,
        jobId,
      ];
    }

    await db.query(
      `
      UPDATE service_job
      SET
        start_date = CURDATE(),
        start_time = CURTIME(),
        estimated_completion_time =
          ${estimatedCompletionSql},
        job_status = 'IN_PROGRESS'
      WHERE job_id = ?
      `,
      queryValues
    );

    const [updatedRows] =
      await db.query(
        `
        SELECT
          job_id,
          start_date,
          start_time,
          estimated_completion_time,
          job_status,
          technician_technician_id
        FROM service_job
        WHERE job_id = ?
        LIMIT 1
        `,
        [jobId]
      );

    const updatedJob =
      updatedRows[0];

    return res.status(200).json({
      success: true,

      message:
        "Service job added to active workload successfully.",

      job: {
        jobId:
          updatedJob.job_id,

        technicianId:
          updatedJob
            .technician_technician_id,

        startDate:
          updatedJob.start_date,

        startTime:
          updatedJob.start_time,

        estimatedCompletionTime:
          updatedJob
            .estimated_completion_time,

        jobStatus:
          updatedJob.job_status,
      },
    });
  } catch (error) {
    console.error(
      "========== START SERVICE JOB ERROR =========="
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
      "============================================="
    );

    return res.status(500).json({
      success: false,

      message:
        error.sqlMessage ||
        error.message ||
        "Unable to start service job.",
    });
  }
};

// ======================================================
// COMPLETE SERVICE JOB
// PUT /api/service-jobs/:jobId/complete
// ======================================================

const completeServiceJob = async (
  req,
  res
) => {
  let connection;

  try {
    const jobId =
      Number(
        req.params.jobId
      );

    if (
      !Number.isInteger(
        jobId
      ) ||
      jobId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid job ID is required.",
      });
    }

    connection =
      await db.getConnection();

    await connection.beginTransaction();

    const [jobRows] =
      await connection.query(
        `
        SELECT
          job_id,
          job_status,
          technician_technician_id,
          service_request_request_id,
          garage_garage_id,
          assistance_assistance_id
        FROM service_job
        WHERE job_id = ?
        LIMIT 1
        FOR UPDATE
        `,
        [jobId]
      );

    if (
      jobRows.length === 0
    ) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message:
          "Service job not found.",
      });
    }

    const job =
      jobRows[0];

    const currentJobStatus =
      String(
        job.job_status ||
        ""
      )
        .trim()
        .toUpperCase();

    if (
      currentJobStatus !==
      "IN_PROGRESS"
    ) {
      await connection.rollback();

      return res.status(409).json({
        success: false,
        message:
          "Only an in-progress job can be completed.",
      });
    }

    await connection.query(
      `
      UPDATE service_job
      SET
        end_date = CURDATE(),
        end_time = CURTIME(),
        actual_completion_time = NOW(),
        job_status = 'COMPLETED'
      WHERE job_id = ?
      `,
      [jobId]
    );

    const serviceRequestId =
      Number(
        job.service_request_request_id
      );

    if (
      Number.isInteger(
        serviceRequestId
      ) &&
      serviceRequestId > 0
    ) {
      await connection.query(
        `
        UPDATE service_request
        SET
          request_status = 'COMPLETED',
          customer_stage = 'COMPLETED'
        WHERE request_id = ?
        `,
        [serviceRequestId]
      );
    }

    // ==================================================
    // RECALCULATE TECHNICIAN AVAILABILITY
    // ==================================================

    const technicianId =
      Number(
        job.technician_technician_id
      );

    if (
      Number.isInteger(
        technicianId
      ) &&
      technicianId > 0
    ) {
      const [remainingActiveRows] =
        await connection.query(
          `
          SELECT
            COUNT(*) AS active_job_count
          FROM service_job
          WHERE technician_technician_id = ?
            AND UPPER(
              COALESCE(
                job_status,
                ''
              )
            ) IN (
              'ASSIGNED',
              'IN_PROGRESS'
            )
          `,
          [technicianId]
        );

      const remainingActiveJobs =
        Number(
          remainingActiveRows[0]
            ?.active_job_count
        ) || 0;

      const [activeSupportRows] =
        await connection.query(
          `
          SELECT
            COUNT(*) AS active_support_count
          FROM technician_assistance
          WHERE support_technician_id = ?
            AND UPPER(
              COALESCE(
                assistance_status,
                ''
              )
            ) IN (
              'ASSIGNED',
              'IN_PROGRESS'
            )
          `,
          [technicianId]
        );

      const activeSupportCount =
        Number(
          activeSupportRows[0]
            ?.active_support_count
        ) || 0;

      const availabilityAfterCompletion =
        remainingActiveJobs >= 2 ||
        activeSupportCount > 0
          ? "BUSY"
          : "AVAILABLE";

      await connection.query(
        `
        UPDATE technician
        SET availability_status = ?
        WHERE technician_id = ?
        `,
        [
          availabilityAfterCompletion,
          technicianId,
        ]
      );
    }

    const [completedRows] =
      await connection.query(
        `
        SELECT
          sj.job_id,
          sj.start_date,
          sj.start_time,
          sj.end_date,
          sj.end_time,
          sj.estimated_completion_time,
          sj.actual_completion_time,
          sj.job_status,
          sj.technician_technician_id,
          sj.service_request_request_id,
          sj.garage_garage_id,
          sj.assistance_assistance_id,

          sr.request_status,
          sr.customer_stage,
          sr.customer_customer_id,
          sr.customer_name,
          sr.vehicle_number,
          sr.ticket_number

        FROM service_job sj

        LEFT JOIN service_request sr
          ON sr.request_id =
             sj.service_request_request_id

        WHERE
          sj.job_id = ?

        LIMIT 1
        `,
        [jobId]
      );

    if (
      completedRows.length === 0
    ) {
      throw new Error(
        "Completed service job could not be loaded."
      );
    }

    const completedJob =
      completedRows[0];

    await connection.commit();

    try {
      const customerId =
        Number(
          completedJob.customer_customer_id
        );

      if (
        Number.isInteger(
          customerId
        ) &&
        customerId > 0
      ) {
        const vehicleNumber =
          String(
            completedJob.vehicle_number ||
            "Your vehicle"
          ).trim();

        const notificationResult =
          await createNotification({
            garageId:
              Number(
                completedJob.garage_garage_id
              ) || null,

            customerId,

            notificationType:
              "SERVICE_COMPLETED",

            title:
              "Service Completed",

            message:
              `${vehicleNumber} service has been completed successfully.`,

            targetPage:
              "progress",

            referenceId:
              jobId,

            priority:
              "HIGH",
          });

        if (
          !notificationResult.success
        ) {
          console.error(
            "Service completed customer notification failed:",
            notificationResult.error
          );
        }
      }
    } catch (
      notificationError
    ) {
      console.error(
        "Service completion notification error:",
        notificationError
      );
    }

    return res.status(200).json({
      success: true,

      message:
        "Service job completed successfully.",

      job: {
        jobId:
          completedJob.job_id,

        requestId:
          completedJob.service_request_request_id,

        technicianId:
          completedJob.technician_technician_id,

        garageId:
          completedJob.garage_garage_id,

        assistanceId:
          completedJob.assistance_assistance_id,

        startDate:
          completedJob.start_date,

        startTime:
          completedJob.start_time,

        endDate:
          completedJob.end_date,

        endTime:
          completedJob.end_time,

        estimatedCompletionTime:
          completedJob.estimated_completion_time,

        actualCompletionTime:
          completedJob.actual_completion_time,

        jobStatus:
          completedJob.job_status,

        requestStatus:
          completedJob.request_status,

        customerStage:
          completedJob.customer_stage,

        ticketNumber:
          completedJob.ticket_number ||
          "",

        vehicleNumber:
          completedJob.vehicle_number ||
          "",
      },
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (
        rollbackError
      ) {
        console.error(
          "Complete service job rollback error:",
          rollbackError
        );
      }
    }

    console.error(
      "========== COMPLETE SERVICE JOB ERROR =========="
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
      "================================================"
    );

    return res.status(500).json({
      success: false,

      message:
        error.sqlMessage ||
        error.message ||
        "Unable to complete service job.",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// ======================================================
// CLEAR COMPLETED VEHICLE FROM GARAGE
// PUT /api/service-jobs/:jobId/clear
// ======================================================

const clearCompletedVehicle = async (
  req,
  res
) => {
  let connection;

  try {
    const jobId =
      Number(
        req.params.jobId
      );

    if (
      !Number.isInteger(jobId) ||
      jobId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid job ID is required.",
      });
    }

    connection =
      await db.getConnection();

    await connection.beginTransaction();

    const [jobRows] =
      await connection.query(
        `
        SELECT
          job_id,
          job_status,
          service_request_request_id,
          garage_garage_id
        FROM service_job
        WHERE job_id = ?
        LIMIT 1
        `,
        [jobId]
      );

    if (
      jobRows.length === 0
    ) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message:
          "Service job not found.",
      });
    }

    const job =
      jobRows[0];

    const currentStatus =
      String(
        job.job_status || ""
      )
        .trim()
        .toUpperCase();

    if (
      currentStatus !==
      "COMPLETED"
    ) {
      await connection.rollback();

      return res.status(409).json({
        success: false,
        message:
          "Only a completed service job can be cleared from the garage.",
      });
    }

    await connection.query(
      `
      UPDATE service_job
      SET job_status = 'CLEARED'
      WHERE job_id = ?
      `,
      [jobId]
    );

    if (
      job.service_request_request_id
    ) {
      await connection.query(
        `
        UPDATE service_request
        SET request_status = 'COMPLETED'
        WHERE request_id = ?
        `,
        [
          job.service_request_request_id,
        ]
      );
    }

    const [updatedRows] =
      await connection.query(
        `
        SELECT
          job_id,
          job_status,
          service_request_request_id,
          garage_garage_id,
          end_date,
          end_time,
          actual_completion_time
        FROM service_job
        WHERE job_id = ?
        LIMIT 1
        `,
        [jobId]
      );

    await connection.commit();

    const clearedJob =
      updatedRows[0];

    return res.status(200).json({
      success: true,

      message:
        "Vehicle cleared from the garage successfully.",

      job: {
        jobId:
          clearedJob.job_id,

        jobStatus:
          clearedJob.job_status,

        requestId:
          clearedJob.service_request_request_id,

        garageId:
          clearedJob.garage_garage_id,

        completedDate:
          clearedJob.end_date,

        completedTime:
          clearedJob.end_time,

        actualCompletionTime:
          clearedJob.actual_completion_time,
      },
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (
        rollbackError
      ) {
        console.error(
          "Clear vehicle rollback error:",
          rollbackError
        );
      }
    }

    console.error(
      "========== CLEAR COMPLETED VEHICLE ERROR =========="
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
      "==================================================="
    );

    return res.status(500).json({
      success: false,

      message:
        error.sqlMessage ||
        error.message ||
        "Unable to clear vehicle from the garage.",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// ======================================================
// GARAGE OWNER LIVE DASHBOARD
// GET /api/service-jobs/garage/:garageId/live-dashboard
// ======================================================

const getGarageLiveDashboard = async (
  req,
  res
) => {
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
      return res.status(400).json({
        success: false,
        message:
          "A valid garage ID is required.",
      });
    }

    const [garageRows] =
      await db.query(
        `
        SELECT
          garage_id,
          garage_name,
          capacity
        FROM garage
        WHERE garage_id = ?
        LIMIT 1
        `,
        [garageId]
      );

    if (
      garageRows.length === 0
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Garage not found.",
      });
    }

    const garage =
      garageRows[0];

    const [rows] =
      await db.query(
        `
        SELECT
          sj.job_id,
          sj.job_type,
          sj.start_date,
          sj.start_time,
          sj.end_date,
          sj.end_time,
          sj.job_status,
          sj.estimated_completion_time,
          sj.actual_completion_time,
          sj.remarks,

          sj.service_request_request_id,
          sj.technician_technician_id,
          sj.garage_garage_id,
          sj.assistance_assistance_id,

          sr.request_id,
          sr.ticket_number,
          sr.request_status,

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
            t.full_name,
            'Not Assigned'
          ) AS technician_name,

          COALESCE(
            t.specialization,
            ''
          ) AS technician_specialization,

          COALESCE(
            extension_data.total_extension_minutes,
            0
          ) AS total_extension_minutes,

          extension_data.latest_extension_reason,
          extension_data.latest_extension_datetime,

          CASE
            WHEN
              sj.estimated_completion_time IS NOT NULL
              AND COALESCE(
                extension_data.total_extension_minutes,
                0
              ) > 0
            THEN DATE_SUB(
              sj.estimated_completion_time,
              INTERVAL
                extension_data.total_extension_minutes
              MINUTE
            )
            ELSE
              sj.estimated_completion_time
          END AS original_estimated_completion_time,

          CASE
            WHEN
              sj.start_date IS NOT NULL
              AND sj.start_time IS NOT NULL
              AND sj.estimated_completion_time IS NOT NULL
            THEN TIMESTAMPDIFF(
              MINUTE,
              TIMESTAMP(
                sj.start_date,
                sj.start_time
              ),
              sj.estimated_completion_time
            )
            ELSE 0
          END AS workload_minutes

        FROM service_job sj

        INNER JOIN service_request sr
          ON sr.request_id =
             sj.service_request_request_id

        LEFT JOIN customer c
          ON c.customer_id =
             sr.customer_customer_id

        LEFT JOIN vehicle v
          ON v.vehicle_id =
             sr.vehicle_vehicle_id

        LEFT JOIN technician t
          ON t.technician_id =
             sj.technician_technician_id

        LEFT JOIN (
          SELECT
            ter.service_job_job_id,

            SUM(
              CASE
                WHEN UPPER(
                  COALESCE(
                    ter.approval_status,
                    ''
                  )
                ) = 'APPROVED'
                THEN COALESCE(
                  ter.approval_extra_time,
                  0
                )
                ELSE 0
              END
            ) AS total_extension_minutes,

            SUBSTRING_INDEX(
              GROUP_CONCAT(
                CASE
                  WHEN UPPER(
                    COALESCE(
                      ter.approval_status,
                      ''
                    )
                  ) = 'APPROVED'
                  THEN ter.reason
                  ELSE NULL
                END
                ORDER BY
                  ter.extension_request_id DESC
                SEPARATOR '|||'
              ),
              '|||',
              1
            ) AS latest_extension_reason,

            MAX(
              CASE
                WHEN UPPER(
                  COALESCE(
                    ter.approval_status,
                    ''
                  )
                ) = 'APPROVED'
                THEN ter.reviewed_date_time
                ELSE NULL
              END
            ) AS latest_extension_datetime

          FROM time_extension_request ter

          GROUP BY
            ter.service_job_job_id

        ) extension_data

          ON extension_data.service_job_job_id =
             sj.job_id

        WHERE
          sj.garage_garage_id = ?

          AND UPPER(
            COALESCE(
              sj.job_status,
              ''
            )
          ) IN (
            'ASSIGNED',
            'IN_PROGRESS'
          )

        ORDER BY
          CASE
            WHEN UPPER(
              sj.job_status
            ) = 'IN_PROGRESS'
            THEN 1

            WHEN UPPER(
              sj.job_status
            ) = 'ASSIGNED'
            THEN 2

            ELSE 3
          END,

          sj.job_id DESC
        `,
        [garageId]
      );

    const jobs =
      rows.map(
        (row) => {
          const totalExtensionMinutes =
            Number(
              row.total_extension_minutes
            ) || 0;

          const workloadMinutes =
            Math.max(
              0,
              Number(
                row.workload_minutes
              ) || 0
            );

          let displayStatus =
            String(
              row.job_status || ""
            ).toUpperCase();

          if (
            displayStatus ===
              "IN_PROGRESS" &&
            totalExtensionMinutes > 0
          ) {
            displayStatus =
              "TIME EXTENDED";
          }

          return {
            jobId:
              row.job_id,

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

            customerName:
              row.customer_name ||
              "Customer",

            customerContact:
              row.customer_contact ||
              "",

            technicianId:
              row.technician_technician_id,

            technicianName:
              row.technician_name ||
              "Not Assigned",

            technicianSpecialization:
              row.technician_specialization ||
              "",

            jobType:
              row.job_type ||
              "GENERAL SERVICE",

            jobStatus:
              row.job_status ||
              "",

            displayStatus,

            startDate:
              row.start_date,

            startTime:
              row.start_time,

            estimatedCompletionTime:
              row.estimated_completion_time,

            originalEstimatedCompletionTime:
              row.original_estimated_completion_time,

            actualCompletionTime:
              row.actual_completion_time,

            remarks:
              row.remarks ||
              "",

            assistanceId:
              row.assistance_assistance_id ??
              null,

            garageId:
              row.garage_garage_id,

            timeExtended:
              totalExtensionMinutes >
              0,

            totalExtensionMinutes,

            latestExtensionReason:
              row.latest_extension_reason ||
              "",

            latestExtensionDateTime:
              row.latest_extension_datetime ||
              null,

            workloadMinutes,
          };
        }
      );

    // ==================================================
    // TODAY ARRIVALS
    // ==================================================

    const [arrivalRows] =
      await db.query(
        `
        SELECT
          sr.request_id,
          sr.ticket_number,
          sr.customer_customer_id,
          sr.vehicle_vehicle_id,
          sr.request_status,
          sr.customer_stage,
          sr.arrived_at_garage_date,
          sr.arrived_at_garage_time,

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

          sj.job_id,
          sj.job_status,
          sj.technician_technician_id,

          COALESCE(
            t.full_name,
            'Not Assigned'
          ) AS technician_name,

          (
            SELECT
              td.dispatch_id
            FROM tow_dispatch td
            WHERE
              td.service_request_request_id =
                sr.request_id
            ORDER BY
              td.dispatch_id DESC
            LIMIT 1
          ) AS latest_dispatch_id,

          (
            SELECT
              td.dispatch_status
            FROM tow_dispatch td
            WHERE
              td.service_request_request_id =
                sr.request_id
            ORDER BY
              td.dispatch_id DESC
            LIMIT 1
          ) AS latest_dispatch_status

        FROM service_request sr

        LEFT JOIN customer c
          ON c.customer_id =
             sr.customer_customer_id

        LEFT JOIN vehicle v
          ON v.vehicle_id =
             sr.vehicle_vehicle_id

        LEFT JOIN service_job sj
          ON sj.job_id = (
            SELECT
              sj2.job_id
            FROM service_job sj2
            WHERE
              sj2.service_request_request_id =
                sr.request_id
            ORDER BY
              sj2.job_id DESC
            LIMIT 1
          )

        LEFT JOIN technician t
          ON t.technician_id =
             sj.technician_technician_id

        WHERE
          sr.garage_garage_id = ?
          AND sr.arrived_at_garage_date =
              CURRENT_DATE()

        ORDER BY
          sr.arrived_at_garage_time DESC,
          sr.request_id DESC
        `,
        [garageId]
      );

    const todayArrivals =
      arrivalRows.map(
        (row) => {
          const dispatchStatus =
            String(
              row.latest_dispatch_status ||
              ""
            )
              .trim()
              .toUpperCase();

          const jobStatus =
            String(
              row.job_status ||
              ""
            )
              .trim()
              .toUpperCase();

          const hasTowDispatch =
            row.latest_dispatch_id !==
              null &&
            row.latest_dispatch_id !==
              undefined;

          const arrivalMethod =
            hasTowDispatch
              ? "TOW TRUCK"
              : "DRIVE-IN";

          let arrivalStatus =
            "READY FOR TECHNICIAN";

          if (
            jobStatus ===
            "IN_PROGRESS"
          ) {
            arrivalStatus =
              "IN SERVICE";
          } else if (
            jobStatus ===
            "ASSIGNED"
          ) {
            arrivalStatus =
              "TECHNICIAN ASSIGNED";
          } else if (
            jobStatus ===
            "COMPLETED"
          ) {
            arrivalStatus =
              "SERVICE COMPLETED";
          } else if (
            jobStatus ===
            "CLEARED"
          ) {
            arrivalStatus =
              "CLEARED";
          } else if (
            hasTowDispatch &&
            dispatchStatus ===
              "ARRIVED_AT_GARAGE"
          ) {
            arrivalStatus =
              "TOW HANDOVER PENDING";
          } else if (
            hasTowDispatch &&
            dispatchStatus ===
              "COMPLETED"
          ) {
            arrivalStatus =
              "READY FOR TECHNICIAN";
          }

          return {
            requestId:
              row.request_id,

            ticketNumber:
              row.ticket_number ||
              "",

            customerId:
              row.customer_customer_id ??
              null,

            customerName:
              row.customer_name ||
              "Customer",

            customerContact:
              row.customer_contact ||
              "",

            vehicleId:
              row.vehicle_vehicle_id ??
              null,

            vehicleNumber:
              row.vehicle_number ||
              "",

            vehicleType:
              row.vehicle_type ||
              "",

            vehicleModel:
              row.vehicle_model ||
              "",

            arrivalDate:
              row.arrived_at_garage_date,

            arrivalTime:
              row.arrived_at_garage_time,

            arrivalMethod,

            arrivalStatus,

            requestStatus:
              row.request_status ||
              "",

            customerStage:
              row.customer_stage ||
              "",

            jobId:
              row.job_id ??
              null,

            jobStatus:
              row.job_status ||
              null,

            technicianId:
              row.technician_technician_id ??
              null,

            technicianName:
              row.technician_name ||
              "Not Assigned",

            towDispatchId:
              row.latest_dispatch_id ??
              null,

            towDispatchStatus:
              row.latest_dispatch_status ||
              null,
          };
        }
      );

    const activeJobs =
      jobs.filter(
        (job) =>
          String(
            job.jobStatus
          ).toUpperCase() ===
          "IN_PROGRESS"
      );

    const assignedJobs =
      jobs.filter(
        (job) =>
          String(
            job.jobStatus
          ).toUpperCase() ===
          "ASSIGNED"
      );

    const globalWorkloadMinutes =
      activeJobs.reduce(
        (
          total,
          job
        ) =>
          total +
          job.workloadMinutes,
        0
      );

    const databaseCapacity =
      Number(
        garage.capacity
      );

    const totalBays =
      Number.isFinite(
        databaseCapacity
      ) &&
      databaseCapacity > 0
        ? databaseCapacity
        : 6;

    const occupiedJobs =
      jobs.filter(
        (job) => {
          const jobStatus =
            String(
              job.jobStatus ||
              ""
            )
              .trim()
              .toUpperCase();

          return [
            "ASSIGNED",
            "IN_PROGRESS",
            "COMPLETED",
          ].includes(
            jobStatus
          );
        }
      );

    const activeVehicles =
      occupiedJobs.length;

    const occupancyPercentage =
      totalBays > 0
        ? Math.min(
            100,
            Math.round(
              (
                activeVehicles /
                totalBays
              ) *
                100
            )
          )
        : 0;

    return res.status(200).json({
      success: true,

      garage: {
        garageId:
          garage.garage_id,

        garageName:
          garage.garage_name ||
          "",

        capacity:
          totalBays,
      },

      summary: {
        globalWorkloadMinutes,

        activeVehicles,

        assignedVehicles:
          assignedJobs.length,

        totalLiveJobs:
          jobs.length,

        totalBays,

        occupancyPercentage,

        todayArrivalCount:
          todayArrivals.length,
      },

      vehicles:
        jobs,

      todayArrivals,
    });
  } catch (error) {
    console.error(
      "========== GARAGE LIVE DASHBOARD ERROR =========="
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

    return res.status(500).json({
      success: false,

      message:
        error.sqlMessage ||
        error.message ||
        "Unable to load garage live dashboard.",
    });
  }
};

// ======================================================
// GARAGE OWNER PERFORMANCE AUDIT
// GET /api/service-jobs/garage/:garageId/performance-audit
// ======================================================

const getGaragePerformanceAudit =
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
        return res.status(400).json({
          success: false,
          message:
            "A valid garage ID is required.",
        });
      }

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
        garageRows.length === 0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Garage not found.",
        });
      }

      const garage =
        garageRows[0];

      const [rows] =
        await db.query(
          `
          SELECT
            t.technician_id,
            t.full_name,
            t.specialization,
            t.shift_status,
            t.availability_status,

            COUNT(
              DISTINCT CASE
                WHEN UPPER(
                  COALESCE(
                    sj.job_status,
                    ''
                  )
                ) = 'COMPLETED'
                THEN sj.job_id
                ELSE NULL
              END
            ) AS jobs_done,

            COUNT(
              DISTINCT CASE
                WHEN UPPER(
                  COALESCE(
                    ter.approval_status,
                    ''
                  )
                ) = 'APPROVED'
                THEN
                  ter.extension_request_id
                ELSE NULL
              END
            ) AS extension_requests,

            ROUND(
              AVG(
                CASE
                  WHEN
                    UPPER(
                      COALESCE(
                        sj.job_status,
                        ''
                      )
                    ) = 'COMPLETED'

                    AND
                    sj.estimated_completion_time
                      IS NOT NULL

                    AND
                    sj.actual_completion_time
                      IS NOT NULL

                  THEN TIMESTAMPDIFF(
                    MINUTE,
                    sj.estimated_completion_time,
                    sj.actual_completion_time
                  )

                  ELSE NULL
                END
              )
            ) AS avg_time_error_minutes

          FROM technician t

          LEFT JOIN service_job sj
            ON sj.technician_technician_id =
               t.technician_id

            AND sj.garage_garage_id =
                t.garage_garage_id

          LEFT JOIN time_extension_request ter
            ON ter.service_job_job_id =
               sj.job_id

          WHERE
            t.garage_garage_id = ?

          GROUP BY
            t.technician_id,
            t.full_name,
            t.specialization,
            t.shift_status,
            t.availability_status

          ORDER BY
            t.full_name ASC
          `,
          [garageId]
        );

      const technicians =
        rows.map(
          (row) => {
            const jobsDone =
              Number(
                row.jobs_done
              ) || 0;

            const extensionRequests =
              Number(
                row.extension_requests
              ) || 0;

            const avgTimeErrorMinutes =
              row.avg_time_error_minutes ===
              null
                ? null
                : Number(
                    row.avg_time_error_minutes
                  );

            let avgTimeError =
              "N/A";

            if (
              avgTimeErrorMinutes !==
              null
            ) {
              if (
                avgTimeErrorMinutes >
                0
              ) {
                avgTimeError =
                  `+${avgTimeErrorMinutes} mins`;
              } else if (
                avgTimeErrorMinutes <
                0
              ) {
                avgTimeError =
                  `${avgTimeErrorMinutes} mins`;
              } else {
                avgTimeError =
                  "0 mins";
              }
            }

            let efficiencyIndex =
              0;

            if (
              jobsDone > 0
            ) {
              let score =
                100;

              if (
                avgTimeErrorMinutes !==
                  null &&
                avgTimeErrorMinutes >
                  0
              ) {
                const latePenalty =
                  Math.min(
                    40,
                    avgTimeErrorMinutes *
                      1.5
                  );

                score -=
                  latePenalty;
              }

              const extensionRate =
                extensionRequests /
                jobsDone;

              const extensionPenalty =
                Math.min(
                  30,
                  extensionRate *
                    20
                );

              score -=
                extensionPenalty;

              efficiencyIndex =
                Math.max(
                  0,
                  Math.min(
                    100,
                    Math.round(
                      score
                    )
                  )
                );
            }

            let performanceLevel =
              "NO DATA";

            if (
              jobsDone > 0
            ) {
              if (
                efficiencyIndex >=
                90
              ) {
                performanceLevel =
                  "EXCELLENT";
              } else if (
                efficiencyIndex >=
                75
              ) {
                performanceLevel =
                  "GOOD";
              } else if (
                efficiencyIndex >=
                60
              ) {
                performanceLevel =
                  "AVERAGE";
              } else {
                performanceLevel =
                  "LOW";
              }
            }

            return {
              technicianId:
                row.technician_id,

              technicianName:
                row.full_name ||
                "Technician",

              specialization:
                row.specialization ||
                "",

              shiftStatus:
                row.shift_status ||
                "OFF",

              availabilityStatus:
                row.availability_status ||
                "AVAILABLE",

              jobsDone,

              extensionRequests,

              avgTimeErrorMinutes,

              avgTimeError,

              efficiencyIndex,

              performanceLevel,
            };
          }
        );

      const totalTechnicians =
        technicians.length;

      const totalJobsDone =
        technicians.reduce(
          (
            total,
            technician
          ) =>
            total +
            technician.jobsDone,
          0
        );

      const totalExtensionRequests =
        technicians.reduce(
          (
            total,
            technician
          ) =>
            total +
            technician.extensionRequests,
          0
        );

      const techniciansWithCompletedJobs =
        technicians.filter(
          (technician) =>
            technician.jobsDone >
            0
        );

      const averageEfficiency =
        techniciansWithCompletedJobs
          .length > 0
          ? Math.round(
              techniciansWithCompletedJobs.reduce(
                (
                  total,
                  technician
                ) =>
                  total +
                  technician.efficiencyIndex,
                0
              ) /
                techniciansWithCompletedJobs.length
            )
          : 0;

      return res.status(200).json({
        success: true,

        garage: {
          garageId:
            garage.garage_id,

          garageName:
            garage.garage_name ||
            "",
        },

        summary: {
          totalTechnicians,
          totalJobsDone,
          totalExtensionRequests,
          averageEfficiency,
        },

        technicians,
      });
    } catch (error) {
      console.error(
        "========== GARAGE PERFORMANCE AUDIT ERROR =========="
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

      return res.status(500).json({
        success: false,

        message:
          error.sqlMessage ||
          error.message ||
          "Unable to load garage performance audit.",
      });
    }
  };

// ======================================================
// CUSTOMER LIVE PROGRESS
// GET /api/service-jobs/customer/:contactNumber/:vehicleNumber/live-progress
// ======================================================

const getCustomerLiveProgress =
  async (req, res) => {
    try {
      const contactNumber =
        String(
          req.params.contactNumber ||
          ""
        ).trim();

      const vehicleNumber =
        String(
          req.params.vehicleNumber ||
          ""
        ).trim();

      if (
        !contactNumber ||
        !vehicleNumber
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Contact number and vehicle number are required.",
        });
      }

      const [rows] =
        await db.query(
          `
          SELECT
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

            sr.request_id,
            sr.ticket_number,
            sr.customer_name,
            sr.contact_number,
            sr.vehicle_number,
            sr.vehicle_type,

            sj.technician_technician_id,
            sj.garage_garage_id,

            COALESCE(
              t.full_name,
              'Not Assigned'
            ) AS technician_name,

            COALESCE(
              t.specialization,
              ''
            ) AS technician_specialization,

            COALESCE(
              g.garage_name,
              ''
            ) AS garage_name,

            COALESCE(
              g.contact_number,
              ''
            ) AS garage_contact_number,

            COALESCE(
              extension_data.total_extension_minutes,
              0
            ) AS total_extension_minutes,

            extension_data.latest_extension_reason

          FROM service_job sj

          INNER JOIN service_request sr
            ON sr.request_id =
               sj.service_request_request_id

          LEFT JOIN technician t
            ON t.technician_id =
               sj.technician_technician_id

          LEFT JOIN garage g
            ON g.garage_id =
               sj.garage_garage_id

          LEFT JOIN (
            SELECT
              ter.service_job_job_id,

              SUM(
                CASE
                  WHEN UPPER(
                    COALESCE(
                      ter.approval_status,
                      ''
                    )
                  ) = 'APPROVED'
                  THEN COALESCE(
                    ter.approval_extra_time,
                    0
                  )
                  ELSE 0
                END
              ) AS total_extension_minutes,

              SUBSTRING_INDEX(
                GROUP_CONCAT(
                  CASE
                    WHEN UPPER(
                      COALESCE(
                        ter.approval_status,
                        ''
                      )
                    ) = 'APPROVED'
                    THEN ter.reason
                    ELSE NULL
                  END
                  ORDER BY
                    ter.extension_request_id DESC
                  SEPARATOR '|||'
                ),
                '|||',
                1
              ) AS latest_extension_reason

            FROM time_extension_request ter

            GROUP BY
              ter.service_job_job_id

          ) extension_data

            ON extension_data.service_job_job_id =
               sj.job_id

          WHERE
            sr.contact_number = ?

            AND UPPER(
              REPLACE(
                COALESCE(
                  sr.vehicle_number,
                  ''
                ),
                ' ',
                ''
              )
            ) =
            UPPER(
              REPLACE(
                ?,
                ' ',
                ''
              )
            )

          ORDER BY
            CASE
              WHEN UPPER(
                COALESCE(
                  sj.job_status,
                  ''
                )
              ) = 'IN_PROGRESS'
              THEN 1

              WHEN UPPER(
                COALESCE(
                  sj.job_status,
                  ''
                )
              ) = 'ASSIGNED'
              THEN 2

              WHEN UPPER(
                COALESCE(
                  sj.job_status,
                  ''
                )
              ) = 'COMPLETED'
              THEN 3

              ELSE 4
            END,

            sj.job_id DESC

          LIMIT 1
          `,
          [
            contactNumber,
            vehicleNumber,
          ]
        );

      if (
        rows.length === 0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "No service job was found for this customer and vehicle.",
        });
      }

      const row =
        rows[0];

      const totalExtensionMinutes =
        Number(
          row.total_extension_minutes
        ) || 0;

      let displayStatus =
        String(
          row.job_status || ""
        )
          .trim()
          .toUpperCase();

      if (
        displayStatus ===
          "IN_PROGRESS" &&
        totalExtensionMinutes >
          0
      ) {
        displayStatus =
          "TIME EXTENDED";
      }

      return res.status(200).json({
        success: true,

        job: {
          jobId:
            row.job_id,

          requestId:
            row.request_id,

          ticketNumber:
            row.ticket_number ||
            "",

          jobType:
            row.job_type ||
            "",

          jobStatus:
            row.job_status ||
            "",

          displayStatus,

          customerName:
            row.customer_name ||
            "Customer",

          contactNumber:
            row.contact_number ||
            "",

          vehicleNumber:
            row.vehicle_number ||
            "",

          vehicleType:
            row.vehicle_type ||
            "",

          technicianId:
            row.technician_technician_id,

          technicianName:
            row.technician_name ||
            "Not Assigned",

          technicianSpecialization:
            row.technician_specialization ||
            "",

          garageId:
            row.garage_garage_id,

          garageName:
            row.garage_name ||
            "",

          garageContactNumber:
            row.garage_contact_number ||
            "",

          startDate:
            row.start_date,

          startTime:
            row.start_time,

          endDate:
            row.end_date,

          endTime:
            row.end_time,

          estimatedCompletionTime:
            row.estimated_completion_time,

          actualCompletionTime:
            row.actual_completion_time,

          timeExtended:
            totalExtensionMinutes >
            0,

          totalExtensionMinutes,

          latestExtensionReason:
            row.latest_extension_reason ||
            "",

          remarks:
            row.remarks ||
            "",
        },
      });
    } catch (error) {
      console.error(
        "========== CUSTOMER LIVE PROGRESS ERROR =========="
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

      return res.status(500).json({
        success: false,

        message:
          error.sqlMessage ||
          error.message ||
          "Unable to load customer live progress.",
      });
    }
  };

// ======================================================
// GET COMPLETED JOBS FOR BILLING
// ======================================================

const getCompletedJobsForBilling =
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
        return res.status(400).json({
          success: false,
          message:
            "A valid garage ID is required.",
        });
      }

      const [rows] =
        await db.query(
          `
          SELECT
            sj.job_id,
            sj.job_status,
            sj.end_date,
            sj.end_time,

            sr.request_id,
            sr.ticket_number,
            sr.customer_name,
            sr.contact_number,
            sr.vehicle_number,
            sr.vehicle_type,

            sr.customer_customer_id
              AS customer_id,

            sr.vehicle_vehicle_id
              AS vehicle_id,

            sj.garage_garage_id
              AS garage_id

          FROM service_job sj

          INNER JOIN service_request sr
            ON sr.request_id =
               sj.service_request_request_id

          LEFT JOIN invoice i
            ON i.service_job_job_id =
               sj.job_id

          WHERE
            sj.garage_garage_id = ?

            AND UPPER(
              TRIM(
                COALESCE(
                  sj.job_status,
                  ''
                )
              )
            ) = 'COMPLETED'

            AND i.invoice_id
                IS NULL

          ORDER BY
            sj.end_date DESC,
            sj.end_time DESC,
            sj.job_id DESC
          `,
          [garageId]
        );

      const jobs =
        rows.map(
          (row) => ({
            jobId:
              row.job_id,

            requestId:
              row.request_id,

            ticketNumber:
              row.ticket_number ||
              `JOB-${row.job_id}`,

            customerId:
              row.customer_id ||
              null,

            customerName:
              row.customer_name ||
              "Unknown Customer",

            contactNumber:
              row.contact_number ||
              "",

            vehicleId:
              row.vehicle_id ||
              null,

            vehicleNumber:
              row.vehicle_number ||
              "",

            vehicleType:
              row.vehicle_type ||
              "",

            garageId:
              row.garage_id,

            jobStatus:
              row.job_status,

            completedDate:
              row.end_date,

            completedTime:
              row.end_time,
          })
        );

      return res.status(200).json({
        success: true,

        garageId,

        count:
          jobs.length,

        jobs,
      });
    } catch (error) {
      console.error(
        "========== GET COMPLETED JOBS FOR BILLING ERROR =========="
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
        "=========================================================="
      );

      return res.status(500).json({
        success: false,

        message:
          error.sqlMessage ||
          error.message ||
          "Unable to load completed jobs for billing.",
      });
    }
  };

// ======================================================
// GET COMPLETED VEHICLES FOR CLEAR
// ======================================================

const getCompletedVehiclesForClear =
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
        return res.status(400).json({
          success: false,
          message:
            "Invalid garage ID.",
        });
      }

      const [rows] =
        await db.query(
          `
          SELECT
            sj.job_id,
            sj.job_status,
            sj.end_date,
            sj.end_time,
            sj.actual_completion_time,

            sr.request_id,
            sr.ticket_number,
            sr.customer_name,
            sr.contact_number,
            sr.vehicle_number,
            sr.vehicle_type,

            sr.customer_customer_id
              AS customer_id,

            sr.vehicle_vehicle_id
              AS vehicle_id,

            sj.garage_garage_id
              AS garage_id

          FROM service_job sj

          INNER JOIN service_request sr
            ON sr.request_id =
               sj.service_request_request_id

          WHERE
            sj.garage_garage_id = ?

            AND UPPER(
              TRIM(
                COALESCE(
                  sj.job_status,
                  ''
                )
              )
            ) = 'COMPLETED'

          ORDER BY
            sj.end_date DESC,
            sj.end_time DESC,
            sj.job_id DESC
          `,
          [garageId]
        );

      const jobs =
        rows.map(
          (row) => ({
            jobId:
              row.job_id,

            requestId:
              row.request_id,

            ticketNumber:
              row.ticket_number ||
              `JOB-${row.job_id}`,

            customerId:
              row.customer_id ||
              null,

            customerName:
              row.customer_name ||
              "Unknown Customer",

            contactNumber:
              row.contact_number ||
              "",

            vehicleId:
              row.vehicle_id ||
              null,

            vehicleNumber:
              row.vehicle_number ||
              "",

            vehicleType:
              row.vehicle_type ||
              "",

            garageId:
              row.garage_id,

            jobStatus:
              row.job_status,

            completedDate:
              row.end_date,

            completedTime:
              row.end_time,

            actualCompletionTime:
              row.actual_completion_time,
          })
        );

      return res.status(200).json({
        success: true,

        garageId,

        count:
          jobs.length,

        jobs,
      });
    } catch (error) {
      console.error(
        "GET COMPLETED VEHICLES FOR CLEAR ERROR:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          error.sqlMessage ||
          error.message ||
          "Unable to load completed vehicles.",
      });
    }
  };

  // ======================================================
// GARAGE JOB TECHNICIAN HISTORY
// GET /api/service-jobs/garage/:garageId/job-history
// ======================================================

const getGarageJobHistory = async (req, res) => {
  try {
    const garageId = Number(req.params.garageId);

    // ==================================================
    // VALIDATE GARAGE ID
    // ==================================================

    if (
      !Number.isInteger(garageId) ||
      garageId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid garage ID is required.",
      });
    }

    // ==================================================
    // CHECK GARAGE
    // ==================================================

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

    const garage = garageRows[0];

    // ==================================================
    // LOAD COMPLETED / CLEARED JOBS
    // ==================================================

    const [jobRows] = await db.query(
      `
      SELECT
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

        sj.service_request_request_id,
        sj.technician_technician_id,
        sj.garage_garage_id,
        sj.assistance_assistance_id,

        sr.request_id,
        sr.ticket_number,

        COALESCE(
          sr.customer_name,
          c.full_name,
          'Customer'
        ) AS customer_name,

        COALESCE(
          sr.contact_number,
          c.contact_number,
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

        COALESCE(
          mainTech.full_name,
          'Unknown Technician'
        ) AS main_technician_name,

        COALESCE(
          mainTech.specialization,
          ''
        ) AS main_technician_specialization

      FROM service_job sj

      INNER JOIN service_request sr
        ON sr.request_id =
           sj.service_request_request_id

      LEFT JOIN customer c
        ON c.customer_id =
           sr.customer_customer_id

      LEFT JOIN vehicle v
        ON v.vehicle_id =
           sr.vehicle_vehicle_id

      LEFT JOIN technician mainTech
        ON mainTech.technician_id =
           sj.technician_technician_id

      WHERE
        sj.garage_garage_id = ?

        AND UPPER(
          TRIM(
            COALESCE(
              sj.job_status,
              ''
            )
          )
        ) IN (
          'COMPLETED',
          'CLEARED'
        )

      ORDER BY
        COALESCE(
          sj.actual_completion_time,
          TIMESTAMP(
            sj.end_date,
            sj.end_time
          )
        ) DESC,
        sj.job_id DESC
      `,
      [garageId]
    );

    // ==================================================
    // NO JOBS
    // ==================================================

    if (jobRows.length === 0) {
      return res.status(200).json({
        success: true,

        garage: {
          garageId: garage.garage_id,
          garageName: garage.garage_name || "",
        },

        count: 0,
        jobs: [],
      });
    }

    // ==================================================
    // GET JOB IDS
    // ==================================================

    const jobIds = jobRows
      .map((row) => Number(row.job_id))
      .filter(
        (jobId) =>
          Number.isInteger(jobId) &&
          jobId > 0
      );

    // ==================================================
    // LOAD SUPPORT ASSISTANCE HISTORY
    // ==================================================

    let assistanceRows = [];

    if (jobIds.length > 0) {
      const placeholders =
        jobIds.map(() => "?").join(",");

      const [rows] = await db.query(
        `
        SELECT
          ta.assistance_id,
          ta.garage_id,
          ta.job_id,
          ta.main_technician_id,
          ta.support_technician_id,
          ta.reason,
          ta.assistance_status,
          ta.assigned_at,
          ta.completed_at,

          COALESCE(
            supportTech.full_name,
            'Support Technician'
          ) AS support_technician_name,

          COALESCE(
            supportTech.specialization,
            ''
          ) AS support_technician_specialization

        FROM technician_assistance ta

        LEFT JOIN technician supportTech
          ON supportTech.technician_id =
             ta.support_technician_id

        WHERE
          ta.garage_id = ?

          AND ta.job_id IN (
            ${placeholders}
          )

        ORDER BY
          ta.job_id DESC,
          ta.assigned_at ASC,
          ta.assistance_id ASC
        `,
        [garageId, ...jobIds]
      );

      assistanceRows = rows;
    }

    // ==================================================
    // GROUP SUPPORT ASSISTANCES BY JOB
    // ==================================================

    const supportHistoryMap = {};

    assistanceRows.forEach((row) => {
      const jobId = Number(row.job_id);

      if (!supportHistoryMap[jobId]) {
        supportHistoryMap[jobId] = [];
      }

      supportHistoryMap[jobId].push({
        assistanceId:
          row.assistance_id,

        mainTechnicianId:
          row.main_technician_id,

        supportTechnicianId:
          row.support_technician_id,

        supportTechnicianName:
          row.support_technician_name ||
          "Support Technician",

        specialization:
          row.support_technician_specialization ||
          "",

        reason:
          row.reason || "",

        assistanceStatus:
          row.assistance_status || "",

        assignedAt:
          row.assigned_at || null,

        completedAt:
          row.completed_at || null,
      });
    });

    // ==================================================
    // FORMAT FINAL JOB HISTORY
    // ==================================================

    const jobs = jobRows.map((row) => {
      const jobId = Number(row.job_id);

      const supportAssistances =
        supportHistoryMap[jobId] || [];

      return {
        jobId,

        requestId:
          row.request_id,

        ticketNumber:
          row.ticket_number ||
          `JOB-${jobId}`,

        jobType:
          row.job_type ||
          "GENERAL SERVICE",

        jobStatus:
          row.job_status || "",

        customerName:
          row.customer_name ||
          "Customer",

        customerContact:
          row.customer_contact || "",

        vehicleNumber:
          row.vehicle_number || "",

        vehicleType:
          row.vehicle_type || "",

        vehicleModel:
          row.vehicle_model || "",

        startDate:
          row.start_date || null,

        startTime:
          row.start_time || null,

        endDate:
          row.end_date || null,

        endTime:
          row.end_time || null,

        estimatedCompletionTime:
          row.estimated_completion_time ||
          null,

        actualCompletionTime:
          row.actual_completion_time ||
          null,

        remarks:
          row.remarks || "",

        mainTechnician: {
          technicianId:
            row.technician_technician_id,

          technicianName:
            row.main_technician_name ||
            "Unknown Technician",

          specialization:
            row.main_technician_specialization ||
            "",
        },

        supportAssistances,

        hadSupportAssistance:
          supportAssistances.length > 0,

        supportCount:
          supportAssistances.length,
      };
    });

    // ==================================================
    // RESPONSE
    // ==================================================

    return res.status(200).json({
      success: true,

      garage: {
        garageId:
          garage.garage_id,

        garageName:
          garage.garage_name || "",
      },

      count:
        jobs.length,

      jobs,
    });
  } catch (error) {
    console.error(
      "========== GARAGE JOB HISTORY ERROR =========="
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
      "============================================="
    );

    return res.status(500).json({
      success: false,

      message:
        error.sqlMessage ||
        error.message ||
        "Unable to load garage job history.",
    });
  }
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  assignTechnicianToJob,
  getTechnicianJobs,
  startServiceJob,
  completeServiceJob,
  clearCompletedVehicle,
  getGarageLiveDashboard,
  getGaragePerformanceAudit,
  getGarageJobHistory,
  getCustomerLiveProgress,
  getCompletedJobsForBilling,
  getCompletedVehiclesForClear,
};