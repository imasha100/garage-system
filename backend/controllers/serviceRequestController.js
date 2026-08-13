const db = require("../config/db");

// ======================================================
// HELPER FUNCTIONS
// ======================================================

const formatDateValue = (value) => {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    return value.slice(0, 10);
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString().slice(0, 10);
};

const formatTimeValue = (value) => {
  if (!value) {
    return null;
  }

  return String(value).slice(0, 8);
};

// ======================================================
// FORMAT SERVICE REQUEST RESPONSE
// ======================================================

const formatServiceRequest = (row) => ({
  requestId: row.request_id,

  ticketNumber: row.ticket_number || "",

  customerName: row.customer_name || "",

  customerContact: row.contact_number || "",

  vehicleNumber: row.vehicle_number || "",

  vehicleType: row.vehicle_type || "",

  location: row.location || "",

  customerLatitude:
    row.customer_latitude !== null &&
    row.customer_latitude !== undefined
      ? Number(row.customer_latitude)
      : null,

  customerLongitude:
    row.customer_longitude !== null &&
    row.customer_longitude !== undefined
      ? Number(row.customer_longitude)
      : null,

  requestDate: formatDateValue(row.request_date),

  requestTime: formatTimeValue(row.request_time),

  requestType: row.request_type || "Garage Service",

  requestStatus: row.request_status || "Pending",

  customerStage: row.customer_stage || "",

  customerId: row.customer_customer_id || null,

  vehicleId: row.vehicle_vehicle_id || null,

  assistanceId: row.assistance_assistance_id || null,

  assistanceName: row.assistance_name || "",

  garageId:
    row.garage_garage_id ??
    row.garage_id ??
    null,

  garageName: row.garage_name || "",

  garageCode: row.garage_code || "",

  garageAddress: row.garage_address || "",

  garageContact: row.garage_contact || "",

  garageLatitude:
    row.garage_latitude !== null &&
    row.garage_latitude !== undefined
      ? Number(row.garage_latitude)
      : null,

  garageLongitude:
    row.garage_longitude !== null &&
    row.garage_longitude !== undefined
      ? Number(row.garage_longitude)
      : null,

  estimatedDistance: row.estimated_distance || "",

  estimatedTime: row.estimated_time || "",
});

// ======================================================
// VALIDATE CREATE REQUEST
// ======================================================

