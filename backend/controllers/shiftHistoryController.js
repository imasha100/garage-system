const db = require("../config/db");

// ======================================================
// GET GARAGE STAFF SHIFT HISTORY
//
// GET /api/shift-history/garage/:garageId
// ======================================================

const getGarageShiftHistory = async (req, res) => {
  try {
    const garageId = Number(req.params.garageId);

    // ==========================================
    // VALIDATE GARAGE ID
    // ==========================================

    if (
      !Number.isInteger(garageId) ||
      garageId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid garage ID is required.",
      });
    }

    // ==========================================
    // CHECK GARAGE EXISTS
    // ==========================================

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

    // ==========================================
    // GET SHIFT HISTORY
    // ==========================================

    const [rows] = await db.query(
      `
        SELECT
          h.shift_history_id,
          h.garage_id,
          h.staff_type,
          h.staff_id,
          h.shift_status,
          h.changed_at,

          CASE
            WHEN h.staff_type = 'TECHNICIAN'
              THEN t.full_name

            WHEN h.staff_type = 'ASSISTANCE'
              THEN a.full_name

            ELSE NULL
          END AS staff_name

        FROM staff_shift_history h

        LEFT JOIN technician t
          ON h.staff_type = 'TECHNICIAN'
          AND t.technician_id = h.staff_id

        LEFT JOIN assistance a
          ON h.staff_type = 'ASSISTANCE'
          AND a.assistance_id = h.staff_id

        WHERE h.garage_id = ?

        ORDER BY
          h.changed_at DESC,
          h.shift_history_id DESC
      `,
      [garageId]
    );

    // ==========================================
    // FORMAT HISTORY
    // ==========================================

    const history = rows.map((row) => ({
      shiftHistoryId:
        row.shift_history_id,

      garageId:
        row.garage_id,

      staffType:
        row.staff_type,

      staffId:
        row.staff_id,

      staffName:
        row.staff_name ||
        "Unknown Staff",

      shiftStatus:
        row.shift_status,

      changedAt:
        row.changed_at,
    }));

    // ==========================================
    // RESPONSE
    // ==========================================

    return res.status(200).json({
      success: true,

      garage: {
        garageId:
          garageRows[0].garage_id,

        garageName:
          garageRows[0].garage_name,
      },

      count:
        history.length,

      history,
    });
  } catch (error) {
    console.error(
      "========== GET GARAGE SHIFT HISTORY ERROR =========="
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
        "Unable to load garage shift history.",
    });
  }
};

module.exports = {
  getGarageShiftHistory,
};