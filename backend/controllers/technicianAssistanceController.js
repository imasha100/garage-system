const db = require("../config/db");

const {
  createNotification,
} = require("./notificationController");

const MAX_ACTIVE_MAIN_JOBS = 2;
const MAX_TOTAL_SUPPORT_WORKLOAD = 3;

// ======================================================
// GET TECHNICIAN WORKLOAD DETAILS
// Main jobs and support assistances are tracked separately.
// ======================================================

const getTechnicianWorkload = async (
  connection,
  technicianId
) => {
  const [mainJobRows] = await connection.query(
    `
    SELECT COUNT(*) AS active_job_count
    FROM service_job
    WHERE technician_technician_id = ?
      AND UPPER(COALESCE(job_status, '')) IN (
        'ASSIGNED',
        'IN_PROGRESS'
      )
    `,
    [technicianId]
  );

  const [supportRows] = await connection.query(
    `
    SELECT COUNT(*) AS active_support_count
    FROM technician_assistance
    WHERE support_technician_id = ?
      AND UPPER(COALESCE(assistance_status, '')) IN (
        'ASSIGNED',
        'IN_PROGRESS'
      )
    `,
    [technicianId]
  );

  const mainActiveJobs =
    Number(mainJobRows[0]?.active_job_count) || 0;

  const activeSupportAssistances =
    Number(supportRows[0]?.active_support_count) || 0;

  const totalActiveWorkload =
    mainActiveJobs + activeSupportAssistances;

  return {
    mainActiveJobs,
    activeSupportAssistances,
    totalActiveWorkload,
  };
};

// ======================================================
// UPDATE TECHNICIAN AVAILABILITY
// BUSY when:
// 1) Main jobs >= 2, OR
// 2) Technician has an active support assistance.
// Otherwise AVAILABLE.
// ======================================================

const updateTechnicianAvailability =
  async (connection, technicianId) => {
    const [technicianRows] = await connection.query(
      `
      SELECT
        technician_id,
        shift_status,
        availability_status
      FROM technician
      WHERE technician_id = ?
      LIMIT 1
      `,
      [technicianId]
    );

    if (technicianRows.length === 0) {
      return null;
    }

    const technician = technicianRows[0];

    const currentAvailability = String(
      technician.availability_status || ""
    )
      .trim()
      .toUpperCase();

    if (
      currentAvailability === "UNAVAILABLE" ||
      currentAvailability === "INACTIVE"
    ) {
      const workload = await getTechnicianWorkload(
        connection,
        technicianId
      );

      return {
        technicianId,
        availabilityStatus: currentAvailability,
        ...workload,
      };
    }

    const workload = await getTechnicianWorkload(
      connection,
      technicianId
    );

    const availabilityStatus =
      workload.mainActiveJobs >= MAX_ACTIVE_MAIN_JOBS ||
      workload.activeSupportAssistances > 0
        ? "BUSY"
        : "AVAILABLE";

    await connection.query(
      `
      UPDATE technician
      SET availability_status = ?
      WHERE technician_id = ?
      `,
      [availabilityStatus, technicianId]
    );

    return {
      technicianId,
      availabilityStatus,
      ...workload,
    };
  };

// ======================================================
// ASSIGN SUPPORT TECHNICIAN
// POST /api/technician-assistance/assign
// ======================================================

