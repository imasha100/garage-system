const db = require("../config/db");

// ======================================================
// HELPER FUNCTIONS
// ======================================================

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

const normalizeTruckType = (truckType = "") => {
  const cleanType = String(truckType).trim();

  const typeMap = {
    "Flatbed Tow Truck": "Flatbed Tow Truck",
    "Wheel-Lift Tow Truck": "Wheel Lift Tow Truck",
    "Wheel Lift Tow Truck": "Wheel Lift Tow Truck",
    "Integrated Tow Truck": "Integrated Tow Truck",
    "Heavy-Duty Tow Truck": "Heavy Duty Tow Truck",
    "Heavy Duty Tow Truck": "Heavy Duty Tow Truck",
  };

  return typeMap[cleanType] || cleanType;
};

const formatExternalTruckRequest = (row) => ({
  registrationId: row.registration_id,
  status: row.status,

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

  driverFullName: row.full_name,
  driverNic: row.nic,
  driverEmail: row.email,
  driverContactNumber: row.contact_number,
  licenceNumber: row.license_number,

  licenceExpiryDate: formatDateValue(
    row.license_expire_date
  ),

  experienceYears: Number(row.experience_years),
  driverStatus: row.driver_status,

  truckId: row.approved_truck_id || null,
  assignmentStatus: row.assignment_status || "",

  garageId: row.garage_garage_id,
  garageName: row.garage_name || "",
  garageAddress: row.garage_address || "",
  garageDistrict: row.garage_district || "",
});

// ======================================================
// VALIDATE REQUEST DATA
// ======================================================

