const db = require("../config/db");

// ======================================================
// HELPER FUNCTIONS
// ======================================================

const normalizeSpecialization = (specialization) => {
  if (!Array.isArray(specialization)) {
    return [];
  }

  return specialization
    .map((item) => String(item).trim())
    .filter(Boolean);
};

const formatTechnician = (technician) => {
  return {
    technicianId: technician.technician_id,
    fullName: technician.full_name,
    contactNumber: technician.contact_number,
    email: technician.email,
    nic: technician.nic,
    experience: technician.experience_years,

    specialization: technician.specialization
      ? technician.specialization
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : [],

    shiftStatus: technician.shift_status,
    availabilityStatus: technician.availability_status,
    profilePhoto: technician.profile_photo,
    role: technician.role,
    garageId: technician.garage_garage_id,
  };
};

const getNextNumericTechnicianId = async (
  connection = db
) => {
  const [rows] = await connection.query(`
    SELECT
      COALESCE(MAX(technician_id), 0) + 1 AS next_id
    FROM technician
  `);

  return Number(rows[0]?.next_id || 1);
};

// ======================================================
// GET NEXT TECHNICIAN ID
// ======================================================

const getNextTechnicianId = async (req, res) => {
  try {
    const technicianId =
      await getNextNumericTechnicianId();

    return res.status(200).json({
      success: true,
      technicianId,
    });
  } catch (error) {
    console.error(
      "========== NEXT TECHNICIAN ID ERROR =========="
    );
    console.error("Code:", error.code);
    console.error("Message:", error.message);
    console.error("SQL Message:", error.sqlMessage);
    console.error("SQL:", error.sql);
    console.error(
      "=============================================="
    );

    return res.status(500).json({
      success: false,
      message:
        error.sqlMessage ||
        "Unable to generate the next technician ID.",
    });
  }
};

// ======================================================
// REGISTER TECHNICIAN
// ======================================================

