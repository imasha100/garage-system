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

  ticketNumber:
    row.ticket_number || "",

  customerName:
    row.customer_name || "",

  customerContact:
    row.contact_number || "",

  vehicleNumber:
    row.vehicle_number || "",

  vehicleType:
    row.vehicle_type || "",

  location:
    row.location || "",

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

  requestDate:
    formatDateValue(row.request_date),

  requestTime:
    formatTimeValue(row.request_time),

  requestType:
    row.request_type ||
    "Garage Service",

  requestStatus:
    row.request_status ||
    "Pending",

  assistanceId:
    row.assistance_assistance_id ||
    null,

  assistanceName:
    row.assistance_name || "",

  garageId:
    row.garage_garage_id ??
    row.garage_id ??
    null,

  garageName:
    row.garage_name || "",

  garageCode:
    row.garage_code || "",

  garageAddress:
    row.garage_address || "",

  garageContact:
    row.garage_contact || "",

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

      estimatedDistance:
  row.estimated_distance || "",

estimatedTime:
  row.estimated_time || "",
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
    /^(?:[A-Z]{2,3}[-\s]?\d{4}|[A-Z]{2}\s[A-Z]{1,3}[-\s]?\d{4})$/;

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
        "Enter a valid vehicle number. Example: WP CAS 1234 or CAB-1234.",
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
          WHERE UPPER(
            TRIM(vehicle_number)
          ) = UPPER(TRIM(?))
            AND request_status IN (
              'Pending',
              'Accepted'
            )
          LIMIT 1
          FOR UPDATE
        `,
        [vehicleNumber]
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
    //
    // Examples:
    // GAR-001-0001
    // GAR-001-0002
    // GAR-002-0001
    // ==================================================

    const [lastTicketRows] =
      await connection.query(
        `
          SELECT
            ticket_number
          FROM service_request
          WHERE garage_garage_id = ?
            AND ticket_number
                IS NOT NULL
            AND TRIM(
              ticket_number
            ) <> ''
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

      console.log("Garage Code:", garageCode);
      console.log("Ticket Number:", ticketNumber);
      console.log("Garage ID:", garageId);
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
  ?,
  ?,
  NULL,
  NULL,
  NULL,
  ?
)
        `,
        
          [
  ticketNumber,
  customerName,
  contact,
  vehicleNumber,
  vehicleType,
  location,
  customerLatitude,
  customerLongitude,
  garageId,
  requestType,
  estimatedDistance,
  estimatedTime,
  garageId,
]
        
      );

    await connection.commit();

    return res.status(201).json({
      success: true,

      message:
        "Service request submitted successfully.",

      request: {
        requestId:
          requestResult.insertId,

        ticketNumber,

        requestStatus:
          "Pending",

        customerName,

        customerContact:
          contact,

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
          Number(
            selectedGarage.latitude
          ),

        garageLongitude:
          Number(
            selectedGarage.longitude
          ),

        location,

        customerLatitude,

        customerLongitude,

        requestType,
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
//
// Optional:
// ?garageId=1
// ?status=Pending
// ======================================================

const getServiceRequests = async (
  req,
  res
) => {
  try {
    const requestedGarageId =
      req.query.garageId;

    const requestedStatus = String(
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
      requestedGarageId !== undefined &&
      requestedGarageId !== ""
    ) {
      const garageId = Number(
        requestedGarageId
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
        return res.status(400).json({
          success: false,
          message:
            "Invalid service request status.",
        });
      }

      conditions.push(
        "sr.request_status = ?"
      );

      values.push(matchingStatus);
    }

    if (conditions.length > 0) {
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

      requests: rows.map(
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
    const requestId = Number(
      req.params.id
    );

    if (
      !Number.isInteger(requestId) ||
      requestId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid request ID is required.",
      });
    }

    const [rows] = await db.query(
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

        WHERE sr.request_id = ?
        LIMIT 1
      `,
      [requestId]
    );

    if (rows.length === 0) {
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
//
// Body:
// {
//   "assistanceId": 1
// }
// ======================================================

const acceptServiceRequest = async (
  req,
  res
) => {
  let connection;

  try {
    const requestId = Number(
      req.params.id
    );

    const assistanceId = Number(
      req.body.assistanceId
    );

    if (
      !Number.isInteger(requestId) ||
      requestId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid request ID is required.",
      });
    }

    if (
      !Number.isInteger(assistanceId) ||
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

    await connection.beginTransaction();

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

    if (requestRows.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message:
          "Service request not found.",
      });
    }

    if (
  requestRows[0].request_status !==
  "Pending"
) {
  await connection.rollback();

  return res.status(409).json({
    success: false,
    code: "REQUEST_ALREADY_HANDLED",
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
            full_name
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

    const requestGarageId = Number(
      requestRows[0]
        .garage_garage_id
    );

    const assistanceGarageId = Number(
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
          request_status = 'Accepted',
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
            .ticket_number || "",

        requestStatus:
          "Accepted",

        assistanceId,

        assistanceName:
          assistanceRows[0]
            .full_name,
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
    const requestId = Number(
      req.params.id
    );

    if (
      !Number.isInteger(requestId) ||
      requestId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid request ID is required.",
      });
    }

    const [requestRows] =
      await db.query(
        `
          SELECT
            request_id,
            ticket_number,
            request_status
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
      requestRows[0].request_status !==
      "Pending"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Only pending requests can be rejected.",
      });
    }

    await db.query(
      `
        UPDATE service_request
        SET
          request_status = 'Rejected',
          assistance_assistance_id = NULL
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
            .ticket_number || "",

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
// GET LATEST GUEST REQUEST BY CONTACT NUMBER
//
// Existing route:
// GET /api/service-requests/customer/:customerId/latest
//
// For guest flow, :customerId contains contact number.
// Example:
// /api/service-requests/customer/0711685045/latest
// ======================================================

const getLatestCustomerRequest = async (
  req,
  res
) => {
  try {
    const contact = String(
      req.params.customerId || ""
    )
      .trim()
      .replace(/\s+/g, "");

    if (!/^0\d{9}$/.test(contact)) {
      return res.status(400).json({
        success: false,

        message:
          "A valid 10-digit customer contact number is required.",
      });
    }

    const [rows] = await db.query(
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

        WHERE sr.contact_number = ?

        ORDER BY
          sr.request_id DESC

        LIMIT 1
      `,
      [contact]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,

        message:
          "No service request was found for this contact number.",
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
      "Get latest customer request error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        error.sqlMessage ||
        "Unable to load the latest customer request.",
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
};