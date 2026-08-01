const db = require("../config/db");

// ======================================================
// CREATE / APPROVE TIME EXTENSION
// POST /api/time-extensions
// ======================================================

const createTimeExtension = async (req, res) => {
  let connection;

  try {
    const {
      jobId,
      technicianId,
      extraTime,
      reason,
    } = req.body;

    const numericJobId = Number(jobId);
    const numericTechnicianId = Number(technicianId);

    if (
      !Number.isInteger(numericJobId) ||
      numericJobId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid service job ID is required.",
      });
    }

    if (
      !Number.isInteger(numericTechnicianId) ||
      numericTechnicianId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid technician ID is required.",
      });
    }

    if (!extraTime) {
      return res.status(400).json({
        success: false,
        message: "Extra time is required.",
      });
    }

    if (!String(reason || "").trim()) {
      return res.status(400).json({
        success: false,
        message: "Reason is required.",
      });
    }

    const timeParts = String(extraTime).split(":");

    if (timeParts.length !== 2) {
      return res.status(400).json({
        success: false,
        message: "Extra time format is invalid.",
      });
    }

    const hours = Number(timeParts[0]);
    const minutes = Number(timeParts[1]);

    if (
      !Number.isInteger(hours) ||
      !Number.isInteger(minutes) ||
      hours < 0 ||
      minutes < 0 ||
      minutes > 59
    ) {
      return res.status(400).json({
        success: false,
        message: "Extra time is invalid.",
      });
    }

    const totalMinutes =
      hours * 60 + minutes;

    if (totalMinutes <= 0) {
      return res.status(400).json({
        success: false,
        message:
          "Extra time must be greater than zero.",
      });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    // ==================================================
    // CHECK JOB
    // ==================================================

    const [jobRows] = await connection.query(
      `
      SELECT
        job_id,
        job_status,
        estimated_completion_time,
        technician_technician_id
      FROM service_job
      WHERE job_id = ?
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

    if (
      Number(job.technician_technician_id) !==
      numericTechnicianId
    ) {
      await connection.rollback();

      return res.status(403).json({
        success: false,
        message:
          "This technician is not assigned to this job.",
      });
    }

    if (
      String(job.job_status || "").toUpperCase() !==
      "IN_PROGRESS"
    ) {
      await connection.rollback();

      return res.status(409).json({
        success: false,
        message:
          "Only in-progress jobs can receive extra time.",
      });
    }

    if (!job.estimated_completion_time) {
      await connection.rollback();

      return res.status(409).json({
        success: false,
        message:
          "Estimated completion time is not available for this job.",
      });
    }

    // ==================================================
    // INSERT TIME EXTENSION HISTORY
    // ==================================================

    const [extensionResult] =
      await connection.query(
        `
        INSERT INTO time_extension_request (
          request_extra_time,
          reason,
          request_date,
          request_time,
          approval_status,
          approval_extra_time,
          reviewed_date_time,
          service_job_job_id,
          technician_technician_id
        )
        VALUES (
          SEC_TO_TIME(? * 60),
          ?,
          CURDATE(),
          CURTIME(),
          'APPROVED',
          ?,
          NOW(),
          ?,
          ?
        )
        `,
        [
          totalMinutes,
          String(reason).trim(),
          totalMinutes,
          numericJobId,
          numericTechnicianId,
        ]
      );

    // ==================================================
    // EXTEND ESTIMATED COMPLETION TIME
    // ==================================================

    await connection.query(
      `
      UPDATE service_job
      SET estimated_completion_time =
        DATE_ADD(
          estimated_completion_time,
          INTERVAL ? MINUTE
        )
      WHERE job_id = ?
      `,
      [
        totalMinutes,
        numericJobId,
      ]
    );

    const [updatedRows] =
      await connection.query(
        `
        SELECT
          job_id,
          estimated_completion_time
        FROM service_job
        WHERE job_id = ?
        LIMIT 1
        `,
        [numericJobId]
      );

    await connection.commit();

    return res.status(201).json({
      success: true,
      message:
        "Service job time extended successfully.",

      extension: {
        extensionRequestId:
          extensionResult.insertId,

        jobId:
          numericJobId,

        technicianId:
          numericTechnicianId,

        extraMinutes:
          totalMinutes,

        reason:
          String(reason).trim(),

        approvalStatus:
          "APPROVED",

        newEstimatedCompletionTime:
          updatedRows[0]
            .estimated_completion_time,
      },
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error(
          "Time extension rollback error:",
          rollbackError
        );
      }
    }

    console.error(
      "Create time extension error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.sqlMessage ||
        "Unable to extend service job time.",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

module.exports = {
  createTimeExtension,
};