const registerTechnician = async (req, res) => {
  let connection;

  try {
    console.log(
      "=== REGISTER TECHNICIAN API CALLED ==="
    );

    console.log("Request Body:", req.body);

    const {
      fullName,
      email,
      contactNumber,
      nic,
      specialization,
      experience,
      garageId,
    } = req.body;

    const cleanedSpecializations =
      normalizeSpecialization(specialization);

    if (
      !fullName?.trim() ||
      !email?.trim() ||
      !contactNumber?.trim() ||
      !nic?.trim() ||
      experience === "" ||
      experience === null ||
      experience === undefined ||
      !garageId ||
      cleanedSpecializations.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please fill in all required fields.",
      });
    }

    const trimmedFullName = fullName.trim();
    const trimmedEmail = email.trim();

    const trimmedContactNumber =
      contactNumber.trim();

    const trimmedNic = nic
      .trim()
      .toUpperCase();

    const numericGarageId = Number(garageId);
    const numericExperience = Number(experience);

    if (
      !Number.isInteger(numericGarageId) ||
      numericGarageId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid garage ID is required.",
      });
    }

    if (
      !Number.isInteger(numericExperience) ||
      numericExperience < 0 ||
      numericExperience > 60
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Experience must be a whole number between 0 and 60.",
      });
    }

    const fullNameRegex =
      /^[A-Za-z][A-Za-z\s.'-]{1,79}$/;

    const emailRegex =
      /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

    const contactRegex = /^0\d{9}$/;

    const nicRegex =
      /^(\d{9}[VX]|\d{12})$/;

    if (!fullNameRegex.test(trimmedFullName)) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a valid full name.",
      });
    }

    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a valid email address.",
      });
    }

    if (
      !contactRegex.test(trimmedContactNumber)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Contact number must contain exactly 10 digits and start with 0.",
      });
    }

    if (!nicRegex.test(trimmedNic)) {
      return res.status(400).json({
        success: false,
        message:
          "NIC must contain 9 digits followed by V/X or exactly 12 digits.",
      });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    // ==========================================
    // Check whether garage exists
    // ==========================================

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

    // ==========================================
    // Check duplicate technician details
    // ==========================================

    const [duplicateRows] =
      await connection.query(
        `
        SELECT
          technician_id,
          email,
          contact_number,
          nic
        FROM technician
        WHERE email = ?
           OR contact_number = ?
           OR nic = ?
        LIMIT 1
        `,
        [
          trimmedEmail,
          trimmedContactNumber,
          trimmedNic,
        ]
      );

    if (duplicateRows.length > 0) {
      await connection.rollback();

      const duplicate = duplicateRows[0];

      let duplicateField = "details";

      if (
        String(duplicate.email).toLowerCase() ===
        trimmedEmail.toLowerCase()
      ) {
        duplicateField = "email address";
      } else if (
        String(duplicate.contact_number) ===
        trimmedContactNumber
      ) {
        duplicateField = "contact number";
      } else if (
        String(duplicate.nic).toUpperCase() ===
        trimmedNic
      ) {
        duplicateField = "NIC number";
      }

      return res.status(409).json({
        success: false,
        message: `A technician already exists with this ${duplicateField}.`,
      });
    }

    const temporaryPassword =
      "Temp@" +
      Math.floor(
        100000 +
          Math.random() * 900000
      );

    const role = "technician";

    const temporaryUsername =
      `pending_tech_${Date.now()}_${Math.floor(
        Math.random() * 100000
      )}`;

    // ==========================================
    // Create login account temporarily
    // ==========================================

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
          temporaryUsername,
          temporaryPassword,
          role,
        ]
      );

    const loginId = loginResult.insertId;

    const specializationText =
      cleanedSpecializations.join(", ");

    // ==========================================
    // Insert technician
    // ==========================================

    const [technicianResult] =
      await connection.query(
        `
        INSERT INTO technician (
          full_name,
          contact_number,
          email,
          nic,
          experience_years,
          specialization,
          shift_status,
          availability_status,
          profile_photo,
          role,
          login_login_id,
          garage_garage_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          trimmedFullName,
          trimmedContactNumber,
          trimmedEmail,
          trimmedNic,
          numericExperience,
          specializationText,
          "OFF",
          "AVAILABLE",
          null,
          role,
          loginId,
          numericGarageId,
        ]
      );

    const technicianId =
      technicianResult.insertId;

    const username = trimmedNic;

    // ==========================================
    // Replace temporary username
    // ==========================================

    await connection.query(
      `
      UPDATE login
      SET user_name = ?
      WHERE login_id = ?
      `,
      [username, loginId]
    );

    await connection.commit();

    console.log(
      "Technician registered successfully:",
      technicianId
    );

    return res.status(201).json({
      success: true,
      message:
        "Technician registered successfully.",

      technician: {
        technicianId,
        fullName: trimmedFullName,
        email: trimmedEmail,
        contactNumber:
          trimmedContactNumber,
        nic: trimmedNic,
        specialization:
          cleanedSpecializations,
        experience: numericExperience,
        garageId: numericGarageId,
        shiftStatus: "OFF",
        availabilityStatus: "AVAILABLE",
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
          "Technician registration rollback failed:",
          rollbackError
        );
      }
    }

    console.error(
      "========== REGISTER TECHNICIAN ERROR =========="
    );

    console.error("Code:", error.code);
    console.error("Message:", error.message);

    console.error(
      "SQL Message:",
      error.sqlMessage
    );

    console.error("SQL:", error.sql);

    console.error(
      "================================================"
    );

    if (error.code === "ER_DUP_ENTRY") {
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
          "The technician could not be linked to the selected garage.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        error.sqlMessage ||
        "Unable to register technician.",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// ======================================================
// GET ALL TECHNICIANS
// GET /api/technicians?garageId=1
// ======================================================

const getAllTechnicians = async (req, res) => {
  try {
    const garageId = Number(
      req.query.garageId
    );

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
        technician_id,
        full_name,
        contact_number,
        email,
        nic,
        experience_years,
        specialization,
        shift_status,
        availability_status,
        profile_photo,
        role,
        garage_garage_id
      FROM technician
      WHERE garage_garage_id = ?
      ORDER BY full_name ASC
      `,
      [garageId]
    );

    const technicians =
      rows.map(formatTechnician);

    return res.status(200).json({
      success: true,
      technicians,
    });
  } catch (error) {
    console.error(
      "========== GET TECHNICIANS ERROR =========="
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
        "Unable to fetch technicians.",
    });
  }
};