const validateRequestData = (body) => {
  const {
    truckNumber,
    truckType,
    capacity,
    truckModel,
    registrationDate,
    latitude,
    longitude,
    driverFullName,
    driverNic,
    driverEmail,
    driverContactNumber,
    licenceNumber,
    licenceExpiryDate,
    experienceYears,
    garageId,
  } = body;

  if (
    !truckNumber?.trim() ||
    !truckType?.trim() ||
    capacity === "" ||
    capacity === null ||
    capacity === undefined ||
    !truckModel?.trim() ||
    !registrationDate ||
    latitude === "" ||
    latitude === null ||
    latitude === undefined ||
    longitude === "" ||
    longitude === null ||
    longitude === undefined ||
    !driverFullName?.trim() ||
    !driverNic?.trim() ||
    !driverEmail?.trim() ||
    !driverContactNumber?.trim() ||
    !licenceNumber?.trim() ||
    !licenceExpiryDate ||
    experienceYears === "" ||
    experienceYears === null ||
    experienceYears === undefined ||
    garageId === "" ||
    garageId === null ||
    garageId === undefined
  ) {
    return {
      valid: false,
      statusCode: 400,
      message:
        "Please complete all required truck, driver and garage details.",
    };
  }

  const cleanTruckNumber = truckNumber
    .trim()
    .toUpperCase();

  const cleanTruckType =
    normalizeTruckType(truckType);

  const cleanTruckModel = truckModel.trim();

  const cleanDriverFullName =
    driverFullName.trim();

  const cleanDriverNic = driverNic
    .trim()
    .toUpperCase();

  const cleanDriverEmail = driverEmail
    .trim()
    .toLowerCase();

  const cleanDriverContactNumber =
    driverContactNumber.trim();

  const cleanLicenceNumber = licenceNumber
    .trim()
    .toUpperCase();

  const numericCapacity = Number.parseFloat(
    String(capacity).replace(/[^\d.]/g, "")
  );

  const numericLatitude = Number(latitude);

  const numericLongitude = Number(longitude);

  const numericExperienceYears =
    Number(experienceYears);

  const numericGarageId = Number(garageId);

  const validTruckTypes = [
    "Flatbed Tow Truck",
    "Wheel Lift Tow Truck",
    "Integrated Tow Truck",
    "Heavy Duty Tow Truck",
  ];

  // Supported truck number formats:
  // CAB-1234
  // AB-1234
  // WP CAA-1234
  // CP AB-1234
  const truckNumberRegex =
    /^(?:[A-Z]{2,3}-\d{4}|[A-Z]{2}\s[A-Z]{1,3}-\d{4})$/;

  const fullNameRegex =
    /^[A-Za-z][A-Za-z\s.'-]{1,99}$/;

  const nicRegex =
    /^(\d{9}[VX]|\d{12})$/;

  const emailRegex =
    /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

  const contactRegex = /^0\d{9}$/;

  const licenceNumberRegex =
    /^[A-Z0-9/-]{4,50}$/;

  if (!truckNumberRegex.test(cleanTruckNumber)) {
    return {
      valid: false,
      statusCode: 400,
      message:
        "Invalid truck number. Examples: CAB-1234, AB-1234 or WP CAA-1234.",
    };
  }

  if (!validTruckTypes.includes(cleanTruckType)) {
    return {
      valid: false,
      statusCode: 400,
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
      statusCode: 400,
      message:
        "Truck capacity must be greater than 0.",
    };
  }

  if (
    cleanTruckModel.length < 2 ||
    cleanTruckModel.length > 50
  ) {
    return {
      valid: false,
      statusCode: 400,
      message:
        "Truck model must contain between 2 and 50 characters.",
    };
  }

  const registrationDateValue = new Date(
    `${registrationDate}T00:00:00`
  );

  if (
    Number.isNaN(
      registrationDateValue.getTime()
    )
  ) {
    return {
      valid: false,
      statusCode: 400,
      message:
        "Please enter a valid truck registration date.",
    };
  }

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  if (registrationDateValue > today) {
    return {
      valid: false,
      statusCode: 400,
      message:
        "Truck registration date cannot be a future date.",
    };
  }

  if (
    !Number.isFinite(numericLatitude) ||
    numericLatitude < -90 ||
    numericLatitude > 90
  ) {
    return {
      valid: false,
      statusCode: 400,
      message:
        "Please enter a valid latitude.",
    };
  }

  if (
    !Number.isFinite(numericLongitude) ||
    numericLongitude < -180 ||
    numericLongitude > 180
  ) {
    return {
      valid: false,
      statusCode: 400,
      message:
        "Please enter a valid longitude.",
    };
  }

  if (
    !fullNameRegex.test(cleanDriverFullName)
  ) {
    return {
      valid: false,
      statusCode: 400,
      message:
        "Please enter a valid driver full name.",
    };
  }

  if (!nicRegex.test(cleanDriverNic)) {
    return {
      valid: false,
      statusCode: 400,
      message:
        "Driver NIC must contain 9 digits followed by V/X or exactly 12 digits.",
    };
  }

  if (!emailRegex.test(cleanDriverEmail)) {
    return {
      valid: false,
      statusCode: 400,
      message:
        "Please enter a valid driver email address.",
    };
  }

  if (
    !contactRegex.test(
      cleanDriverContactNumber
    )
  ) {
    return {
      valid: false,
      statusCode: 400,
      message:
        "Driver contact number must contain exactly 10 digits and start with 0.",
    };
  }

  if (
    !licenceNumberRegex.test(
      cleanLicenceNumber
    )
  ) {
    return {
      valid: false,
      statusCode: 400,
      message:
        "Please enter a valid driving licence number.",
    };
  }

  const licenceExpiryDateValue = new Date(
    `${licenceExpiryDate}T00:00:00`
  );

  if (
    Number.isNaN(
      licenceExpiryDateValue.getTime()
    )
  ) {
    return {
      valid: false,
      statusCode: 400,
      message:
        "Please enter a valid licence expiry date.",
    };
  }

  if (licenceExpiryDateValue < today) {
    return {
      valid: false,
      statusCode: 400,
      message:
        "The driving licence has already expired.",
    };
  }

  if (
    !Number.isInteger(
      numericExperienceYears
    ) ||
    numericExperienceYears < 0 ||
    numericExperienceYears > 60
  ) {
    return {
      valid: false,
      statusCode: 400,
      message:
        "Experience years must be a whole number between 0 and 60.",
    };
  }

  if (
    !Number.isInteger(numericGarageId) ||
    numericGarageId <= 0
  ) {
    return {
      valid: false,
      statusCode: 400,
      message:
        "Please select a valid garage.",
    };
  }

  return {
    valid: true,

    values: {
      cleanTruckNumber,
      cleanTruckType,
      numericCapacity,
      cleanTruckModel,

      cleanRegistrationDate:
        registrationDate,

      numericLatitude,
      numericLongitude,

      cleanDriverFullName,
      cleanDriverNic,
      cleanDriverEmail,
      cleanDriverContactNumber,
      cleanLicenceNumber,

      cleanLicenceExpiryDate:
        licenceExpiryDate,

      numericExperienceYears,
      numericGarageId,
    },
  };
};

// ======================================================
// CREATE EXTERNAL TRUCK REGISTRATION REQUEST
// ======================================================

const createExternalTruckRequest = async (
  req,
  res
) => {
  try {
    const validation = validateRequestData(
      req.body
    );
        if (!validation.valid) {
      return res
        .status(validation.statusCode)
        .json({
          success: false,
          message: validation.message,
        });
    }

    const {
      cleanTruckNumber,
      cleanTruckType,
      numericCapacity,
      cleanTruckModel,
      cleanRegistrationDate,
      numericLatitude,
      numericLongitude,

      cleanDriverFullName,
      cleanDriverNic,
      cleanDriverEmail,
      cleanDriverContactNumber,
      cleanLicenceNumber,
      cleanLicenceExpiryDate,
      numericExperienceYears,
      numericGarageId,
    } = validation.values;

    const [garageRows] = await db.query(
      `
      SELECT garage_id
      FROM garage
      WHERE garage_id = ?
      LIMIT 1
      `,
      [numericGarageId]
    );

    if (garageRows.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "The selected garage does not exist.",
      });
    }

    // Only an actively assigned truck blocks
    // another registration request.
    const [existingTruckRows] = await db.query(
      `
      SELECT truck_id
      FROM tow_truck
      WHERE UPPER(TRIM(truck_number)) =
            UPPER(TRIM(?))
        AND assignment_status = 'Active'
      LIMIT 1
      `,
      [cleanTruckNumber]
    );

    if (existingTruckRows.length > 0) {
      return res.status(409).json({
        success: false,
        code: "TRUCK_ALREADY_REGISTERED",
        message:
          "A tow truck with this number is already registered.",
      });
    }

    // Pending and Approved requests are blocked.
    // Rejected requests do not block a new request.
    const [existingRequestRows] =
      await db.query(
        `
        SELECT
          registration_id,
          status
        FROM truck_registration_request
        WHERE (
          UPPER(TRIM(truck_number)) =
            UPPER(TRIM(?))

          OR UPPER(TRIM(nic)) =
            UPPER(TRIM(?))

          OR LOWER(TRIM(email)) =
            LOWER(TRIM(?))

          OR TRIM(contact_number) =
            TRIM(?)

          OR UPPER(TRIM(license_number)) =
            UPPER(TRIM(?))
        )
        AND status IN ('Pending', 'Approved')
        LIMIT 1
        `,
        [
          cleanTruckNumber,
          cleanDriverNic,
          cleanDriverEmail,
          cleanDriverContactNumber,
          cleanLicenceNumber,
        ]
      );

    if (existingRequestRows.length > 0) {
      const existingStatus =
        existingRequestRows[0].status;

      return res.status(409).json({
        success: false,

        code:
          existingStatus === "Approved"
            ? "REQUEST_ALREADY_APPROVED"
            : "REQUEST_ALREADY_PENDING",

        message:
          existingStatus === "Approved"
            ? "An approved registration request already exists with this truck or driver information."
            : "A pending registration request already exists with this truck or driver information.",
      });
    }

    // Check whether this driver is already
    // registered in the operational table.
    const [existingDriverRows] =
      await db.query(
        `
        SELECT driver_id
        FROM truck_driver
        WHERE UPPER(TRIM(nic)) =
                UPPER(TRIM(?))

           OR LOWER(TRIM(email)) =
                LOWER(TRIM(?))

           OR TRIM(contact_number) =
                TRIM(?)

           OR UPPER(TRIM(license_number)) =
                UPPER(TRIM(?))

        LIMIT 1
        `,
        [
          cleanDriverNic,
          cleanDriverEmail,
          cleanDriverContactNumber,
          cleanLicenceNumber,
        ]
      );

    if (existingDriverRows.length > 0) {
      return res.status(409).json({
        success: false,
        code: "DRIVER_ALREADY_REGISTERED",
        message:
          "A truck driver with this NIC, email, contact number or licence number is already registered.",
      });
    }

    const [result] = await db.query(
      `
      INSERT INTO truck_registration_request (
        status,
        truck_number,
        truck_type,
        capacity_tons,
        truck_model,
        registration_date,
        latitude,
        longitude,
        truck_status,
        full_name,
        nic,
        email,
        contact_number,
        license_number,
        license_expire_date,
        experience_years,
        driver_status,
        garage_garage_id
      )
      VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
      `,
      [
        "Pending",
        cleanTruckNumber,
        cleanTruckType,
        numericCapacity,
        cleanTruckModel,
        cleanRegistrationDate,
        numericLatitude,
        numericLongitude,
        "External",

        cleanDriverFullName,
        cleanDriverNic,
        cleanDriverEmail,
        cleanDriverContactNumber,
        cleanLicenceNumber,
        cleanLicenceExpiryDate,
        numericExperienceYears,
        "External",
        numericGarageId,
      ]
    );

    return res.status(201).json({
      success: true,
      message:
        "External tow truck registration request submitted successfully.",

      request: {
        registrationId: result.insertId,
        status: "Pending",
        truckNumber: cleanTruckNumber,
        garageId: numericGarageId,
      },
    });
  } catch (error) {
    console.error(
      "Create external truck request error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.sqlMessage ||
        "Unable to submit external tow truck registration request.",
    });
  }
};