const assignSupportTechnician = async (req, res) => {
  let connection;

  try {
    const {
      garageId,
      jobId,
      mainTechnicianId,
      supportTechnicianId,
      reason,
    } = req.body;

    if (
      !garageId ||
      !jobId ||
      !mainTechnicianId ||
      !supportTechnicianId ||
      !reason
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    const numericGarageId = Number(garageId);
    const numericJobId = Number(jobId);

    const numericMainTechnicianId =
      Number(mainTechnicianId);

    const numericSupportTechnicianId =
      Number(supportTechnicianId);

    if (
      !Number.isInteger(numericGarageId) ||
      !Number.isInteger(numericJobId) ||
      !Number.isInteger(numericMainTechnicianId) ||
      !Number.isInteger(numericSupportTechnicianId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID value.",
      });
    }

    if (
      numericGarageId <= 0 ||
      numericJobId <= 0 ||
      numericMainTechnicianId <= 0 ||
      numericSupportTechnicianId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID value.",
      });
    }

    // ==================================================
    // MAIN TECHNICIAN CANNOT BE SUPPORT TECHNICIAN
    // ==================================================

    if (
      numericMainTechnicianId ===
      numericSupportTechnicianId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Main technician and support technician cannot be the same.",
      });
    }

    connection = await db.getConnection();

    await connection.beginTransaction();

    // ==================================================
    // CHECK SERVICE JOB
    // ==================================================

    const [jobRows] = await connection.query(
      `
      SELECT
        sj.job_id,
        sj.garage_garage_id,
        sj.technician_technician_id,
        sj.job_status,

        COALESCE(
          sr.vehicle_number,
          'Vehicle'
        ) AS vehicle_number,

        sr.contact_number AS customer_contact_number,

        sr.customer_customer_id AS customer_id,

        COALESCE(
          t.full_name,
          'Main Technician'
        ) AS main_technician_name

      FROM service_job sj

      INNER JOIN service_request sr
        ON sr.request_id =
           sj.service_request_request_id

      LEFT JOIN technician t
        ON t.technician_id =
           sj.technician_technician_id

      WHERE sj.job_id = ?

      LIMIT 1
      `,
      [numericJobId]
    );

    if (jobRows.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Service job not found.",
      });
    }

    const job = jobRows[0];

    // ==================================================
    // VERIFY GARAGE
    // ==================================================

    if (
      Number(job.garage_garage_id) !==
      numericGarageId
    ) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message:
          "This service job does not belong to the selected garage.",
      });
    }

    // ==================================================
    // CHECK JOB STATUS
    // ==================================================

    const jobStatus = String(
      job.job_status || ""
    )
      .trim()
      .toUpperCase();

    if (
      ![
        "ASSIGNED",
        "IN_PROGRESS",
      ].includes(jobStatus)
    ) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message:
          "Support technician can only be assigned to an active service job.",
      });
    }

    // ==================================================
    // VERIFY MAIN TECHNICIAN
    // ==================================================

    if (
      Number(
        job.technician_technician_id
      ) !== numericMainTechnicianId
    ) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message:
          "Selected main technician is not assigned to this service job.",
      });
    }

    // ==================================================
    // CHECK SUPPORT TECHNICIAN
    // ==================================================

    const [technicianRows] =
      await connection.query(
        `
        SELECT
          technician_id,
          garage_garage_id,
          shift_status,
          availability_status

        FROM technician

        WHERE technician_id = ?

        LIMIT 1

        FOR UPDATE
        `,
        [numericSupportTechnicianId]
      );

    if (technicianRows.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message:
          "Support technician not found.",
      });
    }

    const supportTechnician =
      technicianRows[0];

    // ==================================================
    // VERIFY TECHNICIAN GARAGE
    // ==================================================

    if (
      Number(
        supportTechnician.garage_garage_id
      ) !== numericGarageId
    ) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message:
          "Support technician does not belong to this garage.",
      });
    }

    // ==================================================
    // CHECK SHIFT
    // ==================================================

    const shiftStatus = String(
      supportTechnician.shift_status || ""
    )
      .trim()
      .toUpperCase();

    if (shiftStatus !== "ON") {
      await connection.rollback();

      return res.status(409).json({
        success: false,
        message:
          "Support technician is currently off shift.",
      });
    }

    // ==================================================
    // CHECK AVAILABILITY
    // ==================================================

    const availabilityStatus = String(
      supportTechnician.availability_status || ""
    )
      .trim()
      .toUpperCase();

    if (
      [
        "UNAVAILABLE",
        "INACTIVE",
      ].includes(availabilityStatus)
    ) {
      await connection.rollback();

      return res.status(409).json({
        success: false,
        message:
          "Support technician is currently unavailable.",
      });
    }

    // ==================================================
    // CHECK CURRENT WORKLOAD
    // ==================================================

    const currentWorkload =
      await getTechnicianWorkload(
        connection,
        numericSupportTechnicianId
      );

    // ==================================================
    // TECHNICIAN ALREADY DOING SUPPORT
    // ==================================================

    if (
      currentWorkload.activeSupportAssistances > 0
    ) {
      await connection.rollback();

      return res.status(409).json({
        success: false,
        code:
          "SUPPORT_TECHNICIAN_ALREADY_ASSIGNED",

        message:
          "This technician already has an active support assistance. Complete the current assistance before assigning another one.",
      });
    }

    // ==================================================
    // CHECK MAX WORKLOAD
    // ==================================================

    if (
      currentWorkload.totalActiveWorkload >=
      MAX_TOTAL_SUPPORT_WORKLOAD
    ) {
      await connection.rollback();

      return res.status(409).json({
        success: false,
        code:
          "TECHNICIAN_WORKLOAD_LIMIT_REACHED",

        message:
          "Support technician has reached the maximum active workload.",
      });
    }

    // ==================================================
    // CHECK DUPLICATE ACTIVE SUPPORT ASSIGNMENT
    // ==================================================
    // Same support technician cannot be assigned
    // twice to the same job.
    // ==================================================

    const [existingSupportRows] =
      await connection.query(
        `
        SELECT
          assistance_id

        FROM technician_assistance

        WHERE job_id = ?

          AND support_technician_id = ?

          AND UPPER(
            COALESCE(
              assistance_status,
              ''
            )
          ) IN (
            'ASSIGNED',
            'IN_PROGRESS'
          )

        LIMIT 1
        `,
        [
          numericJobId,
          numericSupportTechnicianId,
        ]
      );

    if (
      existingSupportRows.length > 0
    ) {
      await connection.rollback();

      return res.status(409).json({
        success: false,

        code:
          "SUPPORT_ALREADY_ASSIGNED_TO_JOB",

        message:
          "This support technician is already assigned to this job.",
      });
    }

    // ==================================================
    // CREATE ASSISTANCE
    // ==================================================

    const [insertResult] =
      await connection.query(
        `
        INSERT INTO technician_assistance
        (
          garage_id,
          job_id,
          main_technician_id,
          support_technician_id,
          reason,
          assistance_status
        )
        VALUES
        (
          ?,
          ?,
          ?,
          ?,
          ?,
          'ASSIGNED'
        )
        `,
        [
          numericGarageId,
          numericJobId,
          numericMainTechnicianId,
          numericSupportTechnicianId,
          String(reason).trim(),
        ]
      );

    // ==================================================
    // SUPPORT TECHNICIAN BECOMES BUSY
    // ==================================================

    const workloadAfterAssignment =
      currentWorkload.totalActiveWorkload + 1;

    const availabilityAfterAssignment =
      "BUSY";

    await connection.query(
      `
      UPDATE technician

      SET availability_status = ?

      WHERE technician_id = ?
      `,
      [
        availabilityAfterAssignment,
        numericSupportTechnicianId,
      ]
    );

    // ==================================================
    // COMMIT DATABASE CHANGES
    // ==================================================

    await connection.commit();

    // ==================================================
    // SUPPORT TECHNICIAN NOTIFICATION
    // ==================================================

    try {
      const notificationResult =
        await createNotification({
          garageId:
            numericGarageId,

          technicianId:
            numericSupportTechnicianId,

          notificationType:
            "SUPPORT_ASSISTANCE_ASSIGNED",

          title:
            "Support Assistance Assigned",

          message:
            `You have been assigned to assist ${job.main_technician_name} with vehicle ${job.vehicle_number}. Reason: ${String(
              reason
            ).trim()}.`,

          targetPage:
            "technician-intake",

          referenceId:
            insertResult.insertId,

          priority:
            "HIGH",
        });

      if (
        notificationResult &&
        notificationResult.success === false
      ) {
        console.error(
          "SUPPORT TECHNICIAN NOTIFICATION ERROR:",
          notificationResult.error
        );
      }
    } catch (notificationError) {
      console.error(
        "SUPPORT TECHNICIAN NOTIFICATION ERROR:",
        notificationError
      );
    }

    // ==================================================
    // CUSTOMER NOTIFICATION
    // ==================================================

    try {
      const customerId =
        Number(job.customer_id);

      if (
        Number.isInteger(customerId) &&
        customerId > 0
      ) {
        const customerNotificationResult =
          await createNotification({
            garageId:
              numericGarageId,

            customerId,

            notificationType:
              "SUPPORT_TECHNICIAN_ASSIGNED",

            title:
              "Additional Technician Assigned",

            message:
              `An additional technician has been assigned to assist with your vehicle ${job.vehicle_number}.`,

            targetPage:
              "progress",

            referenceId:
              insertResult.insertId,

            priority:
              "NORMAL",
          });

        if (
          customerNotificationResult &&
          customerNotificationResult
            .success === false
        ) {
          console.error(
            "CUSTOMER SUPPORT NOTIFICATION ERROR:",
            customerNotificationResult.error
          );
        }
      }
    } catch (notificationError) {
      console.error(
        "CUSTOMER SUPPORT NOTIFICATION ERROR:",
        notificationError
      );
    }

    // ==================================================
    // RESPONSE
    // ==================================================

    return res.status(201).json({
      success: true,

      message:
        "Support technician assigned successfully.",

      assistance: {
        assistanceId:
          insertResult.insertId,

        garageId:
          numericGarageId,

        jobId:
          numericJobId,

        mainTechnicianId:
          numericMainTechnicianId,

        supportTechnicianId:
          numericSupportTechnicianId,

        reason:
          String(reason).trim(),

        assistanceStatus:
          "ASSIGNED",

        mainActiveJobs:
          currentWorkload.mainActiveJobs,

        activeSupportAssistances:
          currentWorkload
            .activeSupportAssistances + 1,

        totalActiveWorkload:
          workloadAfterAssignment,

        technicianAvailability:
          availabilityAfterAssignment,
      },
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error(
          "ASSISTANCE ROLLBACK ERROR:",
          rollbackError
        );
      }
    }

    console.error(
      "ASSIGN SUPPORT TECHNICIAN ERROR:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        error.sqlMessage ||
        error.message ||
        "Unable to assign support technician.",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// ======================================================
// GET GARAGE TECHNICIAN ASSISTANCE
// GET /api/technician-assistance/garage/:garageId
// ======================================================

const getGarageTechnicianAssistance =
  async (req, res) => {
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
            "Invalid garage ID.",
        });
      }

      const [rows] =
        await db.query(
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

            sr.request_id,
            sr.ticket_number,
            sr.customer_name,
            sr.contact_number,
            sr.vehicle_number,
            sr.vehicle_type,

            sj.job_status

          FROM technician_assistance ta

          INNER JOIN service_job sj
            ON sj.job_id =
               ta.job_id

          INNER JOIN service_request sr
            ON sr.request_id =
               sj.service_request_request_id

          WHERE ta.garage_id = ?

          ORDER BY

            CASE
              WHEN ta.assistance_status =
                'IN_PROGRESS'
                THEN 0

              WHEN ta.assistance_status =
                'ASSIGNED'
                THEN 1

              ELSE 2
            END,

            ta.assigned_at DESC
          `,
          [garageId]
        );

      const assistance =
        rows.map((row) => ({
          assistanceId:
            row.assistance_id,

          garageId:
            row.garage_id,

          jobId:
            row.job_id,

          mainTechnicianId:
            row.main_technician_id,

          supportTechnicianId:
            row.support_technician_id,

          reason:
            row.reason,

          assistanceStatus:
            row.assistance_status,

          assignedAt:
            row.assigned_at,

          completedAt:
            row.completed_at,

          requestId:
            row.request_id,

          ticketNumber:
            row.ticket_number,

          customerName:
            row.customer_name,

          contactNumber:
            row.contact_number,

          vehicleNumber:
            row.vehicle_number,

          vehicleType:
            row.vehicle_type,

          jobStatus:
            row.job_status,
        }));

      return res.status(200).json({
        success: true,

        garageId,

        count:
          assistance.length,

        assistance,
      });
    } catch (error) {
      console.error(
        "GET GARAGE ASSISTANCE ERROR:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          error.sqlMessage ||
          error.message ||
          "Unable to load technician assistance.",
      });
    }
  };

// ======================================================
// START TECHNICIAN ASSISTANCE
// ASSIGNED -> IN_PROGRESS
// PUT /api/technician-assistance/:assistanceId/start
// ======================================================

const startTechnicianAssistance =
  async (req, res) => {
    let connection;

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
        return res.status(400).json({
          success: false,

          message:
            "Invalid assistance ID.",
        });
      }

      connection =
        await db.getConnection();

      await connection.beginTransaction();

      // ==================================================
      // GET ASSISTANCE RECORD
      // ==================================================

      const [rows] =
        await connection.query(
          `
          SELECT
            assistance_id,
            assistance_status,
            support_technician_id

          FROM technician_assistance

          WHERE assistance_id = ?

          LIMIT 1

          FOR UPDATE
          `,
          [assistanceId]
        );

      if (rows.length === 0) {
        await connection.rollback();

        return res.status(404).json({
          success: false,

          message:
            "Technician assistance record not found.",
        });
      }

      const assistance =
        rows[0];

      const currentStatus =
        String(
          assistance.assistance_status ||
          ""
        )
          .trim()
          .toUpperCase();

      // ==================================================
      // ALREADY IN PROGRESS
      // ==================================================

      if (
        currentStatus ===
        "IN_PROGRESS"
      ) {
        await connection.rollback();

        return res.status(409).json({
          success: false,

          message:
            "This assistance is already in progress.",
        });
      }

      // ==================================================
      // COMPLETED CANNOT START AGAIN
      // ==================================================

      if (
        currentStatus ===
        "COMPLETED"
      ) {
        await connection.rollback();

        return res.status(409).json({
          success: false,

          message:
            "Completed assistance cannot be started again.",
        });
      }

      // ==================================================
      // ONLY ASSIGNED CAN START
      // ==================================================

      if (
        currentStatus !==
        "ASSIGNED"
      ) {
        await connection.rollback();

        return res.status(409).json({
          success: false,

          message:
            "Only assigned assistance can be started.",
        });
      }

      // ==================================================
      // UPDATE TO IN PROGRESS
      // ==================================================

      await connection.query(
        `
        UPDATE technician_assistance

        SET assistance_status =
          'IN_PROGRESS'

        WHERE assistance_id = ?
        `,
        [assistanceId]
      );

      const supportTechnicianId =
        Number(
          assistance
            .support_technician_id
        );

      let technicianWorkload = null;

      if (
        Number.isInteger(
          supportTechnicianId
        ) &&
        supportTechnicianId > 0
      ) {
        technicianWorkload =
          await updateTechnicianAvailability(
            connection,
            supportTechnicianId
          );
      }

      await connection.commit();

      return res.status(200).json({
        success: true,

        message:
          "Technician assistance started successfully.",

        assistanceId,

        assistanceStatus:
          "IN_PROGRESS",

        supportTechnicianId,

        technicianAvailability:
          technicianWorkload
            ?.availabilityStatus ||
          null,

        mainActiveJobs:
          technicianWorkload
            ?.mainActiveJobs ??
          null,

        activeSupportAssistances:
          technicianWorkload
            ?.activeSupportAssistances ??
          null,

        totalActiveWorkload:
          technicianWorkload
            ?.totalActiveWorkload ??
          null,
      });
    } catch (error) {
      if (connection) {
        try {
          await connection.rollback();
        } catch (rollbackError) {
          console.error(
            "START ASSISTANCE ROLLBACK ERROR:",
            rollbackError
          );
        }
      }

      console.error(
        "START TECHNICIAN ASSISTANCE ERROR:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          error.sqlMessage ||
          error.message ||
          "Unable to start technician assistance.",
      });
    } finally {
      if (connection) {
        connection.release();
      }
    }
  };

// ======================================================
// COMPLETE TECHNICIAN ASSISTANCE
// ASSIGNED / IN_PROGRESS -> COMPLETED
// PUT /api/technician-assistance/:assistanceId/complete
// ======================================================

const completeTechnicianAssistance =
  async (req, res) => {
    let connection;

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
        return res.status(400).json({
          success: false,

          message:
            "Invalid assistance ID.",
        });
      }

      connection =
        await db.getConnection();

      await connection.beginTransaction();

      // ==================================================
      // GET ASSISTANCE
      // ==================================================

      const [rows] =
        await connection.query(
          `
          SELECT
            assistance_id,
            assistance_status,
            garage_id,
            job_id,
            main_technician_id,
            support_technician_id

          FROM technician_assistance

          WHERE assistance_id = ?

          LIMIT 1

          FOR UPDATE
          `,
          [assistanceId]
        );

      if (rows.length === 0) {
        await connection.rollback();

        return res.status(404).json({
          success: false,

          message:
            "Technician assistance record not found.",
        });
      }

      const assistance =
        rows[0];

      const currentStatus =
        String(
          assistance.assistance_status ||
          ""
        )
          .trim()
          .toUpperCase();

      // ==================================================
      // ALREADY COMPLETED
      // ==================================================

      if (
        currentStatus ===
        "COMPLETED"
      ) {
        await connection.rollback();

        return res.status(409).json({
          success: false,

          message:
            "This assistance has already been completed.",
        });
      }

      // ==================================================
      // COMPLETE ASSISTANCE
      // ==================================================

      await connection.query(
        `
        UPDATE technician_assistance

        SET
          assistance_status =
            'COMPLETED',

          completed_at =
            NOW()

        WHERE assistance_id = ?
        `,
        [assistanceId]
      );

      const supportTechnicianId =
        Number(
          assistance
            .support_technician_id
        );

      let technicianWorkload = null;

      if (
        Number.isInteger(
          supportTechnicianId
        ) &&
        supportTechnicianId > 0
      ) {
        technicianWorkload =
          await updateTechnicianAvailability(
            connection,
            supportTechnicianId
          );
      }

      await connection.commit();

      return res.status(200).json({
        success: true,

        message:
          "Technician assistance completed successfully.",

        assistanceId,

        assistanceStatus:
          "COMPLETED",

        supportTechnicianId,

        technicianAvailability:
          technicianWorkload
            ?.availabilityStatus ||
          null,

        mainActiveJobs:
          technicianWorkload
            ?.mainActiveJobs ??
          null,

        activeSupportAssistances:
          technicianWorkload
            ?.activeSupportAssistances ??
          null,

        totalActiveWorkload:
          technicianWorkload
            ?.totalActiveWorkload ??
          null,
      });
    } catch (error) {
      if (connection) {
        try {
          await connection.rollback();
        } catch (rollbackError) {
          console.error(
            "COMPLETE ASSISTANCE ROLLBACK ERROR:",
            rollbackError
          );
        }
      }

      console.error(
        "COMPLETE TECHNICIAN ASSISTANCE ERROR:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          error.sqlMessage ||
          error.message ||
          "Unable to complete technician assistance.",
      });
    } finally {
      if (connection) {
        connection.release();
      }
    }
  };

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  assignSupportTechnician,
  getGarageTechnicianAssistance,
  startTechnicianAssistance,
  completeTechnicianAssistance,
};