const validateCreateRequest = (body) => {
  const customerName = String(
    body.customerName || ""
  ).trim();

  const contact = String(
    body.contact || ""
  )
    .trim()
    .replace(/\s+/g, "");

  const vehicleNumber = String(
    body.vehicleNumber || ""
  )
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ");

  const vehicleType = String(
    body.vehicleType || ""
  ).trim();

  const location = String(
    body.location ||
      "Customer Live GPS Location"
  ).trim();

  const requestType = String(
    body.requestType ||
      "Garage Service"
  ).trim();

  const garageId = Number(
    body.garageId
  );

  const customerLatitude = Number(
    body.customerLatitude ??
      body.latitude
  );

  const customerLongitude = Number(
    body.customerLongitude ??
      body.longitude
  );

  const customerNameRegex =
    /^[A-Za-z][A-Za-z\s.'-]{1,99}$/;

  const contactRegex =
    /^0\d{9}$/;

  const vehicleNumberRegex =
    /^(?:[A-Z]{2}[\s-]?[A-Z]{2,3}[\s-]?\d{4}|[A-Z]{2,3}[\s-]?\d{4}|\d{2,3}[\s-]\d{4})$/;

  if (!customerName) {
    return {
      valid: false,
      message:
        "Customer name is required.",
    };
  }

  if (
    !customerNameRegex.test(
      customerName
    )
  ) {
    return {
      valid: false,
      message:
        "Enter a valid customer name using letters only.",
    };
  }

  if (!contactRegex.test(contact)) {
    return {
      valid: false,
      message:
        "Contact number must contain exactly 10 digits and start with 0.",
    };
  }

  if (!vehicleNumber) {
    return {
      valid: false,
      message:
        "Vehicle number is required.",
    };
  }

  if (
    !vehicleNumberRegex.test(
      vehicleNumber
    )
  ) {
    return {
      valid: false,
      message:
        "Enter a valid Sri Lankan vehicle number. Examples: ABC-1234, AB-1234, WP CAS 1234, 65-1234.",
    };
  }

  if (!vehicleType) {
    return {
      valid: false,
      message:
        "Please select a valid vehicle type.",
    };
  }

  if (
    !Number.isInteger(garageId) ||
    garageId <= 0
  ) {
    return {
      valid: false,
      message:
        "Please select a valid garage.",
    };
  }

  if (
    !Number.isFinite(
      customerLatitude
    ) ||
    customerLatitude < -90 ||
    customerLatitude > 90
  ) {
    return {
      valid: false,
      message:
        "A valid customer latitude is required.",
    };
  }

  if (
    !Number.isFinite(
      customerLongitude
    ) ||
    customerLongitude < -180 ||
    customerLongitude > 180
  ) {
    return {
      valid: false,
      message:
        "A valid customer longitude is required.",
    };
  }

  return {
    valid: true,

    values: {
      customerName,
      contact,
      vehicleNumber,
      vehicleType,
      location,
      requestType,
      garageId,
      customerLatitude,
      customerLongitude,

      estimatedDistance: String(
        body.estimatedDistance || ""
      ).trim(),

      estimatedTime: String(
        body.estimatedTime || ""
      ).trim(),
    },
  };
};

// ======================================================
// CREATE SERVICE REQUEST
// POST /api/service-requests
// ======================================================

const createServiceRequest = async (
  req,
  res
) => {
  let connection;

  try {
    const validation =
      validateCreateRequest(req.body);

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
      });
    }

    const {
      customerName,
      contact,
      vehicleNumber,
      vehicleType,
      location,
      requestType,
      garageId,
      customerLatitude,
      customerLongitude,
      estimatedDistance,
      estimatedTime,
    } = validation.values;

    connection =
      await db.getConnection();

    await connection.beginTransaction();

    // ==================================================
    // CHECK SELECTED GARAGE
    // ==================================================

    const [garageRows] =
      await connection.query(
        `
          SELECT
            garage_id,
            garage_name,
            garage_code,
            address,
            contact_number,
            latitude,
            longitude
          FROM garage
          WHERE garage_id = ?
          LIMIT 1
        `,
        [garageId]
      );

    if (garageRows.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        code: "GARAGE_NOT_FOUND",
        message:
          "The selected garage was not found.",
      });
    }

    const selectedGarage =
      garageRows[0];

    const garageCode = String(
      selectedGarage.garage_code || ""
    )
      .trim()
      .toUpperCase();

    if (!garageCode) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        code: "GARAGE_CODE_MISSING",
        message:
          "The selected garage does not have a valid garage code.",
      });
    }

    // ==================================================
    // NORMALIZE VEHICLE NUMBER
    // ==================================================

    const normalizedVehicleNumber =
      String(vehicleNumber || "")
        .trim()
        .toUpperCase()
        .replace(/[\s-]/g, "");

    // ==================================================
    // PREVENT DUPLICATE ACTIVE REQUEST
    // ==================================================

    const [activeRequestRows] =
      await connection.query(
        `
          SELECT
            request_id,
            ticket_number,
            request_status
          FROM service_request
          WHERE REPLACE(
                  REPLACE(
                    UPPER(TRIM(vehicle_number)),
                    ' ',
                    ''
                  ),
                  '-',
                  ''
                ) = ?
            AND request_status IN (
              'Pending',
              'Accepted'
            )
          LIMIT 1
          FOR UPDATE
        `,
        [normalizedVehicleNumber]
      );

    if (
      activeRequestRows.length > 0
    ) {
      await connection.rollback();

      return res.status(409).json({
        success: false,
        code:
          "ACTIVE_REQUEST_EXISTS",
        message:
          "An active service request already exists for this vehicle.",
        activeRequest: {
          requestId:
            activeRequestRows[0]
              .request_id,

          ticketNumber:
            activeRequestRows[0]
              .ticket_number ||
            "",

          requestStatus:
            activeRequestRows[0]
              .request_status,
        },
      });
    }

    // ==================================================
    // GENERATE GARAGE-SPECIFIC TICKET NUMBER
    // ==================================================

    const [lastTicketRows] =
      await connection.query(
        `
          SELECT
            ticket_number
          FROM service_request
          WHERE garage_garage_id = ?
            AND ticket_number IS NOT NULL
            AND TRIM(ticket_number) <> ''
          ORDER BY request_id DESC
          LIMIT 1
          FOR UPDATE
        `,
        [garageId]
      );

    let nextTicketSequence = 1;

    if (
      lastTicketRows.length > 0
    ) {
      const lastTicketNumber =
        String(
          lastTicketRows[0]
            .ticket_number || ""
        ).trim();

      const lastTicketParts =
        lastTicketNumber.split("-");

      const lastSequenceText =
        lastTicketParts[
          lastTicketParts.length - 1
        ];

      const lastSequence =
        Number(lastSequenceText);

      if (
        Number.isInteger(
          lastSequence
        ) &&
        lastSequence > 0
      ) {
        nextTicketSequence =
          lastSequence + 1;
      }
    }

    const ticketNumber =
      `${garageCode}-${String(
        nextTicketSequence
      ).padStart(4, "0")}`;

    console.log(
      "Garage Code:",
      garageCode
    );

    console.log(
      "Ticket Number:",
      ticketNumber
    );

    console.log(
      "Garage ID:",
      garageId
    );

    // ==================================================
    // FIND OR CREATE CUSTOMER
    // ==================================================

    const normalizedContact =
      String(contact || "")
        .trim()
        .replace(/\s+/g, "");

    let customerId = null;

    const [customerRows] =
      await connection.query(
        `
          SELECT
            customer_id,
            full_name,
            contact_number
          FROM customer
          WHERE REPLACE(
            TRIM(contact_number),
            ' ',
            ''
          ) = ?
          LIMIT 1
        `,
        [normalizedContact]
      );

    // EXISTING CUSTOMER
    if (
      customerRows.length > 0
    ) {
      customerId = Number(
        customerRows[0]
          .customer_id
      );

      console.log(
        "Existing customer found:",
        customerId
      );
    }

    // NEW CUSTOMER
    else {
      const [newCustomerResult] =
        await connection.query(
          `
            INSERT INTO customer (
              full_name,
              email,
              contact_number,
              address,
              login_login_id
            )
            VALUES (
              ?,
              NULL,
              ?,
              NULL,
              NULL
            )
          `,
          [
            customerName,
            normalizedContact,
          ]
        );

      customerId = Number(
        newCustomerResult.insertId
      );

      console.log(
        "New customer created:",
        customerId
      );
    }

    // ==================================================
    // VERIFY CUSTOMER ID
    // ==================================================

    if (
      !Number.isInteger(customerId) ||
      customerId <= 0
    ) {
      await connection.rollback();

      return res.status(500).json({
        success: false,
        code:
          "INVALID_CUSTOMER_ID",
        message:
          "Unable to create or identify the customer account.",
      });
    }

    console.log(
      "Resolved Customer ID:",
      customerId
    );

    // ==================================================
    // FIND OR CREATE CUSTOMER VEHICLE
    // ==================================================

    let vehicleId = null;

    const [vehicleRows] =
      await connection.query(
        `
          SELECT
            vehicle_id
          FROM vehicle
          WHERE customer_customer_id = ?
            AND REPLACE(
                  REPLACE(
                    UPPER(TRIM(vehicle_number)),
                    ' ',
                    ''
                  ),
                  '-',
                  ''
                ) = ?
          LIMIT 1
        `,
        [
          customerId,
          normalizedVehicleNumber,
        ]
      );

    // EXISTING VEHICLE
    if (
      vehicleRows.length > 0
    ) {
      const foundVehicleId =
        Number(
          vehicleRows[0]
            .vehicle_id
        );

      if (
        Number.isInteger(
          foundVehicleId
        ) &&
        foundVehicleId > 0
      ) {
        vehicleId =
          foundVehicleId;
      }

      console.log(
        "Existing vehicle found:",
        vehicleId
      );
    }

    // NEW VEHICLE
    else {
      const [newVehicleResult] =
        await connection.query(
          `
            INSERT INTO vehicle (
              vehicle_number,
              vehicle_type,
              vehicle_model,
              customer_customer_id
            )
            VALUES (
              ?,
              ?,
              ?,
              ?
            )
          `,
          [
            vehicleNumber,
            vehicleType,
            vehicleType,
            customerId,
          ]
        );

      vehicleId = Number(
        newVehicleResult.insertId
      );

      console.log(
        "New vehicle created:",
        vehicleId
      );
    }

    // ==================================================
    // VERIFY VEHICLE ID
    // ==================================================

    if (
      !Number.isInteger(vehicleId) ||
      vehicleId <= 0
    ) {
      await connection.rollback();

      return res.status(500).json({
        success: false,
        code:
          "INVALID_VEHICLE_ID",
        message:
          "Unable to create or identify the customer vehicle.",
      });
    }

    console.log(
      "Resolved Vehicle ID:",
      vehicleId
    );

    // ==================================================
    // SAVE REQUEST
    // ==================================================

    const [requestResult] =
      await connection.query(
        `
          INSERT INTO service_request (
            ticket_number,
            customer_name,
            contact_number,
            vehicle_number,
            vehicle_type,
            location,
            customer_latitude,
            customer_longitude,
            request_date,
            request_time,
            garage_id,
            request_type,
            request_status,
            customer_stage,
            estimated_distance,
            estimated_time,
            customer_customer_id,
            vehicle_vehicle_id,
            assistance_assistance_id,
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
            CURRENT_DATE(),
            CURRENT_TIME(),
            ?,
            ?,
            'Pending',
            'REQUEST_CREATED',
            ?,
            ?,
            ?,
            ?,
            NULL,
            ?
          )
        `,
        [
          ticketNumber,
          customerName,
          normalizedContact,
          vehicleNumber,
          vehicleType,
          location,
          customerLatitude,
          customerLongitude,
          garageId,
          requestType,
          estimatedDistance,
          estimatedTime,
          customerId,
          vehicleId,
          garageId,
        ]
      );

    const newRequestId =
      Number(
        requestResult.insertId
      );

    if (
      !Number.isInteger(
        newRequestId
      ) ||
      newRequestId <= 0
    ) {
      throw new Error(
        "Unable to obtain the new service request ID."
      );
    }

    await connection.commit();

    return res.status(201).json({
      success: true,

      message:
        "Service request submitted successfully.",

      request: {
        requestId:
          newRequestId,

        ticketNumber,

        requestStatus:
          "Pending",

        customerStage:
          "REQUEST_CREATED",

        customerId,

        vehicleId,

        customerName,

        customerContact:
          normalizedContact,

        vehicleNumber,

        vehicleType,

        garageId,

        garageName:
          selectedGarage.garage_name,

        garageCode,

        garageAddress:
          selectedGarage.address,

        garageContact:
          selectedGarage.contact_number,

        garageLatitude:
          selectedGarage.latitude !==
          null
            ? Number(
                selectedGarage.latitude
              )
            : null,

        garageLongitude:
          selectedGarage.longitude !==
          null
            ? Number(
                selectedGarage.longitude
              )
            : null,

        location,

        customerLatitude,

        customerLongitude,

        requestType,

        estimatedDistance,

        estimatedTime,
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
          "Create request rollback error:",
          rollbackError
        );
      }
    }

    console.error(
      "Create service request error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        error.sqlMessage ||
        error.message ||
        "Unable to submit the service request.",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// ======================================================
// GET SERVICE REQUESTS
// GET /api/service-requests
// ======================================================

const getServiceRequests = async (
  req,
  res
) => {
  try {
    const requestedGarageId =
      req.query.garageId;

    const requestedStatus =
      String(
        req.query.status || ""
      ).trim();

    const conditions = [];
    const values = [];

    let sql = `
      SELECT
        sr.*,

        g.garage_name,
        g.garage_code,

        g.address
          AS garage_address,

        g.contact_number
          AS garage_contact,

        g.latitude
          AS garage_latitude,

        g.longitude
          AS garage_longitude,

        a.full_name
          AS assistance_name

      FROM service_request sr

      INNER JOIN garage g
        ON g.garage_id =
           sr.garage_garage_id

      LEFT JOIN assistance a
        ON a.assistance_id =
           sr.assistance_assistance_id
    `;

    if (
      requestedGarageId !==
        undefined &&
      requestedGarageId !== ""
    ) {
      const garageId = Number(
        requestedGarageId
      );

      if (
        !Number.isInteger(
          garageId
        ) ||
        garageId <= 0
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "A valid garage ID is required.",
          });
      }

      conditions.push(
        "sr.garage_garage_id = ?"
      );

      values.push(garageId);
    }

    if (requestedStatus) {
      const allowedStatuses = [
        "Pending",
        "Accepted",
        "Rejected",
        "Completed",
        "Cancelled",
      ];

      const matchingStatus =
        allowedStatuses.find(
          (status) =>
            status.toLowerCase() ===
            requestedStatus.toLowerCase()
        );

      if (!matchingStatus) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Invalid service request status.",
          });
      }

      conditions.push(
        "sr.request_status = ?"
      );

      values.push(
        matchingStatus
      );
    }

    if (
      conditions.length > 0
    ) {
      sql += `
        WHERE ${conditions.join(
          " AND "
        )}
      `;
    }

    sql += `
      ORDER BY
        CASE
          WHEN sr.request_status =
               'Pending'
            THEN 1

          WHEN sr.request_status =
               'Accepted'
            THEN 2

          ELSE 3
        END,

        sr.request_id DESC
    `;

    const [rows] =
      await db.query(
        sql,
        values
      );

    return res.status(200).json({
      success: true,

      requests:
        rows.map(
          formatServiceRequest
        ),
    });
  } catch (error) {
    console.error(
      "Get service requests error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        error.sqlMessage ||
        "Unable to load service requests.",
    });
  }
};