// ======================================================
// GET REQUESTS
// Garage owner uses ?garageId=1
// ======================================================

const getExternalTruckRequests = async (
  req,
  res
) => {
  try {
    const requestedGarageId =
      req.query.garageId;

    const requestedStatus = String(
      req.query.status || ""
    ).trim();

    let sql = `
      SELECT
        r.registration_id,
        r.status,
        r.truck_number,
        r.truck_type,
        r.capacity_tons,
        r.truck_model,
        r.registration_date,
        r.latitude,
        r.longitude,
        r.truck_status,
        r.full_name,
        r.nic,
        r.email,
        r.contact_number,
        r.license_number,
        r.license_expire_date,
        r.experience_years,
        r.driver_status,
        r.garage_garage_id,

        t.truck_id AS approved_truck_id,
        t.assignment_status,

        g.garage_name,
        g.address AS garage_address,
        g.district AS garage_district

      FROM truck_registration_request r

      LEFT JOIN tow_truck t
  ON UPPER(TRIM(t.truck_number)) =
     UPPER(TRIM(r.truck_number))
 AND t.truck_status = 'External'
 AND t.assignment_status = 'Active'
 AND t.garage_garage_id = r.garage_garage_id

      INNER JOIN garage g
        ON g.garage_id =
           r.garage_garage_id
    `;

    const conditions = [];
    const values = [];

    if (
      requestedGarageId !== undefined &&
      requestedGarageId !== ""
    ) {
      const numericGarageId = Number(
        requestedGarageId
      );

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

      conditions.push(
        "r.garage_garage_id = ?"
      );

      values.push(numericGarageId);
    }

    if (requestedStatus) {
      const allowedStatuses = [
        "Pending",
        "Approved",
        "Rejected",
      ];

      const matchingStatus =
        allowedStatuses.find(
          (status) =>
            status.toLowerCase() ===
            requestedStatus.toLowerCase()
        );

      if (!matchingStatus) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid request status.",
        });
      }

      conditions.push("r.status = ?");
      values.push(matchingStatus);
    }

    if (conditions.length > 0) {
      sql += `
        WHERE ${conditions.join(" AND ")}
      `;
    }

    sql += `
      ORDER BY
        CASE
          WHEN r.status = 'Pending' THEN 1
          WHEN r.status = 'Approved' THEN 2
          ELSE 3
        END,
        r.registration_id DESC
    `;

    const [rows] = await db.query(
      sql,
      values
    );

    return res.status(200).json({
      success: true,

      requests: rows.map(
        formatExternalTruckRequest
      ),
    });
  } catch (error) {
    console.error(
      "Get external truck requests error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.sqlMessage ||
        "Unable to load external tow truck requests.",
    });
  }
};
// ======================================================
// GET SINGLE REQUEST
// ======================================================