// ======================================================
// GET SINGLE TECHNICIAN
// ======================================================

const getTechnicianById = async (
  req,
  res
) => {
  try {
    const technicianId = Number(
      req.params.id
    );

    if (
      !Number.isInteger(technicianId) ||
      technicianId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid technician ID is required.",
      });
    }

    const [rows] = await db.query(
      `
      SELECT
        technician_id,
        full_name,
        contact_number,
        email,
        nic,
        experience_years,
        specialization,
        shift_status,
        availability_status,
        profile_photo,
        role,
        garage_garage_id
      FROM technician
      WHERE technician_id = ?
      LIMIT 1
      `,
      [technicianId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Technician not found.",
      });
    }

    return res.status(200).json({
      success: true,
      technician:
        formatTechnician(
          rows[0]
        ),
    });
  } catch (error) {
    console.error(
      "========== GET TECHNICIAN ERROR =========="
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
        "Unable to fetch technician details.",
    });
  }
};

// ======================================================
// UPDATE TECHNICIAN
// ======================================================

const updateTechnician = async (req, res) => {
  try {
    const technicianId = Number(
      req.params.id
    );

    const {
      fullName,
      email,
      contactNumber,
      nic,
      specialization,
      experience,
    } = req.body;

    const cleanedSpecializations =
      normalizeSpecialization(
        specialization
      );

    if (
      !Number.isInteger(technicianId) ||
      technicianId <= 0 ||
      !fullName?.trim() ||
      !email?.trim() ||
      !contactNumber?.trim() ||
      !nic?.trim() ||
      experience === "" ||
      experience === null ||
      experience === undefined ||
      cleanedSpecializations.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please fill in all required fields.",
      });
    }

    const trimmedFullName =
      fullName.trim();

    const trimmedEmail =
      email.trim();

    const trimmedContactNumber =
      contactNumber.trim();

    const trimmedNic = nic
      .trim()
      .toUpperCase();

    const numericExperience =
      Number(experience);

    if (
      !Number.isInteger(numericExperience) ||
      numericExperience < 0 ||
      numericExperience > 60
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Experience must be a whole number between 0 and 60.",
      });
    }

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
        trimmedFullName
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a valid full name.",
      });
    }

    if (
      !emailRegex.test(
        trimmedEmail
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a valid email address.",
      });
    }

    if (
      !contactRegex.test(
        trimmedContactNumber
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Contact number must contain exactly 10 digits and start with 0.",
      });
    }

    if (
      !nicRegex.test(
        trimmedNic
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "NIC must contain 9 digits followed by V/X or exactly 12 digits.",
      });
    }

    // ==========================================
    // Check technician exists
    // ==========================================

    const [existingRows] =
      await db.query(
        `
        SELECT technician_id
        FROM technician
        WHERE technician_id = ?
        LIMIT 1
        `,
        [technicianId]
      );

    if (
      existingRows.length === 0
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Technician not found.",
      });
    }

    // ==========================================
    // Check duplicate details
    // ==========================================

    const [duplicateRows] =
      await db.query(
        `
        SELECT technician_id
        FROM technician
        WHERE technician_id <> ?
          AND (
            email = ?
            OR contact_number = ?
            OR nic = ?
          )
        LIMIT 1
        `,
        [
          technicianId,
          trimmedEmail,
          trimmedContactNumber,
          trimmedNic,
        ]
      );

    if (
      duplicateRows.length > 0
    ) {
      return res.status(409).json({
        success: false,
        message:
          "This email, contact number or NIC is already used by another technician.",
      });
    }

    const specializationText =
      cleanedSpecializations.join(
        ", "
      );

    await db.query(
      `
      UPDATE technician
      SET
        full_name = ?,
        contact_number = ?,
        email = ?,
        nic = ?,
        experience_years = ?,
        specialization = ?
      WHERE technician_id = ?
      `,
      [
        trimmedFullName,
        trimmedContactNumber,
        trimmedEmail,
        trimmedNic,
        numericExperience,
        specializationText,
        technicianId,
      ]
    );

    return res.status(200).json({
      success: true,
      message:
        "Technician details updated successfully.",

      technician: {
        technicianId,
        fullName:
          trimmedFullName,
        email:
          trimmedEmail,
        contactNumber:
          trimmedContactNumber,
        nic:
          trimmedNic,
        specialization:
          cleanedSpecializations,
        experience:
          numericExperience,
      },
    });
  } catch (error) {
    console.error(
      "========== UPDATE TECHNICIAN ERROR =========="
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

    if (
      error.code ===
      "ER_DUP_ENTRY"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "This email, contact number or NIC is already used by another technician.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        error.sqlMessage ||
        "Unable to update technician.",
    });
  }
};