// ======================================================
// GET SINGLE SERVICE REQUEST
// GET /api/service-requests/:id
// ======================================================

const getServiceRequestById = async (
  req,
  res
) => {
  try {
    const requestId =
      Number(req.params.id);

    if (
      !Number.isInteger(
        requestId
      ) ||
      requestId <= 0
    ) {
      return res.status(400).json({
        success: false,

        message:
          "A valid request ID is required.",
      });
    }

    const [rows] =
      await db.query(
        `
          SELECT
            sr.*,

            g.garage_name,
            g.garage_code,

            g.address
              AS garage_address,

            g.contact_number
              AS garage_contact,

            g.latitude
              AS garage_latitude,

            g.longitude
              AS garage_longitude,

            a.full_name
              AS assistance_name

          FROM service_request sr

          INNER JOIN garage g
            ON g.garage_id =
               sr.garage_garage_id

          LEFT JOIN assistance a
            ON a.assistance_id =
               sr.assistance_assistance_id

          WHERE
            sr.request_id = ?

          LIMIT 1
        `,
        [requestId]
      );

    if (
      rows.length === 0
    ) {
      return res.status(404).json({
        success: false,

        message:
          "Service request not found.",
      });
    }

    return res.status(200).json({
      success: true,

      request:
        formatServiceRequest(
          rows[0]
        ),
    });
  } catch (error) {
    console.error(
      "Get service request error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        error.sqlMessage ||
        "Unable to load the service request.",
    });
  }
};