const getExternalTruckRequestById = async (
  req,
  res
) => {
  try {
    const registrationId = Number(
      req.params.id
    );

    if (
      !Number.isInteger(registrationId) ||
      registrationId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid registration request ID is required.",
      });
    }

    const [rows] = await db.query(
      `
      SELECT
        r.registration_id,
        r.status,
        r.truck_number,
        r.truck_type,
        r.capacity_tons,
        r.truck_model,
        r.registration_date,
        r.latitude,
        r.longitude,
        r.truck_status,
        r.full_name,
        r.nic,
        r.email,
        r.contact_number,
        r.license_number,
        r.license_expire_date,
        r.experience_years,
        r.driver_status,
        r.garage_garage_id,

        t.truck_id AS approved_truck_id,
        t.assignment_status,

        g.garage_name,
        g.address AS garage_address,
        g.district AS garage_district

      FROM truck_registration_request r

      LEFT JOIN tow_truck t
  ON UPPER(TRIM(t.truck_number)) =
     UPPER(TRIM(r.truck_number))
 AND t.truck_status = 'External'
 AND t.assignment_status = 'Active'
 AND t.garage_garage_id = r.garage_garage_id

      INNER JOIN garage g
        ON g.garage_id =
           r.garage_garage_id

      WHERE r.registration_id = ?
      LIMIT 1
      `,
      [registrationId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "External tow truck request not found.",
      });
    }

    return res.status(200).json({
      success: true,
      request:
        formatExternalTruckRequest(rows[0]),
    });
  } catch (error) {
    console.error(
      "Get external request details error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.sqlMessage ||
        "Unable to load external tow truck request details.",
    });
  }
};

