const db = require("../config/db");

// =======================================
// Register Garage
// =======================================
const registerGarage = async (req, res) => {
  console.log("REGISTER API HIT");
  console.log("Request body:", req.body);

  let connection;

  try {
    const { login, garage, garage_owner } = req.body;

    if (!login || !garage || !garage_owner) {
      return res.status(400).json({
        success: false,
        message: "Required registration data is missing.",
      });
    }

    if (
      !login.password ||
      !garage.garage_name?.trim() ||
      !garage.contact_number?.trim() ||
      !garage.address?.trim() ||
      !garage.district?.trim() ||
      garage.latitude === undefined ||
      garage.latitude === null ||
      garage.latitude === "" ||
      garage.longitude === undefined ||
      garage.longitude === null ||
      garage.longitude === "" ||
      !garage.capacity ||
      !garage.opening_time ||
      !garage.closing_time ||
      !garage.working_days ||
      !garage.shift_type ||
      !garage_owner.full_name?.trim() ||
      !garage_owner.email?.trim() ||
      !garage_owner.contact_number?.trim() ||
      !garage_owner.joined_date ||
      !garage_owner.nic?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Please complete all required fields.",
      });
    }

    const password = login.password;

    const garageName = garage.garage_name.trim();
    const garageContact = garage.contact_number.trim();
    const garageAddress = garage.address.trim();
    const district = garage.district.trim();

    const ownerName = garage_owner.full_name.trim();
    const ownerEmail = garage_owner.email.trim().toLowerCase();
    const ownerContact = garage_owner.contact_number.trim();
    const ownerNic = garage_owner.nic.trim().toUpperCase();

    // Garage Owner email is used automatically as the login username.
    const username = ownerEmail;

    const latitude = Number(garage.latitude);
    const longitude = Number(garage.longitude);
    const capacity = Number(garage.capacity);

    if (
      !Number.isFinite(latitude) ||
      latitude < -90 ||
      latitude > 90
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid garage latitude.",
      });
    }

    if (
      !Number.isFinite(longitude) ||
      longitude < -180 ||
      longitude > 180
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid garage longitude.",
      });
    }

    if (!Number.isInteger(capacity) || capacity < 1) {
      return res.status(400).json({
        success: false,
        message: "Garage capacity must be at least 1.",
      });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    // =======================================
    // Check duplicate username
    // =======================================
    const [existingUsers] = await connection.query(
      `
      SELECT login_id
      FROM login
      WHERE user_name = ?
      LIMIT 1
      `,
      [username]
    );

    if (existingUsers.length > 0) {
      await connection.rollback();

      return res.status(409).json({
        success: false,
        message:
          "This email address is already used as a login username.",
      });
    }

    // =======================================
    // Check duplicate NIC or email
    // =======================================
    const [existingOwners] = await connection.query(
      `
      SELECT garage_owner_id
      FROM garage_owner
      WHERE nic = ? OR email = ?
      LIMIT 1
      `,
      [ownerNic, ownerEmail]
    );

    if (existingOwners.length > 0) {
      await connection.rollback();

      return res.status(409).json({
        success: false,
        message:
          "An owner with this NIC or email already exists.",
      });
    }

    // =======================================
    // Insert Login
    // =======================================
    const [loginResult] = await connection.query(
      `
      INSERT INTO login
      (
        user_name,
        password
      )
      VALUES (?, ?)
      `,
      [username, password]
    );

    const loginId = loginResult.insertId;

    // =======================================
    // Get the next garage AUTO_INCREMENT ID
    // and create a code such as GAR-001
    // =======================================
    const [autoIncrementRows] = await connection.query(
      `
      SELECT AUTO_INCREMENT
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'garage'
      LIMIT 1
      `
    );

    if (
      autoIncrementRows.length === 0 ||
      !autoIncrementRows[0].AUTO_INCREMENT
    ) {
      throw new Error(
        "Unable to generate the next garage code."
      );
    }

    const expectedGarageId = Number(
      autoIncrementRows[0].AUTO_INCREMENT
    );

    const garageCode = `GAR-${String(
      expectedGarageId
    ).padStart(3, "0")}`;

    // =======================================
    // Insert Garage
    // =======================================
    const [garageResult] = await connection.query(
      `
      INSERT INTO garage
      (
        garage_code,
        garage_name,
        contact_number,
        address,
        latitude,
        longitude,
        capacity,
        opening_time,
        closing_time,
        shift_type,
        district,
        working_days
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        garageCode,
        garageName,
        garageContact,
        garageAddress,
        latitude,
        longitude,
        capacity,
        garage.opening_time,
        garage.closing_time,
        garage.shift_type,
        district,
        garage.working_days,
      ]
    );

    const garageId = garageResult.insertId;

    // Safety check
    if (garageId !== expectedGarageId) {
      throw new Error(
        `Generated garage code does not match the inserted garage ID. Expected ${expectedGarageId}, received ${garageId}.`
      );
    }

    // =======================================
    // Insert Garage Owner
    // =======================================
    const [ownerResult] = await connection.query(
      `
      INSERT INTO garage_owner
      (
        full_name,
        email,
        contact_number,
        joined_date,
        login_login_id,
        nic,
        garage_garage_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        ownerName,
        ownerEmail,
        ownerContact,
        garage_owner.joined_date,
        loginId,
        ownerNic,
        garageId,
      ]
    );

    await connection.commit();

    console.log("Garage registered successfully:", {
      garageId,
      garageCode,
      loginId,
      garageOwnerId: ownerResult.insertId,
    });

    return res.status(201).json({
      success: true,
      message: "Garage registered successfully.",
      data: {
        garage_id: garageId,
        garage_code: garageCode,
        garage_owner_id: ownerResult.insertId,
        login_id: loginId,
        username,
      },
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error(
          "Rollback error:",
          rollbackError
        );
      }
    }

    console.error(
      "========== GARAGE REGISTRATION ERROR =========="
    );
    console.error("Code:", error.code);
    console.error("Message:", error.message);
    console.error(
      "SQL Message:",
      error.sqlMessage
    );
    console.error("SQL State:", error.sqlState);
    console.error("SQL:", error.sql);
    console.error(
      "==============================================="
    );

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message:
          "Garage code, username, NIC, email, or another unique value already exists.",
        error: error.sqlMessage || error.message,
      });
    }

    if (error.code === "ER_BAD_FIELD_ERROR") {
      return res.status(500).json({
        success: false,
        message:
          "A database column name does not match the backend controller.",
        error: error.sqlMessage || error.message,
      });
    }

    if (
      error.code === "ER_NO_DEFAULT_FOR_FIELD"
    ) {
      return res.status(500).json({
        success: false,
        message:
          "A required database field is missing from the registration query.",
        error: error.sqlMessage || error.message,
      });
    }

    if (
      error.code === "ER_NO_REFERENCED_ROW_2" ||
      error.code === "ER_ROW_IS_REFERENCED_2"
    ) {
      return res.status(500).json({
        success: false,
        message:
          "A database relationship could not be created correctly.",
        error: error.sqlMessage || error.message,
      });
    }

    if (error.code === "ER_DATA_TOO_LONG") {
      return res.status(400).json({
        success: false,
        message:
          "One of the entered values is too long for the database field.",
        error: error.sqlMessage || error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message:
        error.sqlMessage ||
        error.message ||
        "Garage registration failed.",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// =======================================
// Get All Garages
// =======================================
const getAllGarages = async (req, res) => {
  try {
    const [garages] = await db.query(`
      SELECT
        g.garage_id,
        g.garage_code,
        g.garage_name,
        g.contact_number,
        g.address,
        g.latitude,
        g.longitude,
        g.capacity,
        g.opening_time,
        g.closing_time,
        g.shift_type,
        g.district,
        g.working_days,

        COUNT(
          CASE
            WHEN sr.request_status IN (
              'Accepted',
              'In Progress'
            )
            THEN sr.request_id
          END
        ) AS current_capacity

      FROM garage g

      LEFT JOIN service_request sr
        ON sr.garage_garage_id =
           g.garage_id

      GROUP BY
        g.garage_id,
        g.garage_code,
        g.garage_name,
        g.contact_number,
        g.address,
        g.latitude,
        g.longitude,
        g.capacity,
        g.opening_time,
        g.closing_time,
        g.shift_type,
        g.district,
        g.working_days

      ORDER BY g.garage_id ASC
    `);

    return res.status(200).json({
      success: true,
      data: garages,
    });
  } catch (error) {
    console.error(
      "Get garages error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load garages.",
      error:
        error.sqlMessage ||
        error.message,
    });
  }
};

module.exports = {
  registerGarage,
  getAllGarages,
};