// ======================================================
// ACCEPT SERVICE REQUEST
// PUT /api/service-requests/:id/accept
// ======================================================

const acceptServiceRequest = async (
  req,
  res
) => {
  let connection;

  try {
    const requestId =
      Number(req.params.id);

    const assistanceId =
      Number(
        req.body.assistanceId
      );

    if (
      !Number.isInteger(
        requestId
      ) ||
      requestId <= 0
    ) {
      return res.status(400).json({
        success: false,

        message:
          "A valid request ID is required.",
      });
    }

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

    connection =
      await db.getConnection();

    await connection
      .beginTransaction();

    const [requestRows] =
      await connection.query(
        `
          SELECT
            request_id,
            ticket_number,
            request_status,
            garage_garage_id
          FROM service_request
          WHERE request_id = ?
          FOR UPDATE
        `,
        [requestId]
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

    if (
      requestRows[0]
        .request_status !==
      "Pending"
    ) {
      await connection.rollback();

      return res.status(409).json({
        success: false,

        code:
          "REQUEST_ALREADY_HANDLED",

        message:
          "This request has already been accepted or handled by another assistance officer.",
      });
    }

    const [assistanceRows] =
      await connection.query(
        `
          SELECT
            assistance_id,
            garage_garage_id,
            full_name,
            shift_status
          FROM assistance
          WHERE assistance_id = ?
          LIMIT 1
        `,
        [assistanceId]
      );

    if (
      assistanceRows.length === 0
    ) {
      await connection.rollback();

      return res.status(404).json({
        success: false,

        message:
          "Assistance officer not found.",
      });
    }

    const assistanceShiftStatus =
      String(
        assistanceRows[0]
          .shift_status ||
          "OFF"
      )
        .trim()
        .toUpperCase();

    if (
      assistanceShiftStatus !==
      "ON"
    ) {
      await connection.rollback();

      return res.status(403).json({
        success: false,

        code:
          "ASSISTANCE_SHIFT_OFF",

        message:
          "Your assistance shift is OFF. Please start your shift before accepting service requests.",
      });
    }

    const requestGarageId =
      Number(
        requestRows[0]
          .garage_garage_id
      );

    const assistanceGarageId =
      Number(
        assistanceRows[0]
          .garage_garage_id
      );

    if (
      requestGarageId !==
      assistanceGarageId
    ) {
      await connection.rollback();

      return res.status(403).json({
        success: false,

        message:
          "This request belongs to another garage.",
      });
    }

    await connection.query(
      `
        UPDATE service_request
        SET
          request_status =
            'Accepted',
          customer_stage =
            'NAVIGATION',
          assistance_assistance_id = ?
        WHERE request_id = ?
      `,
      [
        assistanceId,
        requestId,
      ]
    );

    await connection.commit();

    return res.status(200).json({
      success: true,

      message:
        "Service request accepted successfully.",

      data: {
        requestId,

        ticketNumber:
          requestRows[0]
            .ticket_number ||
          "",

        requestStatus:
          "Accepted",

        customerStage:
          "NAVIGATION",

        assistanceId,

        assistanceName:
          assistanceRows[0]
            .full_name,
      },
    });
  } catch (error) {
    if (connection) {
      try {
        await connection
          .rollback();
      } catch (
        rollbackError
      ) {
        console.error(
          "Accept request rollback error:",
          rollbackError
        );
      }
    }

    console.error(
      "Accept service request error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        error.sqlMessage ||
        "Unable to accept the service request.",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// ======================================================
// REJECT SERVICE REQUEST
// PUT /api/service-requests/:id/reject
// ======================================================

const rejectServiceRequest = async (
  req,
  res
) => {
  try {
    const requestId =
      Number(req.params.id);

    const assistanceId =
      Number(
        req.body.assistanceId
      );

    if (
      !Number.isInteger(
        requestId
      ) ||
      requestId <= 0
    ) {
      return res.status(400).json({
        success: false,

        message:
          "A valid request ID is required.",
      });
    }

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

    const [assistanceRows] =
      await db.query(
        `
          SELECT
            assistance_id,
            garage_garage_id,
            shift_status
          FROM assistance
          WHERE assistance_id = ?
          LIMIT 1
        `,
        [assistanceId]
      );

    if (
      assistanceRows.length === 0
    ) {
      return res.status(404).json({
        success: false,

        message:
          "Assistance officer not found.",
      });
    }

    const assistanceShiftStatus =
      String(
        assistanceRows[0]
          .shift_status ||
          "OFF"
      )
        .trim()
        .toUpperCase();

    if (
      assistanceShiftStatus !==
      "ON"
    ) {
      return res.status(403).json({
        success: false,

        code:
          "ASSISTANCE_SHIFT_OFF",

        message:
          "Your assistance shift is OFF. Please start your shift before rejecting service requests.",
      });
    }

    const [requestRows] =
      await db.query(
        `
          SELECT
            request_id,
            ticket_number,
            request_status,
            garage_garage_id
          FROM service_request
          WHERE request_id = ?
          LIMIT 1
        `,
        [requestId]
      );

    if (
      requestRows.length === 0
    ) {
      return res.status(404).json({
        success: false,

        message:
          "Service request not found.",
      });
    }

    if (
      requestRows[0]
        .request_status !==
      "Pending"
    ) {
      return res.status(409).json({
        success: false,

        message:
          "Only pending requests can be rejected.",
      });
    }

    const requestGarageId =
      Number(
        requestRows[0]
          .garage_garage_id
      );

    const assistanceGarageId =
      Number(
        assistanceRows[0]
          .garage_garage_id
      );

    if (
      requestGarageId !==
      assistanceGarageId
    ) {
      return res.status(403).json({
        success: false,

        message:
          "This request belongs to another garage.",
      });
    }

    await db.query(
      `
        UPDATE service_request
        SET
          request_status =
            'Rejected',
          assistance_assistance_id =
            NULL
        WHERE request_id = ?
      `,
      [requestId]
    );

    return res.status(200).json({
      success: true,

      message:
        "Service request rejected successfully.",

      data: {
        requestId,

        ticketNumber:
          requestRows[0]
            .ticket_number ||
          "",

        requestStatus:
          "Rejected",
      },
    });
  } catch (error) {
    console.error(
      "Reject service request error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        error.sqlMessage ||
        "Unable to reject the service request.",
    });
  }
};

// ======================================================
// GET LATEST CUSTOMER REQUEST
// GET /api/service-requests/customer/:customerId/latest
// ======================================================

const getLatestCustomerRequest =
  async (req, res) => {
    try {
      const contact = String(
        req.params.customerId ||
          ""
      )
        .trim()
        .replace(/\s+/g, "");

      const vehicleNumber =
        String(
          req.query.vehicleNumber ||
            ""
        )
          .trim()
          .toUpperCase();

      const normalizedVehicleNumber =
        vehicleNumber.replace(
          /[\s-]/g,
          ""
        );

      if (
        !/^0\d{9}$/.test(
          contact
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "A valid 10-digit customer contact number is required.",
          });
      }

      if (!vehicleNumber) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Vehicle number is required.",
          });
      }

      const [rows] =
        await db.query(
          `
            SELECT
              sr.*,

              g.garage_name,
              g.garage_code,

              g.address
                AS garage_address,

              g.contact_number
                AS garage_contact,

              g.latitude
                AS garage_latitude,

              g.longitude
                AS garage_longitude,

              a.full_name
                AS assistance_name,

              sj.job_id
                AS service_job_id,

              sj.job_status
                AS service_job_status,

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
              )
              AS latest_dispatch_id,

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
              )
              AS latest_dispatch_status

            FROM service_request sr

            INNER JOIN garage g
              ON g.garage_id =
                 sr.garage_garage_id

            LEFT JOIN assistance a
              ON a.assistance_id =
                 sr.assistance_assistance_id

            LEFT JOIN service_job sj
              ON sj.service_request_request_id =
                 sr.request_id

            WHERE
              REPLACE(
                TRIM(sr.contact_number),
                ' ',
                ''
              ) = ?

              AND REPLACE(
                REPLACE(
                  UPPER(
                    TRIM(
                      sr.vehicle_number
                    )
                  ),
                  ' ',
                  ''
                ),
                '-',
                ''
              ) = ?

            ORDER BY
              sr.request_id DESC,
              sj.job_id DESC

            LIMIT 1
          `,
          [
            contact,
            normalizedVehicleNumber,
          ]
        );

      if (
        rows.length === 0
      ) {
        return res
          .status(404)
          .json({
            success: false,

            code:
              "REQUEST_NOT_FOUND",

            message:
              "No service request was found for this contact number and vehicle number.",
          });
      }

      const row = rows[0];

      const request =
        formatServiceRequest(
          row
        );

      const requestStatus =
        String(
          row.request_status ||
            ""
        )
          .trim()
          .toUpperCase();

      const jobStatus =
        String(
          row.service_job_status ||
            ""
        )
          .trim()
          .toUpperCase();

      const towDispatchStatus =
        String(
          row.latest_dispatch_status ||
            ""
        )
          .trim()
          .toUpperCase();

      const customerStage =
        String(
          row.customer_stage ||
            ""
        )
          .trim()
          .toUpperCase();

      const requestClosed =
        requestStatus ===
          "COMPLETED" ||
        requestStatus ===
          "CANCELLED" ||
        requestStatus ===
          "REJECTED";

      const jobClosed =
        jobStatus ===
          "COMPLETED" ||
        jobStatus ===
          "CLEARED";

      const canContinue =
        !requestClosed &&
        !jobClosed;

      let continueMessage = "";

      if (
        jobStatus ===
        "COMPLETED"
      ) {
        continueMessage =
          "Your vehicle repair has already been completed. Please create a new service request if you need further assistance.";
      } else if (
        jobStatus ===
        "CLEARED"
      ) {
        continueMessage =
          "Your previous vehicle service has already been completed and cleared from the garage. Please create a new service request.";
      } else if (
        requestStatus ===
        "COMPLETED"
      ) {
        continueMessage =
          "Your previous service request has already been completed. Please create a new service request.";
      } else if (
        requestStatus ===
        "CANCELLED"
      ) {
        continueMessage =
          "Your previous service request has been cancelled. Please create a new service request.";
      } else if (
        requestStatus ===
        "REJECTED"
      ) {
        continueMessage =
          "Your previous service request was rejected. Please create a new service request and select another garage.";
      } else if (
        customerStage ===
          "ARRIVED_AT_GARAGE" &&
        !jobStatus
      ) {
        continueMessage =
          "You have arrived at the garage. Please wait while the assistance officer assigns a technician to your vehicle.";
      } else if (
        requestStatus ===
        "PENDING"
      ) {
        continueMessage =
          `Your request ${
            row.ticket_number ||
            ""
          } is still waiting for garage approval.`;
      }

      let resumeStage =
        "navigation";

      if (!canContinue) {
        resumeStage =
          "closed";
      } else if (
        requestStatus ===
        "PENDING"
      ) {
        resumeStage =
          "pending";
      } else if (
        jobStatus ===
          "ASSIGNED" ||
        jobStatus ===
          "IN_PROGRESS"
      ) {
        resumeStage =
          "live-progress";
      } else if (
        towDispatchStatus ===
          "PENDING VERIFICATION" ||
        towDispatchStatus ===
          "PENDING_VERIFICATION" ||
        towDispatchStatus ===
          "APPROVED" ||
        towDispatchStatus ===
          "DISPATCHED" ||
        towDispatchStatus ===
          "EN_ROUTE_TO_CUSTOMER" ||
        towDispatchStatus ===
          "ARRIVED_AT_CUSTOMER" ||
        towDispatchStatus ===
          "EN_ROUTE_TO_GARAGE"
      ) {
        resumeStage =
          "track-tow";
      } else if (
        towDispatchStatus ===
          "REJECTED"
      ) {
        resumeStage =
          "mobility";
      } else if (
        towDispatchStatus ===
          "ARRIVED_AT_GARAGE" ||
        customerStage ===
          "ARRIVED_AT_GARAGE"
      ) {
        resumeStage =
          "arrived-at-garage";
      } else if (
        customerStage ===
        "MOBILITY"
      ) {
        resumeStage =
          "mobility";
      } else {
        resumeStage =
          "navigation";
      }

      return res
        .status(200)
        .json({
          success: true,

          canContinue,

          continueMessage,

          resumeStage,

          customerStage:
            row.customer_stage ||
            null,

          jobStatus:
            row.service_job_status ||
            null,

          jobId:
            row.service_job_id ||
            null,

          towDispatchId:
            row.latest_dispatch_id ||
            null,

          towDispatchStatus:
            row.latest_dispatch_status ||
            null,

          request,
        });
    } catch (error) {
      console.error(
        "Get latest customer request error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            error.sqlMessage ||
            "Unable to load the latest customer request.",
        });
    }
  };

