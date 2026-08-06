const db = require("../config/db");
const fs = require("fs");
const path = require("path");

// ======================================================
// HELPER FUNCTIONS
// ======================================================

const formatAssistanceId = (assistanceId) =>
  `ASSIST-${String(assistanceId).padStart(4, "0")}`;

const formatAssistance = (assistance) => ({
  assistanceId: assistance.assistance_id,

  formattedAssistanceId:
    formatAssistanceId(
      assistance.assistance_id
    ),

  fullName:
    assistance.full_name,

  email:
    assistance.email,

  contactNumber:
    assistance.contact_number,

  nic:
    assistance.nic,

  profilePhoto:
    assistance.profile_photo || null,

  shiftStatus:
    assistance.shift_status,

  role:
    assistance.role,

  loginId:
    assistance.login_login_id || null,

  garageId:
    assistance.garage_garage_id,
});

// ======================================================
// GENERATE TEMP PASSWORD
// ======================================================

const generateTemporaryPassword = () => {
  const randomNumber =
    Math.floor(
      100000 +
        Math.random() * 900000
    );

  return `Assist@${randomNumber}`;
};

// ======================================================
// REGISTER ASSISTANCE OFFICER
//
// POST /api/assistances
// ======================================================

const registerAssistance = async (
  req,
  res
) => {
  let connection;

  try {
    const {
      fullName,
      email,
      contactNumber,
      nic,
      garageId,
    } = req.body;

    // ==================================================
    // REQUIRED FIELDS
    // ==================================================

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
      email
        .trim()
        .toLowerCase();

    const cleanContactNumber =
      contactNumber.trim();

    const cleanNic =
      nic
        .trim()
        .toUpperCase();

    const numericGarageId =
      Number(garageId);

    // ==================================================
    // VALIDATION
    // ==================================================

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
      return res.status(400).json({
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
      return res.status(400).json({
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
      return res.status(400).json({
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
      return res.status(400).json({
        success: false,

        message:
          "NIC must contain 9 digits followed by V/X or exactly 12 digits.",
      });
    }

    if (
      !Number.isInteger(
        numericGarageId
      ) ||
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
    // CHECK GARAGE
    // ==================================================

    const [garageRows] =
      await connection.query(
        `
        SELECT
          garage_id

        FROM garage

        WHERE garage_id = ?

        LIMIT 1
        `,
        [numericGarageId]
      );

    if (
      garageRows.length === 0
    ) {
      await connection.rollback();

      return res.status(404).json({
        success: false,

        message:
          "The selected garage does not exist.",
      });
    }

    // ==================================================
    // CHECK DUPLICATE ASSISTANCE
    // ==================================================

    const [duplicateRows] =
      await connection.query(
        `
        SELECT
          assistance_id,
          email,
          contact_number,
          nic

        FROM assistance

        WHERE
          email = ?
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

      return res.status(409).json({
        success: false,

        message:
          `An assistance officer already exists with this ${duplicateField}.`,
      });
    }

    // ==================================================
    // CHECK LOGIN USERNAME
    // ==================================================

    const [existingLoginRows] =
      await connection.query(
        `
        SELECT
          login_id

        FROM login

        WHERE user_name = ?

        LIMIT 1
        `,
        [cleanNic]
      );

    if (
      existingLoginRows.length >
      0
    ) {
      await connection.rollback();

      return res.status(409).json({
        success: false,

        message:
          "This NIC number is already used as a system username.",
      });
    }

    // ==================================================
    // CREATE LOGIN
    // ==================================================

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

    // ==================================================
    // CREATE ASSISTANCE OFFICER
    // ==================================================

    const [assistanceResult] =
      await connection.query(
        `
        INSERT INTO assistance (
          full_name,
          email,
          contact_number,
          nic,
          profile_photo,
          shift_status,
          role,
          login_login_id,
          garage_garage_id
        )
        VALUES (
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?
        )
        `,
        [
          cleanFullName,
          cleanEmail,
          cleanContactNumber,
          cleanNic,
          null,
          "OFF",
          role,
          loginId,
          numericGarageId,
        ]
      );

    const assistanceId =
      assistanceResult.insertId;

    await connection.commit();

    // ==================================================
    // SUCCESS
    // ==================================================

    return res.status(201).json({
      success: true,

      message:
        "Assistance officer registered successfully.",

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

        profilePhoto:
          null,

        shiftStatus:
          "OFF",

        role,

        loginId,

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
        error.message ||
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
//
// GET /api/assistances
// GET /api/assistances?garageId=1
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
        profile_photo,
        shift_status,
        role,
        login_login_id,
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
        return res.status(400).json({
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

    return res.status(200).json({
      success: true,

      assistances:
        rows.map(
          formatAssistance
        ),
    });
  } catch (error) {
    console.error(
      "========== GET ASSISTANCES ERROR =========="
    );

    console.error(
      "Message:",
      error.message
    );

    console.error(
      "SQL Message:",
      error.sqlMessage
    );

    return res.status(500).json({
      success: false,

      message:
        error.sqlMessage ||
        "Unable to fetch assistance officers.",
    });
  }
};

// ======================================================
// GET SINGLE ASSISTANCE OFFICER
//
// GET /api/assistances/:id
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
      return res.status(400).json({
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
          profile_photo,
          shift_status,
          role,
          login_login_id,
          garage_garage_id

        FROM assistance

        WHERE assistance_id = ?

        LIMIT 1
        `,
        [assistanceId]
      );

    if (
      rows.length === 0
    ) {
      return res.status(404).json({
        success: false,

        message:
          "Assistance officer not found.",
      });
    }

    return res.status(200).json({
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
      "Message:",
      error.message
    );

    console.error(
      "SQL Message:",
      error.sqlMessage
    );

    return res.status(500).json({
      success: false,

      message:
        error.sqlMessage ||
        "Unable to fetch assistance officer details.",
    });
  }
};

// ======================================================
// GET LOGGED-IN ASSISTANCE PROFILE
//
// GET /api/assistances/profile/:loginId
// ======================================================

const getAssistanceProfileByLoginId =
  async (req, res) => {
    try {
      const loginId =
        Number(
          req.params.loginId
        );

      if (
        !Number.isInteger(
          loginId
        ) ||
        loginId <= 0
      ) {
        return res.status(400).json({
          success: false,

          message:
            "A valid login ID is required.",
        });
      }

      const [rows] =
        await db.query(
          `
          SELECT
            a.assistance_id,
            a.full_name,
            a.email,
            a.contact_number,
            a.nic,
            a.profile_photo,
            a.shift_status,
            a.role,
            a.login_login_id,
            a.garage_garage_id,

            g.garage_id,
            g.garage_name

          FROM assistance a

          INNER JOIN garage g
            ON g.garage_id =
               a.garage_garage_id

          WHERE
            a.login_login_id = ?

          LIMIT 1
          `,
          [loginId]
        );

      if (
        rows.length === 0
      ) {
        return res.status(404).json({
          success: false,

          message:
            "Assistance officer profile was not found.",
        });
      }

      const assistance =
        rows[0];

      return res.status(200).json({
        success: true,

        message:
          "Assistance officer profile loaded successfully.",

        assistance: {
          assistanceId:
            assistance.assistance_id,

          formattedAssistanceId:
            formatAssistanceId(
              assistance.assistance_id
            ),

          fullName:
            assistance.full_name,

          email:
            assistance.email,

          contactNumber:
            assistance.contact_number,

          nic:
            assistance.nic,

          profilePhoto:
            assistance.profile_photo ||
            null,

          shiftStatus:
            assistance.shift_status,

          role:
            assistance.role,

          loginId:
            assistance.login_login_id,

          garageId:
            assistance.garage_garage_id,

          garageName:
            assistance.garage_name ||
            "",
        },
      });
    } catch (error) {
      console.error(
        "========== ASSISTANCE PROFILE ERROR =========="
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
        "=============================================="
      );

      return res.status(500).json({
        success: false,

        message:
          error.sqlMessage ||
          error.message ||
          "Unable to load the assistance officer profile.",
      });
    }
  };

// ======================================================
// UPDATE ASSISTANCE OFFICER
//
// PUT /api/assistances/:id
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

    // ==================================================
    // VALIDATE
    // ==================================================

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
      return res.status(400).json({
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
      return res.status(400).json({
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
      return res.status(400).json({
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
      return res.status(400).json({
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
      return res.status(400).json({
        success: false,

        message:
          "NIC must contain 9 digits followed by V/X or exactly 12 digits.",
      });
    }

    // ==================================================
    // TRANSACTION
    // ==================================================

    connection =
      await db.getConnection();

    await connection.beginTransaction();

    // ==================================================
    // EXISTING ASSISTANCE
    // ==================================================

    const [existingRows] =
      await connection.query(
        `
        SELECT
          assistance_id,
          login_login_id,
          garage_garage_id,
          profile_photo,
          shift_status,
          role

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

      return res.status(404).json({
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

    // ==================================================
    // DUPLICATE ASSISTANCE DETAILS
    // ==================================================

    const [duplicateRows] =
      await connection.query(
        `
        SELECT
          assistance_id,
          email,
          contact_number,
          nic

        FROM assistance

        WHERE
          assistance_id <> ?

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

      return res.status(409).json({
        success: false,

        message:
          `Another assistance officer already uses this ${duplicateField}.`,
      });
    }

    // ==================================================
    // DUPLICATE LOGIN USERNAME
    // ==================================================

    const [duplicateLoginRows] =
      await connection.query(
        `
        SELECT
          login_id

        FROM login

        WHERE
          user_name = ?
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

      return res.status(409).json({
        success: false,

        message:
          "This NIC number is already used as another system username.",
      });
    }

    // ==================================================
    // UPDATE ASSISTANCE
    // ==================================================

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

    // ==================================================
    // UPDATE LOGIN USERNAME
    // ==================================================

    await connection.query(
      `
      UPDATE login

      SET
        user_name = ?

      WHERE
        login_id = ?
      `,
      [
        cleanNic,
        loginId,
      ]
    );

    await connection.commit();

    // ==================================================
    // SUCCESS
    // ==================================================

    return res.status(200).json({
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

        profilePhoto:
          existingAssistance
            .profile_photo ||
          null,

        shiftStatus:
          existingAssistance
            .shift_status,

        role:
          existingAssistance.role,

        loginId,

        garageId:
          existingAssistance
            .garage_garage_id,
      },
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
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
      return res.status(409).json({
        success: false,

        message:
          "This username, email, contact number or NIC is already used.",
      });
    }

    return res.status(500).json({
      success: false,

      message:
        error.sqlMessage ||
        error.message ||
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
//
// PUT /api/assistances/:id/shift
// ======================================================

const updateAssistanceShiftStatus =
  async (req, res) => {
    try {
      const assistanceId =
        Number(req.params.id);

      const normalizedShiftStatus =
        String(
          req.body
            ?.shiftStatus || ""
        )
          .trim()
          .toUpperCase();

      // ==================================================
      // VALIDATE
      // ==================================================

      if (
        !Number.isInteger(
          assistanceId
        ) ||
        assistanceId <= 0
      ) {
        return res.status(400).json({
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
        return res.status(400).json({
          success: false,

          message:
            "Shift status must be ON or OFF.",
        });
      }

      // ==================================================
      // GET ASSISTANCE
      // ==================================================

      const [existingRows] =
        await db.query(
          `
          SELECT
            assistance_id,
            full_name,
            email,
            contact_number,
            nic,
            profile_photo,
            shift_status,
            role,
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
        return res.status(404).json({
          success: false,

          message:
            "Assistance officer not found.",
        });
      }

      // ==================================================
      // UPDATE SHIFT
      // ==================================================

      await db.query(
        `
        UPDATE assistance

        SET
          shift_status = ?

        WHERE
          assistance_id = ?
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

      return res.status(200).json({
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

      return res.status(500).json({
        success: false,

        message:
          error.sqlMessage ||
          "Unable to update assistance shift status.",
      });
    }
  };

// ======================================================
// UPLOAD ASSISTANCE PROFILE PHOTO
//
// PUT /api/assistances/:id/photo
//
// multipart/form-data
// field name = profilePhoto
// ======================================================

const uploadAssistanceProfilePhoto =
  async (req, res) => {
    try {
      const assistanceId =
        Number(req.params.id);

      // ==================================================
      // VALIDATE ID
      // ==================================================

      if (
        !Number.isInteger(
          assistanceId
        ) ||
        assistanceId <= 0
      ) {
        if (
          req.file?.path &&
          fs.existsSync(
            req.file.path
          )
        ) {
          fs.unlinkSync(
            req.file.path
          );
        }

        return res.status(400).json({
          success: false,

          message:
            "A valid assistance ID is required.",
        });
      }

      // ==================================================
      // VALIDATE FILE
      // ==================================================

      if (!req.file) {
        return res.status(400).json({
          success: false,

          message:
            "Please select a profile photo.",
        });
      }

      // ==================================================
      // GET CURRENT ASSISTANCE
      // ==================================================

      const [rows] =
        await db.query(
          `
          SELECT
            assistance_id,
            profile_photo

          FROM assistance

          WHERE assistance_id = ?

          LIMIT 1
          `,
          [assistanceId]
        );

      if (
        rows.length === 0
      ) {
        if (
          req.file.path &&
          fs.existsSync(
            req.file.path
          )
        ) {
          fs.unlinkSync(
            req.file.path
          );
        }

        return res.status(404).json({
          success: false,

          message:
            "Assistance officer was not found.",
        });
      }

      const currentAssistance =
        rows[0];

      // ==================================================
      // PUBLIC PHOTO PATH
      // ==================================================

      const profilePhotoPath =
        `/uploads/assistance-profiles/${req.file.filename}`;

      // ==================================================
      // SAVE TO DATABASE
      // ==================================================

      await db.query(
        `
        UPDATE assistance

        SET
          profile_photo = ?

        WHERE
          assistance_id = ?
        `,
        [
          profilePhotoPath,
          assistanceId,
        ]
      );

      // ==================================================
      // DELETE OLD PHOTO
      // ==================================================

      const oldPhoto =
        currentAssistance
          .profile_photo;

      if (
        oldPhoto &&
        oldPhoto.startsWith(
          "/uploads/assistance-profiles/"
        )
      ) {
        const oldPhotoPath =
          path.join(
            __dirname,
            "..",
            oldPhoto.replace(
              /^\/+/,
              ""
            )
          );

        if (
          fs.existsSync(
            oldPhotoPath
          )
        ) {
          try {
            fs.unlinkSync(
              oldPhotoPath
            );
          } catch (deleteError) {
            console.warn(
              "Unable to delete old assistance profile photo:",
              deleteError.message
            );
          }
        }
      }

      // ==================================================
      // SUCCESS
      // ==================================================

      return res.status(200).json({
        success: true,

        message:
          "Profile photo uploaded successfully.",

        profilePhoto:
          profilePhotoPath,

        assistance: {
          assistanceId,

          profilePhoto:
            profilePhotoPath,
        },
      });
    } catch (error) {
      // ==================================================
      // REMOVE FAILED NEW FILE
      // ==================================================

      if (
        req.file?.path &&
        fs.existsSync(
          req.file.path
        )
      ) {
        try {
          fs.unlinkSync(
            req.file.path
          );
        } catch (deleteError) {
          console.warn(
            "Unable to remove failed assistance profile photo:",
            deleteError.message
          );
        }
      }

      console.error(
        "========== ASSISTANCE PHOTO UPLOAD ERROR =========="
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
          "Unable to upload the profile photo.",
      });
    }
  };

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  registerAssistance,
  getAllAssistances,
  getAssistanceById,
  getAssistanceProfileByLoginId,
  updateAssistance,
  updateAssistanceShiftStatus,
  uploadAssistanceProfilePhoto,
};