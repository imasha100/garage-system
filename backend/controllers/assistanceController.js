const db = require("../config/db");

// ======================================================
// HELPER FUNCTIONS
// ======================================================

const formatAssistanceId = (assistanceId) =>
  `ASSIST-${String(assistanceId).padStart(4, "0")}`;

const formatAssistance = (assistance) => ({
  assistanceId: assistance.assistance_id,
  formattedAssistanceId: formatAssistanceId(
    assistance.assistance_id
  ),
  fullName: assistance.full_name,
  email: assistance.email,
  contactNumber: assistance.contact_number,
  nic: assistance.nic,
  shiftStatus: assistance.shift_status,
  role: assistance.role,
  garageId: assistance.garage_garage_id,
});

const generateTemporaryPassword = () => {
  const randomNumber =
    Math.floor(100000 + Math.random() * 900000);

  return `Assist@${randomNumber}`;
};

// ======================================================
// REGISTER ASSISTANCE OFFICER
// ======================================================

const registerAssistance = async (req, res) => {
  let connection;

  try {
    console.log(
      "========== REGISTER ASSISTANCE API CALLED =========="
    );

    console.log("Request Body:", req.body);

    const {
      fullName,
      email,
      contactNumber,
      nic,
      garageId,
    } = req.body;

    if (
      !fullName?.trim() ||
      !email?.trim() ||
      !contactNumber?.trim() ||
      !nic?.trim() ||
      garageId === "" ||
      garageId === null ||
      garageId === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please fill in all required fields.",
      });
    }

    const cleanFullName =
      fullName.trim();

    const cleanEmail =
      email.trim().toLowerCase();

    const cleanContactNumber =
      contactNumber.trim();

    const cleanNic =
      nic.trim().toUpperCase();

    const numericGarageId =
      Number(garageId);

    const fullNameRegex =
      /^[A-Za-z][A-Za-z\s.'-]{1,79}$/;

    const emailRegex =
      /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

    const contactRegex =
      /^0\d{9}$/;

    const nicRegex =
      /^(\d{9}[VX]|\d{12})$/;

    if (!fullNameRegex.test(cleanFullName)) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a valid full name.",
      });
    }

    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a valid email address.",
      });
    }

    if (!contactRegex.test(cleanContactNumber)) {
      return res.status(400).json({
        success: false,
        message:
          "Contact number must contain exactly 10 digits and start with 0.",
      });
    }

    if (!nicRegex.test(cleanNic)) {
      return res.status(400).json({
        success: false,
        message:
          "NIC must contain 9 digits followed by V/X or exactly 12 digits.",
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

    connection =
      await db.getConnection();

    await connection.beginTransaction();

    const [garageRows] =
      await connection.query(
        `
        SELECT garage_id
        FROM garage
        WHERE garage_id = ?
        LIMIT 1
        `,
        [numericGarageId]
      );

    if (garageRows.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message:
          "The selected garage does not exist.",
      });
    }

    const [duplicateRows] =
      await connection.query(
        `
        SELECT
          assistance_id,
          email,
          contact_number,
          nic
        FROM assistance
        WHERE email = ?
           OR contact_number = ?
           OR nic = ?
        LIMIT 1
        `,
        [
          cleanEmail,
          cleanContactNumber,
          cleanNic,
        ]
      );

    if (duplicateRows.length > 0) {
      await connection.rollback();

      const duplicate =
        duplicateRows[0];

      let duplicateField =
        "details";

      if (
        String(duplicate.email).toLowerCase() ===
        cleanEmail
      ) {
        duplicateField =
          "email address";
      } else if (
        String(duplicate.contact_number) ===
        cleanContactNumber
      ) {
        duplicateField =
          "contact number";
      } else if (
        String(duplicate.nic).toUpperCase() ===
        cleanNic
      ) {
        duplicateField =
          "NIC number";
      }

      return res.status(409).json({
        success: false,
        message:
          `An assistance officer already exists with this ${duplicateField}.`,
      });
    }

    const [existingLoginRows] =
      await connection.query(
        `
        SELECT login_id
        FROM login
        WHERE user_name = ?
        LIMIT 1
        `,
        [cleanNic]
      );

    if (
      existingLoginRows.length > 0
    ) {
      await connection.rollback();

      return res.status(409).json({
        success: false,
        message:
          "This NIC number is already used as a system username.",
      });
    }

    const role =
      "assistance";

    const temporaryPassword =
      generateTemporaryPassword();

    const username =
      cleanNic;

    const [loginResult] =
      await connection.query(
        `
        INSERT INTO login (
          user_name,
          password,
          role
        )
        VALUES (?, ?, ?)
        `,
        [
          username,
          temporaryPassword,
          role,
        ]
      );

    const loginId =
      loginResult.insertId;

    const [assistanceResult] =
      await connection.query(
        `
        INSERT INTO assistance (
          full_name,
          email,
          contact_number,
          nic,
          shift_status,
          role,
          login_login_id,
          garage_garage_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          cleanFullName,
          cleanEmail,
          cleanContactNumber,
          cleanNic,
          "OFF",
          role,
          loginId,
          numericGarageId,
        ]
      );

    const assistanceId =
      assistanceResult.insertId;

    const formattedAssistanceId =
      formatAssistanceId(
        assistanceId
      );

    await connection.commit();

    console.log(
      "Assistance officer registered successfully:",
      {
        assistanceId,
        formattedAssistanceId,
        loginId,
        username,
        garageId:
          numericGarageId,
      }
    );

    return res.status(201).json({
      success: true,
      message:
        "Assistance officer registered successfully.",

      assistance: {
        assistanceId,
        formattedAssistanceId,
        fullName:
          cleanFullName,
        email:
          cleanEmail,
        contactNumber:
          cleanContactNumber,
        nic:
          cleanNic,
        shiftStatus:
          "OFF",
        role,
        garageId:
          numericGarageId,
      },

      loginDetails: {
        username,
        temporaryPassword,
      },
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error(
          "Assistance registration rollback failed:",
          rollbackError
        );
      }
    }

    console.error(
      "========== REGISTER ASSISTANCE ERROR =========="
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

    if (
      error.code ===
      "ER_DUP_ENTRY"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Username, email, contact number or NIC already exists.",
      });
    }

    if (
      error.code ===
      "ER_NO_REFERENCED_ROW_2"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "The assistance officer could not be linked to the selected garage.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        error.sqlMessage ||
        "Unable to register assistance officer.",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// ======================================================
// GET ALL ASSISTANCE OFFICERS
// ======================================================

const getAllAssistances = async (
  req,
  res
) => {
  try {
    const requestedGarageId =
      req.query.garageId;

    let sql = `
      SELECT
        assistance_id,
        full_name,
        email,
        contact_number,
        nic,
        shift_status,
        role,
        garage_garage_id
      FROM assistance
    `;

    const queryValues = [];

    if (
      requestedGarageId !==
        undefined &&
      requestedGarageId !== ""
    ) {
      const numericGarageId =
        Number(
          requestedGarageId
        );

      if (
        !Number.isInteger(
          numericGarageId
        ) ||
        numericGarageId <= 0
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "A valid garage ID is required.",
          });
      }

      sql += `
        WHERE garage_garage_id = ?
      `;

      queryValues.push(
        numericGarageId
      );
    }

    sql += `
      ORDER BY full_name ASC
    `;

    const [rows] =
      await db.query(
        sql,
        queryValues
      );

    const assistances =
      rows.map(
        formatAssistance
      );

    return res
      .status(200)
      .json({
        success: true,
        assistances,
      });
  } catch (error) {
    console.error(
      "========== GET ASSISTANCES ERROR =========="
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

    return res
      .status(500)
      .json({
        success: false,
        message:
          error.sqlMessage ||
          "Unable to fetch assistance officers.",
      });
  }
};
// ======================================================
// GET SINGLE ASSISTANCE OFFICER
// ======================================================

const getAssistanceById = async (
  req,
  res
) => {
  try {
    const assistanceId =
      Number(req.params.id);

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
            "A valid assistance ID is required.",
        });
    }

    const [rows] =
      await db.query(
        `
        SELECT
          assistance_id,
          full_name,
          email,
          contact_number,
          nic,
          shift_status,
          role,
          garage_garage_id
        FROM assistance
        WHERE assistance_id = ?
        LIMIT 1
        `,
        [assistanceId]
      );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({
          success: false,
          message:
            "Assistance officer not found.",
        });
    }

    return res
      .status(200)
      .json({
        success: true,
        assistance:
          formatAssistance(
            rows[0]
          ),
      });
  } catch (error) {
    console.error(
      "========== GET ASSISTANCE ERROR =========="
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
      "=========================================="
    );

    return res
      .status(500)
      .json({
        success: false,
        message:
          error.sqlMessage ||
          "Unable to fetch assistance officer details.",
      });
  }
};

// ======================================================
// UPDATE ASSISTANCE OFFICER
// ======================================================

const updateAssistance = async (
  req,
  res
) => {
  let connection;

  try {
    const assistanceId =
      Number(req.params.id);

    const {
      fullName,
      email,
      contactNumber,
      nic,
    } = req.body;

    if (
      !Number.isInteger(
        assistanceId
      ) ||
      assistanceId <= 0 ||
      !fullName?.trim() ||
      !email?.trim() ||
      !contactNumber?.trim() ||
      !nic?.trim()
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Please fill in all required fields.",
        });
    }

    const cleanFullName =
      fullName.trim();

    const cleanEmail =
      email
        .trim()
        .toLowerCase();

    const cleanContactNumber =
      contactNumber.trim();

    const cleanNic =
      nic
        .trim()
        .toUpperCase();

    const fullNameRegex =
      /^[A-Za-z][A-Za-z\s.'-]{1,79}$/;

    const emailRegex =
      /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

    const contactRegex =
      /^0\d{9}$/;

    const nicRegex =
      /^(\d{9}[VX]|\d{12})$/;

    if (
      !fullNameRegex.test(
        cleanFullName
      )
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Please enter a valid full name.",
        });
    }

    if (
      !emailRegex.test(
        cleanEmail
      )
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Please enter a valid email address.",
        });
    }

    if (
      !contactRegex.test(
        cleanContactNumber
      )
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Contact number must contain exactly 10 digits and start with 0.",
        });
    }

    if (
      !nicRegex.test(
        cleanNic
      )
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "NIC must contain 9 digits followed by V/X or exactly 12 digits.",
        });
    }

    connection =
      await db.getConnection();

    await connection.beginTransaction();

    const [existingRows] =
      await connection.query(
        `
        SELECT
          assistance_id,
          login_login_id,
          garage_garage_id
        FROM assistance
        WHERE assistance_id = ?
        LIMIT 1
        `,
        [assistanceId]
      );

    if (
      existingRows.length === 0
    ) {
      await connection.rollback();

      return res
        .status(404)
        .json({
          success: false,
          message:
            "Assistance officer not found.",
        });
    }

    const existingAssistance =
      existingRows[0];

    const loginId =
      existingAssistance
        .login_login_id;

    const [duplicateRows] =
      await connection.query(
        `
        SELECT
          assistance_id,
          email,
          contact_number,
          nic
        FROM assistance
        WHERE assistance_id <> ?
          AND (
            email = ?
            OR contact_number = ?
            OR nic = ?
          )
        LIMIT 1
        `,
        [
          assistanceId,
          cleanEmail,
          cleanContactNumber,
          cleanNic,
        ]
      );

    if (
      duplicateRows.length > 0
    ) {
      await connection.rollback();

      const duplicate =
        duplicateRows[0];

      let duplicateField =
        "details";

      if (
        String(
          duplicate.email
        ).toLowerCase() ===
        cleanEmail
      ) {
        duplicateField =
          "email address";
      } else if (
        String(
          duplicate.contact_number
        ) ===
        cleanContactNumber
      ) {
        duplicateField =
          "contact number";
      } else if (
        String(
          duplicate.nic
        ).toUpperCase() ===
        cleanNic
      ) {
        duplicateField =
          "NIC number";
      }

      return res
        .status(409)
        .json({
          success: false,
          message:
            `Another assistance officer already uses this ${duplicateField}.`,
        });
    }

    const [duplicateLoginRows] =
      await connection.query(
        `
        SELECT login_id
        FROM login
        WHERE user_name = ?
          AND login_id <> ?
        LIMIT 1
        `,
        [
          cleanNic,
          loginId,
        ]
      );

    if (
      duplicateLoginRows.length >
      0
    ) {
      await connection.rollback();

      return res
        .status(409)
        .json({
          success: false,
          message:
            "This NIC number is already used as another system username.",
        });
    }

    await connection.query(
      `
      UPDATE assistance
      SET
        full_name = ?,
        email = ?,
        contact_number = ?,
        nic = ?
      WHERE assistance_id = ?
      `,
      [
        cleanFullName,
        cleanEmail,
        cleanContactNumber,
        cleanNic,
        assistanceId,
      ]
    );

    await connection.query(
      `
      UPDATE login
      SET user_name = ?
      WHERE login_id = ?
      `,
      [
        cleanNic,
        loginId,
      ]
    );

    await connection.commit();

    return res
      .status(200)
      .json({
        success: true,
        message:
          "Assistance officer details updated successfully.",

        assistance: {
          assistanceId,
          formattedAssistanceId:
            formatAssistanceId(
              assistanceId
            ),
          fullName:
            cleanFullName,
          email:
            cleanEmail,
          contactNumber:
            cleanContactNumber,
          nic:
            cleanNic,
          shiftStatus:
            existingAssistance
              .shift_status,
          garageId:
            existingAssistance
              .garage_garage_id,
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
          "Assistance update rollback failed:",
          rollbackError
        );
      }
    }

    console.error(
      "========== UPDATE ASSISTANCE ERROR =========="
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

    if (
      error.code ===
      "ER_DUP_ENTRY"
    ) {
      return res
        .status(409)
        .json({
          success: false,
          message:
            "This username, email, contact number or NIC is already used.",
        });
    }

    return res
      .status(500)
      .json({
        success: false,
        message:
          error.sqlMessage ||
          "Unable to update assistance officer.",
      });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};
// ======================================================
// UPDATE ASSISTANCE SHIFT STATUS
// ======================================================

const updateAssistanceShiftStatus =
  async (req, res) => {
    try {
      const assistanceId =
        Number(req.params.id);

      const normalizedShiftStatus =
        String(
          req.body?.shiftStatus ||
            ""
        )
          .trim()
          .toUpperCase();

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
              "A valid assistance ID is required.",
          });
      }

      if (
        normalizedShiftStatus !==
          "ON" &&
        normalizedShiftStatus !==
          "OFF"
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Shift status must be ON or OFF.",
          });
      }

      const [existingRows] =
        await db.query(
          `
          SELECT
            assistance_id,
            full_name,
            email,
            contact_number,
            nic,
            shift_status,
            role,
            garage_garage_id
          FROM assistance
          WHERE assistance_id = ?
          LIMIT 1
          `,
          [assistanceId]
        );

      if (
        existingRows.length ===
        0
      ) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Assistance officer not found.",
          });
      }

      await db.query(
        `
        UPDATE assistance
        SET shift_status = ?
        WHERE assistance_id = ?
        `,
        [
          normalizedShiftStatus,
          assistanceId,
        ]
      );

      const updatedAssistance = {
        ...existingRows[0],
        shift_status:
          normalizedShiftStatus,
      };

      return res
        .status(200)
        .json({
          success: true,
          message:
            "Shift status updated successfully.",
          assistance:
            formatAssistance(
              updatedAssistance
            ),
        });
    } catch (error) {
      console.error(
        "========== UPDATE ASSISTANCE SHIFT ERROR =========="
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

      return res
        .status(500)
        .json({
          success: false,
          message:
            error.sqlMessage ||
            "Unable to update assistance shift status.",
        });
    }
  };

// ======================================================
// EXPORT CONTROLLER FUNCTIONS
// ======================================================

module.exports = {
  registerAssistance,
  getAllAssistances,
  getAssistanceById,
  updateAssistance,
  updateAssistanceShiftStatus,
};