// ======================================================
// UPDATE CUSTOMER FLOW STAGE
// PUT /api/service-requests/:id/customer-stage
// ======================================================

const updateCustomerStage = async (
  req,
  res
) => {
  try {
    const requestId =
      Number(req.params.id);

    const stage = String(
      req.body.stage || ""
    )
      .trim()
      .toUpperCase();

    if (
      !Number.isInteger(
        requestId
      ) ||
      requestId <= 0
    ) {
      return res.status(400).json({
        success: false,

        message:
          "A valid service request ID is required.",
      });
    }

    const allowedStages = [
      "REQUEST_CREATED",
      "NAVIGATION",
      "MOBILITY",
      "TRACK_TOW",
      "EN_ROUTE_TO_CUSTOMER",
      "ARRIVED_AT_CUSTOMER",
      "EN_ROUTE_TO_GARAGE",
      "ARRIVED_AT_GARAGE",
      "LIVE_PROGRESS",
      "COMPLETED",
    ];

    if (
      !allowedStages.includes(
        stage
      )
    ) {
      return res.status(400).json({
        success: false,

        message:
          "A valid customer stage is required.",
      });
    }

    const [requestRows] =
      await db.query(
        `
          SELECT
            request_id,
            request_status,
            customer_stage
          FROM service_request
          WHERE request_id = ?
          LIMIT 1
        `,
        [requestId]
      );

    if (
      requestRows.length === 0
    ) {
      return res.status(404).json({
        success: false,

        message:
          "Service request not found.",
      });
    }

    const requestStatus =
      String(
        requestRows[0]
          .request_status ||
          ""
      )
        .trim()
        .toUpperCase();

    if (
      requestStatus ===
        "COMPLETED" ||
      requestStatus ===
        "CANCELLED" ||
      requestStatus ===
        "REJECTED"
    ) {
      return res.status(409).json({
        success: false,

        message:
          "A closed service request cannot be moved to another customer stage.",
      });
    }

    await db.query(
      `
        UPDATE service_request
        SET
          customer_stage = ?
        WHERE
          request_id = ?
      `,
      [
        stage,
        requestId,
      ]
    );

    return res.status(200).json({
      success: true,

      message:
        "Customer flow stage updated successfully.",

      request: {
        requestId,

        customerStage:
          stage,
      },
    });
  } catch (error) {
    console.error(
      "Update customer stage error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        error.sqlMessage ||
        "Unable to update the customer flow stage.",
    });
  }
};