// ======================================================
// UPDATE TECHNICIAN SHIFT STATUS
// ======================================================

const updateTechnicianShiftStatus = async (
  req,
  res
) => {
  try {
    const technicianId =
      Number(
        req.params.id
      );

    const shiftStatus =
      String(
        req.body.shiftStatus ||
          ""
      )
        .trim()
        .toUpperCase();

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

    if (
      ![
        "ON",
        "OFF",
      ].includes(
        shiftStatus
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Shift status must be either ON or OFF.",
      });
    }

    const [technicianRows] =
      await db.query(
        `
        SELECT
          technician_id,
          shift_status
        FROM technician
        WHERE technician_id = ?
        LIMIT 1
        `,
        [technicianId]
      );

    if (
      technicianRows.length ===
      0
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Technician not found.",
      });
    }

    await db.query(
      `
      UPDATE technician
      SET shift_status = ?
      WHERE technician_id = ?
      `,
      [
        shiftStatus,
        technicianId,
      ]
    );

    return res.status(200).json({
      success: true,

      message:
        `Technician shift turned ${shiftStatus} successfully.`,

      technician: {
        technicianId,
        shiftStatus,
      },
    });
  } catch (error) {
    console.error(
      "========== UPDATE SHIFT STATUS ERROR =========="
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
        "Unable to update technician shift status.",
    });
  }
};

// ======================================================
// CHANGE TECHNICIAN PASSWORD
// ======================================================

const changeTechnicianPassword = async (req, res) => {
  try {
    const technicianId = Number(req.params.id);

    const {
      currentPassword,
      newPassword,
    } = req.body;

    if (
      !Number.isInteger(technicianId) ||
      technicianId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid technician ID is required.",
      });
    }

    if (
      !String(currentPassword || "").trim() ||
      !String(newPassword || "").trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Current password and new password are required.",
      });
    }

    const cleanedCurrentPassword =
      String(currentPassword);

    const cleanedNewPassword =
      String(newPassword);

    if (cleanedNewPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "New password must contain at least 6 characters.",
      });
    }

    if (
      cleanedCurrentPassword ===
      cleanedNewPassword
    ) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be different from the current password.",
      });
    }

    const [rows] = await db.query(
      `
        SELECT
          t.technician_id,
          t.login_login_id,
          l.password
        FROM technician t
        INNER JOIN login l
          ON l.login_id = t.login_login_id
        WHERE t.technician_id = ?
        LIMIT 1
      `,
      [technicianId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Technician login account was not found.",
      });
    }

    const loginAccount = rows[0];

    if (
      String(loginAccount.password) !==
      cleanedCurrentPassword
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Current password is incorrect.",
      });
    }

    await db.query(
      `
        UPDATE login
        SET password = ?
        WHERE login_id = ?
      `,
      [
        cleanedNewPassword,
        loginAccount.login_login_id,
      ]
    );

    return res.status(200).json({
      success: true,
      message:
        "Password changed successfully.",
    });
  } catch (error) {
    console.error(
      "========== CHANGE TECHNICIAN PASSWORD ERROR =========="
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
      "======================================================"
    );

    return res.status(500).json({
      success: false,
      message:
        error.sqlMessage ||
        "Unable to change technician password.",
    });
  }
};

// ======================================================
// EXPORT CONTROLLER FUNCTIONS
// ======================================================

module.exports = {
  getNextTechnicianId,
  registerTechnician,
  getAllTechnicians,
  getTechnicianById,
  updateTechnician,
  updateTechnicianShiftStatus,
  changeTechnicianPassword,
};