// ======================================================
// APPROVE REQUEST
// Creates tow_truck + truck_driver
// ======================================================

const approveExternalTruckRequest = async (
  req,
  res
) => {
  let connection;

  try {
    const registrationId = Number(
      req.params.id
    );

    if (
      !Number.isInteger(registrationId) ||
      registrationId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid registration request ID is required.",
      });
    }

    connection = await db.getConnection();

    await connection.beginTransaction();

    const [requestRows] =
      await connection.query(
        `
        SELECT *
        FROM truck_registration_request
        WHERE registration_id = ?
        FOR UPDATE
        `,
        [registrationId]
      );

    if (requestRows.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message:
          "External tow truck request not found.",
      });
    }

    const request = requestRows[0];

    if (request.status !== "Pending") {
      await connection.rollback();

      return res.status(409).json({
        success: false,
        message:
          `This request has already been ${String(
            request.status
          ).toLowerCase()}.`,
      });
    }

    // Only an actively assigned truck blocks approval.
    const [duplicateTruckRows] =
      await connection.query(
        `
        SELECT truck_id
        FROM tow_truck
        WHERE UPPER(TRIM(truck_number)) =
              UPPER(TRIM(?))
          AND assignment_status = 'Active'
        LIMIT 1
        `,
        [request.truck_number]
      );

    if (duplicateTruckRows.length > 0) {
      await connection.rollback();

      return res.status(409).json({
        success: false,
        code: "TRUCK_ALREADY_REGISTERED",
        message:
          "A tow truck with this number is already registered.",
      });
    }

    const [duplicateDriverRows] =
      await connection.query(
        `
        SELECT driver_id
        FROM truck_driver
        WHERE UPPER(TRIM(nic)) =
                UPPER(TRIM(?))

           OR LOWER(TRIM(email)) =
                LOWER(TRIM(?))

           OR TRIM(contact_number) =
                TRIM(?)

           OR UPPER(TRIM(license_number)) =
                UPPER(TRIM(?))

        LIMIT 1
        `,
        [
          request.nic,
          request.email,
          request.contact_number,
          request.license_number,
        ]
      );

    if (duplicateDriverRows.length > 0) {
      await connection.rollback();

      return res.status(409).json({
        success: false,
        code: "DRIVER_ALREADY_REGISTERED",
        message:
          "A truck driver with these details is already registered.",
      });
    }

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
          assignment_status,
          garage_garage_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          request.truck_number,
          request.truck_type,
          request.capacity_tons,
          request.truck_model,
          request.registration_date,
          request.latitude,
          request.longitude,
          "External",
          "Active",
          request.garage_garage_id,
        ]
      );

    const truckId = truckResult.insertId;

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
          request.full_name,
          request.nic,
          request.email,
          request.contact_number,
          request.license_number,
          request.license_expire_date,
          "External",
          request.experience_years,
          truckId,
        ]
      );

    await connection.query(
      `
      UPDATE truck_registration_request
      SET status = 'Approved'
      WHERE registration_id = ?
      `,
      [registrationId]
    );

    await connection.commit();

    return res.status(200).json({
      success: true,
      message:
        "External tow truck request approved successfully.",

      data: {
        registrationId,
        status: "Approved",
        truckId,
        driverId: driverResult.insertId,
      },
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error(
          "Approve request rollback error:",
          rollbackError
        );
      }
    }

    console.error(
      "Approve external truck request error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.sqlMessage ||
        "Unable to approve external tow truck request.",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};
