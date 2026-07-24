const db = require("../config/db");

// ======================================================
// HELPER FUNCTIONS
// ======================================================

const formatTruckId = (truckId) =>
  `TRUCK-${String(truckId).padStart(4, "0")}`;

const formatDriverId = (driverId) =>
  `DRV-${String(driverId).padStart(4, "0")}`;

const formatDateValue = (dateValue) => {
  if (!dateValue) {
    return "";
  }

  if (typeof dateValue === "string") {
    return dateValue.slice(0, 10);
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
};

const formatTruckRegistration = (row) => ({
  truckId: row.truck_id,
  formattedTruckId: formatTruckId(row.truck_id),

  plateNumber: row.truck_number,
  truckNumber: row.truck_number,
  truckType: row.truck_type,
  capacity: Number(row.capacity_tons),
  truckModel: row.truck_model,

  registrationDate: formatDateValue(
    row.registration_date
  ),

  latitude: Number(row.latitude),
  longitude: Number(row.longitude),
  truckStatus: row.truck_status,
  garageId: row.garage_garage_id,

  driverId: row.driver_id,
  formattedDriverId: row.driver_id
    ? formatDriverId(row.driver_id)
    : "",

  driverName: row.driver_full_name || "",
  driverNic: row.driver_nic || "",
  driverEmail: row.driver_email || "",
  driverContact: row.driver_contact_number || "",
  licenseNumber: row.license_number || "",

  licenseExpireDate: formatDateValue(
    row.license_expire_date
  ),

  driverStatus: row.driver_status || "",
  driverExperience:
    row.experience_years !== null &&
    row.experience_years !== undefined
      ? Number(row.experience_years)
      : "",
});

const getTodayDate = () =>
  new Date().toISOString().slice(0, 10);

// ======================================================
// VALIDATION HELPERS
// ======================================================

const validateTruckAndDriverData = (data) => {
  const {
    plateNumber,
    truckModel,
    truckType,
    capacity,
    driverName,
    driverEmail,
    driverContact,
    driverNic,
    licenseNumber,
    licenseExpireDate,
    driverExperience,
    garageId,
  } = data;

  if (
    !plateNumber?.trim() ||
    !truckModel?.trim() ||
    !truckType?.trim() ||
    capacity === "" ||
    capacity === null ||
    capacity === undefined ||
    !driverName?.trim() ||
    !driverEmail?.trim() ||
    !driverContact?.trim() ||
    !driverNic?.trim() ||
    !licenseNumber?.trim() ||
    !licenseExpireDate ||
    driverExperience === "" ||
    driverExperience === null ||
    driverExperience === undefined ||
    garageId === "" ||
    garageId === null ||
    garageId === undefined
  ) {
    return {
      valid: false,
      status: 400,
      message:
        "Please fill in all required truck and driver fields.",
    };
  }

  const cleanPlateNumber = plateNumber
    .trim()
    .toUpperCase();

  const cleanTruckModel = truckModel.trim();
  const cleanTruckType = truckType.trim();

  const cleanDriverName = driverName.trim();

  const cleanDriverEmail = driverEmail
    .trim()
    .toLowerCase();

  const cleanDriverContact =
    driverContact.trim();

  const cleanDriverNic = driverNic
    .trim()
    .toUpperCase();

  const cleanLicenseNumber = licenseNumber
    .trim()
    .toUpperCase();

  const numericCapacity = Number(capacity);

  const numericDriverExperience = Number(
    driverExperience
  );

  const numericGarageId = Number(garageId);

  const validTruckTypes = [
    "Flatbed Tow Truck",
    "Wheel Lift Tow Truck",
    "Integrated Tow Truck",
    "Heavy Duty Tow Truck",
  ];

  const fullNameRegex =
    /^[\p{L}][\p{L}\s.'-]{1,99}$/u;

  const emailRegex =
    /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

  const contactRegex = /^0\d{9}$/;

  const nicRegex =
    /^(\d{9}[VX]|\d{12})$/;

  const plateNumberRegex =
    /^[A-Z]{1,3}[\s-]?[A-Z]{1,3}[\s-]?\d{1,4}$/;

  const licenseNumberRegex =
    /^[A-Z0-9/-]{4,50}$/;

  if (!plateNumberRegex.test(cleanPlateNumber)) {
    return {
      valid: false,
      status: 400,
      message:
        "Please enter a valid truck plate number.",
    };
  }

  if (
    cleanTruckModel.length < 2 ||
    cleanTruckModel.length > 50
  ) {
    return {
      valid: false,
      status: 400,
      message:
        "Truck model must contain between 2 and 50 characters.",
    };
  }

  if (!validTruckTypes.includes(cleanTruckType)) {
    return {
      valid: false,
      status: 400,
      message:
        "Please select a valid truck type.",
    };
  }

  if (
    !Number.isFinite(numericCapacity) ||
    numericCapacity <= 0 ||
    numericCapacity > 999.99
  ) {
    return {
      valid: false,
      status: 400,
      message:
        "Truck capacity must be greater than 0.",
    };
  }

  if (!fullNameRegex.test(cleanDriverName)) {
    return {
      valid: false,
      status: 400,
      message:
        "Please enter a valid driver full name.",
    };
  }

  if (!emailRegex.test(cleanDriverEmail)) {
    return {
      valid: false,
      status: 400,
      message:
        "Please enter a valid driver email address.",
    };
  }

  if (!contactRegex.test(cleanDriverContact)) {
    return {
      valid: false,
      status: 400,
      message:
        "Driver contact number must contain exactly 10 digits and start with 0.",
    };
  }

  if (!nicRegex.test(cleanDriverNic)) {
    return {
      valid: false,
      status: 400,
      message:
        "Driver NIC must contain 9 digits followed by V/X or exactly 12 digits.",
    };
  }

  if (
    !licenseNumberRegex.test(
      cleanLicenseNumber
    )
  ) {
    return {
      valid: false,
      status: 400,
      message:
        "Please enter a valid driving license number.",
    };
  }

  const expiryDate = new Date(
    `${licenseExpireDate}T00:00:00`
  );

  if (Number.isNaN(expiryDate.getTime())) {
    return {
      valid: false,
      status: 400,
      message:
        "Please enter a valid license expiry date.",
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (expiryDate < today) {
    return {
      valid: false,
      status: 400,
      message:
        "The driving license has already expired.",
    };
  }

  if (
    !Number.isInteger(
      numericDriverExperience
    ) ||
    numericDriverExperience < 0 ||
    numericDriverExperience > 60
  ) {
    return {
      valid: false,
      status: 400,
      message:
        "Driving experience must be a whole number between 0 and 60.",
    };
  }

  if (
    !Number.isInteger(numericGarageId) ||
    numericGarageId <= 0
  ) {
    return {
      valid: false,
      status: 400,
      message:
        "A valid garage ID is required.",
    };
  }

  return {
    valid: true,

    values: {
      cleanPlateNumber,
      cleanTruckModel,
      cleanTruckType,
      numericCapacity,

      cleanDriverName,
      cleanDriverEmail,
      cleanDriverContact,
      cleanDriverNic,
      cleanLicenseNumber,

      cleanLicenseExpireDate:
        licenseExpireDate,

      numericDriverExperience,
      numericGarageId,
    },
  };
};

// ======================================================
// REGISTER TOW TRUCK AND DRIVER
// ======================================================

const registerTruck = async (req, res) => {
  let connection;

  try {
    console.log(
      "========== REGISTER TRUCK API CALLED =========="
    );
    console.log("Request Body:", req.body);

    const validation =
      validateTruckAndDriverData(req.body);

    if (!validation.valid) {
      return res
        .status(validation.status)
        .json({
          success: false,
          message: validation.message,
        });
    }

    const {
      cleanPlateNumber,
      cleanTruckModel,
      cleanTruckType,
      numericCapacity,

      cleanDriverName,
      cleanDriverEmail,
      cleanDriverContact,
      cleanDriverNic,
      cleanLicenseNumber,
      cleanLicenseExpireDate,

      numericDriverExperience,
      numericGarageId,
    } = validation.values;

    connection = await db.getConnection();
    await connection.beginTransaction();

    // ==================================================
    // Check garage exists and obtain coordinates
    // ==================================================

    const [garageRows] =
      await connection.query(
        `
        SELECT
          garage_id,
          latitude,
          longitude
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

    const garage = garageRows[0];

    const latitude = Number(
      garage.latitude
    );

    const longitude = Number(
      garage.longitude
    );

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message:
          "The selected garage does not have valid coordinates.",
      });
    }

    // ==================================================
    // Check duplicate truck number
    // ==================================================

    const [duplicateTruckRows] =
      await connection.query(
        `
        SELECT
          truck_id,
          truck_number
        FROM tow_truck
        WHERE truck_number = ?
        LIMIT 1
        `,
        [cleanPlateNumber]
      );

    if (duplicateTruckRows.length > 0) {
      await connection.rollback();

      return res.status(409).json({
        success: false,
        message:
          "A tow truck with this plate number already exists.",
      });
    }

    // ==================================================
    // Check duplicate driver details
    // ==================================================

    const [duplicateDriverRows] =
      await connection.query(
        `
        SELECT
          driver_id,
          nic,
          email,
          contact_number,
          license_number
        FROM truck_driver
        WHERE nic = ?
           OR email = ?
           OR contact_number = ?
           OR license_number = ?
        LIMIT 1
        `,
        [
          cleanDriverNic,
          cleanDriverEmail,
          cleanDriverContact,
          cleanLicenseNumber,
        ]
      );

    if (duplicateDriverRows.length > 0) {
      await connection.rollback();

      const duplicate =
        duplicateDriverRows[0];

      let duplicateField =
        "driver details";

      if (
        String(duplicate.nic).toUpperCase() ===
        cleanDriverNic
      ) {
        duplicateField = "driver NIC";
      } else if (
        String(duplicate.email).toLowerCase() ===
        cleanDriverEmail
      ) {
        duplicateField = "driver email";
      } else if (
        String(duplicate.contact_number) ===
        cleanDriverContact
      ) {
        duplicateField =
          "driver contact number";
      } else if (
        String(
          duplicate.license_number
        ).toUpperCase() ===
        cleanLicenseNumber
      ) {
        duplicateField =
          "driving license number";
      }

      return res.status(409).json({
        success: false,
        message:
          `A driver already exists with this ${duplicateField}.`,
      });
    }

    const registrationDate =
      getTodayDate();

    const truckStatus = "Internal";
    const driverStatus = "Internal";

    // ==================================================
    // Insert tow truck
    // ==================================================

    const [truckResult] =
      await connection.query(
        `
        INSERT INTO tow_truck (
          truck_number,
          truck_type,
          capacity_tons,
          truck_model,
          registration_date,
          latitude,
          longitude,
          truck_status,
          garage_garage_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          cleanPlateNumber,
          cleanTruckType,
          numericCapacity,
          cleanTruckModel,
          registrationDate,
          latitude,
          longitude,
          truckStatus,
          numericGarageId,
        ]
      );

    const truckId = truckResult.insertId;

    // ==================================================
    // Insert truck driver
    // ==================================================

    const [driverResult] =
      await connection.query(
        `
        INSERT INTO truck_driver (
          full_name,
          nic,
          email,
          contact_number,
          license_number,
          license_expire_date,
          driver_status,
          experience_years,
          tow_truck_truck_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          cleanDriverName,
          cleanDriverNic,
          cleanDriverEmail,
          cleanDriverContact,
          cleanLicenseNumber,
          cleanLicenseExpireDate,
          driverStatus,
          numericDriverExperience,
          truckId,
        ]
      );

    const driverId =
      driverResult.insertId;

    await connection.commit();

    return res.status(201).json({
      success: true,
      message:
        "Tow truck and driver registered successfully.",

      truck: {
        truckId,
        formattedTruckId:
          formatTruckId(truckId),

        plateNumber: cleanPlateNumber,
        truckNumber: cleanPlateNumber,
        truckModel: cleanTruckModel,
        truckType: cleanTruckType,
        capacity: numericCapacity,

        registrationDate,
        latitude,
        longitude,
        truckStatus,
        garageId: numericGarageId,

        driverId,
        formattedDriverId:
          formatDriverId(driverId),

        driverName: cleanDriverName,
        driverNic: cleanDriverNic,
        driverEmail: cleanDriverEmail,
        driverContact:
          cleanDriverContact,
        licenseNumber:
          cleanLicenseNumber,
        licenseExpireDate:
          cleanLicenseExpireDate,
        driverStatus,
        driverExperience:
          numericDriverExperience,
      },
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error(
          "Truck registration rollback failed:",
          rollbackError
        );
      }
    }

    console.error(
      "========== REGISTER TRUCK ERROR =========="
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

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message:
          "Truck number, driver NIC, email, contact number or license number already exists.",
      });
    }

    if (
      error.code ===
      "ER_NO_REFERENCED_ROW_2"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "The truck or driver could not be linked correctly.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        error.sqlMessage ||
        "Unable to register tow truck and driver.",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// ======================================================
// GET ALL TOW TRUCKS
// ======================================================

const getAllTrucks = async (req, res) => {
  try {
    const requestedGarageId =
      req.query.garageId;

    let sql = `
      SELECT
        t.truck_id,
        t.truck_number,
        t.truck_type,
        t.capacity_tons,
        t.truck_model,
        t.registration_date,
        t.latitude,
        t.longitude,
        t.truck_status,
        t.garage_garage_id,

        d.driver_id,
        d.full_name AS driver_full_name,
        d.nic AS driver_nic,
        d.email AS driver_email,
        d.contact_number
          AS driver_contact_number,
        d.license_number,
        d.license_expire_date,
        d.driver_status,
        d.experience_years

      FROM tow_truck t

      LEFT JOIN truck_driver d
        ON d.tow_truck_truck_id =
           t.truck_id
    `;

    const values = [];

    if (
      requestedGarageId !== undefined &&
      requestedGarageId !== ""
    ) {
      const numericGarageId = Number(
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
        WHERE t.garage_garage_id = ?
      `;

      values.push(numericGarageId);
    }

    sql += `
      ORDER BY t.truck_id DESC
    `;

    const [rows] = await db.query(
      sql,
      values
    );

    const trucks =
      rows.map(formatTruckRegistration);

    return res.status(200).json({
      success: true,
      trucks,
    });
  } catch (error) {
    console.error(
      "========== GET TRUCKS ERROR =========="
    );
    console.error("Code:", error.code);
    console.error("Message:", error.message);
    console.error(
      "SQL Message:",
      error.sqlMessage
    );
    console.error("SQL:", error.sql);
    console.error(
      "======================================"
    );

    return res.status(500).json({
      success: false,
      message:
        error.sqlMessage ||
        "Unable to fetch tow trucks.",
    });
  }
};

// ======================================================
// GET SINGLE TOW TRUCK
// ======================================================

const getTruckById = async (req, res) => {
  try {
    const truckId = Number(req.params.id);

    if (
      !Number.isInteger(truckId) ||
      truckId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid truck ID is required.",
      });
    }

    const [rows] = await db.query(
      `
      SELECT
        t.truck_id,
        t.truck_number,
        t.truck_type,
        t.capacity_tons,
        t.truck_model,
        t.registration_date,
        t.latitude,
        t.longitude,
        t.truck_status,
        t.garage_garage_id,

        d.driver_id,
        d.full_name AS driver_full_name,
        d.nic AS driver_nic,
        d.email AS driver_email,
        d.contact_number
          AS driver_contact_number,
        d.license_number,
        d.license_expire_date,
        d.driver_status,
        d.experience_years

      FROM tow_truck t

      LEFT JOIN truck_driver d
        ON d.tow_truck_truck_id =
           t.truck_id

      WHERE t.truck_id = ?
      LIMIT 1
      `,
      [truckId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Tow truck not found.",
      });
    }

    return res.status(200).json({
      success: true,
      truck:
        formatTruckRegistration(rows[0]),
    });
  } catch (error) {
    console.error(
      "========== GET TRUCK ERROR =========="
    );
    console.error("Code:", error.code);
    console.error("Message:", error.message);
    console.error(
      "SQL Message:",
      error.sqlMessage
    );
    console.error("SQL:", error.sql);
    console.error(
      "====================================="
    );

    return res.status(500).json({
      success: false,
      message:
        error.sqlMessage ||
        "Unable to fetch tow truck details.",
    });
  }
};

// ======================================================
// UPDATE TOW TRUCK AND DRIVER
// ======================================================

const updateTruck = async (req, res) => {
  let connection;

  try {
    const truckId = Number(req.params.id);

    if (
      !Number.isInteger(truckId) ||
      truckId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid truck ID is required.",
      });
    }

    const validation =
      validateTruckAndDriverData(req.body);

    if (!validation.valid) {
      return res
        .status(validation.status)
        .json({
          success: false,
          message: validation.message,
        });
    }

    const {
      cleanPlateNumber,
      cleanTruckModel,
      cleanTruckType,
      numericCapacity,

      cleanDriverName,
      cleanDriverEmail,
      cleanDriverContact,
      cleanDriverNic,
      cleanLicenseNumber,
      cleanLicenseExpireDate,

      numericDriverExperience,
      numericGarageId,
    } = validation.values;

    connection = await db.getConnection();
    await connection.beginTransaction();

    // ==================================================
    // Check truck and driver exist
    // ==================================================

    const [existingRows] =
      await connection.query(
        `
        SELECT
          t.truck_id,
          t.garage_garage_id,
          d.driver_id

        FROM tow_truck t

        LEFT JOIN truck_driver d
          ON d.tow_truck_truck_id =
             t.truck_id

        WHERE t.truck_id = ?
        LIMIT 1
        `,
        [truckId]
      );

    if (existingRows.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message:
          "Tow truck not found.",
      });
    }

    const existing = existingRows[0];

    const driverId = Number(
      existing.driver_id
    );

    if (
      !Number.isInteger(driverId) ||
      driverId <= 0
    ) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message:
          "The driver linked to this tow truck was not found.",
      });
    }

    // ==================================================
    // Check garage exists and obtain coordinates
    // ==================================================

    const [garageRows] =
      await connection.query(
        `
        SELECT
          garage_id,
          latitude,
          longitude
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

    const latitude = Number(
      garageRows[0].latitude
    );

    const longitude = Number(
      garageRows[0].longitude
    );

    // ==================================================
    // Check duplicate truck number
    // ==================================================

    const [duplicateTruckRows] =
      await connection.query(
        `
        SELECT truck_id
        FROM tow_truck
        WHERE truck_number = ?
          AND truck_id <> ?
        LIMIT 1
        `,
        [cleanPlateNumber, truckId]
      );

    if (duplicateTruckRows.length > 0) {
      await connection.rollback();

      return res.status(409).json({
        success: false,
        message:
          "Another tow truck already uses this plate number.",
      });
    }

    // ==================================================
    // Check duplicate driver details
    // ==================================================

    const [duplicateDriverRows] =
      await connection.query(
        `
        SELECT
          driver_id,
          nic,
          email,
          contact_number,
          license_number
        FROM truck_driver
        WHERE driver_id <> ?
          AND (
            nic = ?
            OR email = ?
            OR contact_number = ?
            OR license_number = ?
          )
        LIMIT 1
        `,
        [
          driverId,
          cleanDriverNic,
          cleanDriverEmail,
          cleanDriverContact,
          cleanLicenseNumber,
        ]
      );

    if (
      duplicateDriverRows.length > 0
    ) {
      await connection.rollback();

      return res.status(409).json({
        success: false,
        message:
          "Driver NIC, email, contact number or license number is already used by another driver.",
      });
    }

    // ==================================================
    // Update tow truck
    // ==================================================

    await connection.query(
      `
      UPDATE tow_truck
      SET
        truck_number = ?,
        truck_type = ?,
        capacity_tons = ?,
        truck_model = ?,
        latitude = ?,
        longitude = ?,
        garage_garage_id = ?
      WHERE truck_id = ?
      `,
      [
        cleanPlateNumber,
        cleanTruckType,
        numericCapacity,
        cleanTruckModel,
        latitude,
        longitude,
        numericGarageId,
        truckId,
      ]
    );

    // ==================================================
    // Update truck driver
    // ==================================================

    await connection.query(
      `
      UPDATE truck_driver
      SET
        full_name = ?,
        nic = ?,
        email = ?,
        contact_number = ?,
        license_number = ?,
        license_expire_date = ?,
        experience_years = ?
      WHERE driver_id = ?
      `,
      [
        cleanDriverName,
        cleanDriverNic,
        cleanDriverEmail,
        cleanDriverContact,
        cleanLicenseNumber,
        cleanLicenseExpireDate,
        numericDriverExperience,
        driverId,
      ]
    );

    await connection.commit();

    return res.status(200).json({
      success: true,
      message:
        "Tow truck and driver details updated successfully.",

      truck: {
        truckId,
        formattedTruckId:
          formatTruckId(truckId),

        plateNumber: cleanPlateNumber,
        truckNumber: cleanPlateNumber,
        truckModel: cleanTruckModel,
        truckType: cleanTruckType,
        capacity: numericCapacity,

        latitude,
        longitude,
        garageId: numericGarageId,

        driverId,
        formattedDriverId:
          formatDriverId(driverId),

        driverName: cleanDriverName,
        driverNic: cleanDriverNic,
        driverEmail: cleanDriverEmail,
        driverContact:
          cleanDriverContact,
        licenseNumber:
          cleanLicenseNumber,
        licenseExpireDate:
          cleanLicenseExpireDate,
        driverExperience:
          numericDriverExperience,
      },
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error(
          "Truck update rollback failed:",
          rollbackError
        );
      }
    }

    console.error(
      "========== UPDATE TRUCK ERROR =========="
    );
    console.error("Code:", error.code);
    console.error("Message:", error.message);
    console.error(
      "SQL Message:",
      error.sqlMessage
    );
    console.error("SQL:", error.sql);
    console.error(
      "========================================"
    );

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message:
          "Truck number or driver details already exist.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        error.sqlMessage ||
        "Unable to update tow truck and driver details.",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// ======================================================
// EXPORT CONTROLLER FUNCTIONS
// ======================================================

module.exports = {
  registerTruck,
  getAllTrucks,
  getTruckById,
  updateTruck,
};