// ======================================================
// GET VEHICLES READY FOR TECHNICIAN ASSIGNMENT
//
// GET /api/service-requests/garage/:garageId/ready-for-technician
//
// Only returns:
// 1. Requests belonging to the selected garage
// 2. Accepted service requests
// 3. Vehicles physically arrived at the garage
// 4. Requests that do NOT already have a service job
// ======================================================

const getVehiclesReadyForTechnician = async (
  req,
  res
) => {
  try {
    const garageId = Number(
      req.params.garageId
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

    const [garageRows] =
      await db.query(
        `
          SELECT
            garage_id,
            garage_name,
            garage_code,
            address,
            contact_number,
            latitude,
            longitude
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
        code: "GARAGE_NOT_FOUND",
        message:
          "The selected garage was not found.",
      });
    }

    const [rows] =
      await db.query(
        `
          SELECT
            sr.*,

            g.garage_name,

            g.garage_code,

            g.address
              AS garage_address,

            g.contact_number
              AS garage_contact,

            g.latitude
              AS garage_latitude,

            g.longitude
              AS garage_longitude,

            a.full_name
              AS assistance_name

          FROM service_request sr

          INNER JOIN garage g
            ON g.garage_id =
               sr.garage_garage_id

          LEFT JOIN assistance a
            ON a.assistance_id =
               sr.assistance_assistance_id

          WHERE
            sr.garage_garage_id = ?

            AND UPPER(
              TRIM(
                sr.request_status
             )
            ) IN (
              'ACCEPTED',
              'ARRIVED AT GARAGE'
            )

            AND UPPER(
              TRIM(
                sr.customer_stage
              )
            ) = 'ARRIVED_AT_GARAGE'

            AND NOT EXISTS (
              SELECT
                1

              FROM service_job sj

              WHERE
                sj.service_request_request_id =
                  sr.request_id
            )

          ORDER BY
            sr.request_id DESC
        `,
        [garageId]
      );

    const vehicles =
      rows.map(
        formatServiceRequest
      );

    return res.status(200).json({
      success: true,

      garageId,

      garageName:
        garageRows[0]
          .garage_name || "",

      count:
        vehicles.length,

      vehicles,
    });
  } catch (error) {
    console.error(
      "Get vehicles ready for technician error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        error.sqlMessage ||
        error.message ||
        "Unable to load vehicles ready for technician assignment.",
    });
  }
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  createServiceRequest,
  getServiceRequests,
  getServiceRequestById,
  acceptServiceRequest,
  rejectServiceRequest,
  getLatestCustomerRequest,
  updateCustomerStage,
  getVehiclesReadyForTechnician,
};