// ======================================================
// REJECT REQUEST
// ======================================================

const rejectExternalTruckRequest = async (
  req,
  res
) => {
  try {
    const registrationId = Number(
      req.params.id
    );

    if (
      !Number.isInteger(registrationId) ||
      registrationId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid registration request ID is required.",
      });
    }

    const [requestRows] = await db.query(
      `
      SELECT
        registration_id,
        status
      FROM truck_registration_request
      WHERE registration_id = ?
      LIMIT 1
      `,
      [registrationId]
    );

    if (requestRows.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "External tow truck request not found.",
      });
    }

    if (
      requestRows[0].status !== "Pending"
    ) {
      return res.status(409).json({
        success: false,
        message:
          `This request has already been ${String(
            requestRows[0].status
          ).toLowerCase()}.`,
      });
    }

    await db.query(
      `
      UPDATE truck_registration_request
      SET status = 'Rejected'
      WHERE registration_id = ?
      `,
      [registrationId]
    );

    return res.status(200).json({
      success: true,
      message:
        "External tow truck request rejected successfully.",

      data: {
        registrationId,
        status: "Rejected",
      },
    });
  } catch (error) {
    console.error(
      "Reject external truck request error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.sqlMessage ||
        "Unable to reject external tow truck request.",
    });
  }
};

// ======================================================
// RELEASE EXTERNAL TRUCK
// ======================================================

const releaseExternalTruck = async (req, res) => {
  try {
    const truckId = Number(req.params.id);

    if (!Number.isInteger(truckId) || truckId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid truck ID.",
      });
    }

    const [rows] = await db.query(
      `
      SELECT *
      FROM tow_truck
      WHERE truck_id = ?
      LIMIT 1
      `,
      [truckId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Truck not found.",
      });
    }

    const truck = rows[0];

    if (truck.truck_status !== "External") {
      return res.status(400).json({
        success: false,
        message:
          "Only external trucks can be released.",
      });
    }

    if (truck.assignment_status === "Inactive") {
      return res.status(400).json({
        success: false,
        message:
          "This truck has already been released.",
      });
    }

    await db.query(
      `
      UPDATE tow_truck
      SET
        assignment_status = 'Inactive',
        garage_garage_id = NULL
      WHERE truck_id = ?
      `,
      [truckId]
    );

    return res.status(200).json({
      success: true,
      message:
        "Truck released successfully.",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Failed to release truck.",
    });
  }
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  createExternalTruckRequest,
  getExternalTruckRequests,
  getExternalTruckRequestById,
  approveExternalTruckRequest,
  rejectExternalTruckRequest,
  releaseExternalTruck,
};