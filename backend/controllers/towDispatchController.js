const db = require("../config/db");

// ======================================================
// CREATE TOW TRUCK REQUEST
// Customer submits a selected tow truck request
// ======================================================

const createTowTruckRequest = async (req, res) => {
  try {
    const {
      requestId,
      truckId,
      driverId,
      garageId,
      pickupLocation,
      customerLatitude,
      customerLongitude,
      estimatedArrivalTime,
    } = req.body;

    if (
      !requestId ||
      !truckId ||
      !driverId ||
      !garageId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Request ID, truck ID, driver ID and garage ID are required.",
      });
    }

    const etaMinutes = Number.parseInt(
      String(
        estimatedArrivalTime || ""
      ).replace(/\D/g, ""),
      10
    );

    if (
      !Number.isFinite(etaMinutes) ||
      etaMinutes <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid estimated arrival time is required.",
      });
    }

    const finalPickupLocation =
      pickupLocation ||
      `Customer GPS: ${customerLatitude}, ${customerLongitude}`;

    const [result] = await db.query(
      `
        INSERT INTO tow_dispatch (
          service_request_request_id,
          tow_truck_truck_id,
          truck_driver_driver_id,
          assistance_assistance_id,
          dispatch_date,
          dispatch_time,
          pickup_location,
          destination_garage,
          estimated_arrival_time,
          dispatch_status
        )
        VALUES (
          ?,
          ?,
          ?,
          NULL,
          CURDATE(),
          CURTIME(),
          ?,
          ?,
          DATE_ADD(
            NOW(),
            INTERVAL ? MINUTE
          ),
          ?
        )
      `,
      [
        requestId,
        truckId,
        driverId,
        finalPickupLocation,
        String(garageId),
        etaMinutes,
        "Pending Verification",
      ]
    );

    return res.status(201).json({
      success: true,
      message:
        "Tow truck request submitted successfully.",

      dispatch: {
        dispatchId: result.insertId,
        requestId,
        truckId,
        driverId,
        garageId,
        estimatedArrivalMinutes:
          etaMinutes,
        dispatchStatus:
          "Pending Verification",
      },
    });
  } catch (error) {
    console.error(
      "Create tow truck request error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.sqlMessage ||
        "Unable to submit tow truck request.",
    });
  }
};

// ======================================================
// COMMON SELECT QUERY
//
// Customer and vehicle information is loaded directly
// from the service_request table.
//
// Tow truck and driver information is loaded from
// tow_truck and truck_driver tables.
// ======================================================

const dispatchSelectQuery = `
  SELECT
    td.dispatch_id AS dispatchId,
    td.service_request_request_id
      AS requestId,

    td.tow_truck_truck_id
      AS truckId,

    td.truck_driver_driver_id
      AS driverId,

    td.assistance_assistance_id
      AS assistanceId,

    td.dispatch_date
      AS dispatchDate,

    td.dispatch_time
      AS dispatchTime,

    td.pickup_location
      AS pickupLocation,

    td.destination_garage
      AS destinationGarage,

    td.estimated_arrival_time
      AS estimatedArrivalTime,

    td.dispatch_status
      AS dispatchStatus,

    sr.ticket_number
      AS ticketNumber,

    sr.request_type
      AS requestType,

    sr.request_status
      AS requestStatus,

    sr.request_date
      AS serviceRequestDate,

    sr.request_time
      AS serviceRequestTime,

    sr.customer_name
      AS customerName,

    sr.contact_number
      AS customerContact,

    sr.vehicle_number
      AS vehicleNumber,

    sr.vehicle_type
      AS vehicleType,

    sr.location
      AS customerLocation,

    sr.customer_latitude
      AS customerLatitude,

    sr.customer_longitude
      AS customerLongitude,

    sr.estimated_distance
      AS estimatedDistance,

    sr.estimated_time
      AS estimatedTime,

    sr.garage_garage_id
      AS garageId,

    t.truck_number
      AS truckNumber,

    t.truck_type
      AS truckType,

    t.truck_model
      AS truckModel,

    t.truck_status
      AS truckCategory,

    t.latitude
      AS truckLatitude,

    t.longitude
      AS truckLongitude,

    d.full_name
      AS driverName,

    d.contact_number
      AS driverContact,

    d.email
      AS driverEmail,

    d.license_number
      AS licenseNumber,

    g.garage_name
      AS garageName

  FROM tow_dispatch td

  LEFT JOIN service_request sr
    ON sr.request_id =
       td.service_request_request_id

  LEFT JOIN tow_truck t
    ON t.truck_id =
       td.tow_truck_truck_id

  LEFT JOIN truck_driver d
    ON d.driver_id =
       td.truck_driver_driver_id

  LEFT JOIN garage g
    ON g.garage_id =
       sr.garage_garage_id
`;

// ======================================================
// GET ALL PENDING TOW TRUCK REQUESTS
// Used by Assistance Incident Dispatch page
// ======================================================

const getPendingTowTruckRequests = async (
  req,
  res
) => {
  try {
    const [requests] = await db.query(
      `
        ${dispatchSelectQuery}

        WHERE td.dispatch_status =
          'Pending Verification'

        ORDER BY td.dispatch_id DESC
      `
    );

    return res.status(200).json({
      success: true,
      requests,
    });
  } catch (error) {
    console.error(
      "Get pending tow truck requests error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.sqlMessage ||
        "Unable to load pending tow truck requests.",
    });
  }
};

// ======================================================
// GET TOW TRUCK HISTORY
// Shows requests handled by logged-in Assistance Officer
// ======================================================

const getTowTruckHistory = async (
  req,
  res
) => {
  try {
    const assistanceId = Number(
      req.query.assistanceId
    );

    if (
      !Number.isInteger(assistanceId) ||
      assistanceId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid assistance officer ID is required.",
      });
    }

    const [history] = await db.query(
      `
        ${dispatchSelectQuery}

        WHERE
          td.assistance_assistance_id = ?

          AND td.dispatch_status <>
            'Pending Verification'

        ORDER BY td.dispatch_id DESC
      `,
      [assistanceId]
    );

    return res.status(200).json({
      success: true,
      history,
    });
  } catch (error) {
    console.error(
      "Get tow truck history error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.sqlMessage ||
        "Unable to load tow truck history.",
    });
  }
};

// ======================================================
// GET SINGLE TOW TRUCK REQUEST BY DISPATCH ID
// Customer checks tow truck request status
// ======================================================

const getTowTruckRequestById = async (
  req,
  res
) => {
  try {
    const dispatchId = Number(
      req.params.id
    );

    if (
      !Number.isInteger(dispatchId) ||
      dispatchId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid dispatch ID is required.",
      });
    }

    const [requests] = await db.query(
      `
        ${dispatchSelectQuery}

        WHERE td.dispatch_id = ?

        LIMIT 1
      `,
      [dispatchId]
    );

    if (requests.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Tow truck request was not found.",
      });
    }

    return res.status(200).json({
      success: true,
      dispatch: requests[0],
    });
  } catch (error) {
    console.error(
      "Get tow truck request error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.sqlMessage ||
        "Unable to load the tow truck request.",
    });
  }
};

// ======================================================
// GET LATEST TOW REQUEST BY SERVICE REQUEST ID
// Used when customer continues an existing request
// ======================================================

const getLatestTowTruckRequestByServiceRequestId =
  async (req, res) => {
    try {
      const requestId = Number(
        req.params.requestId
      );

      if (
        !Number.isInteger(requestId) ||
        requestId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "A valid service request ID is required.",
        });
      }

      const [requests] = await db.query(
        `
          ${dispatchSelectQuery}

          WHERE
            td.service_request_request_id = ?

          ORDER BY td.dispatch_id DESC

          LIMIT 1
        `,
        [requestId]
      );

      if (requests.length === 0) {
        return res.status(404).json({
          success: false,
          message:
            "No tow truck request was found for this service request.",
        });
      }

      return res.status(200).json({
        success: true,
        dispatch: requests[0],
      });
    } catch (error) {
      console.error(
        "Get latest tow truck request error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.sqlMessage ||
          "Unable to load the latest tow truck request.",
      });
    }
  };

// ======================================================
// UPDATE TOW TRUCK REQUEST STATUS
// Assistance Officer approves or rejects request
// ======================================================

const updateTowTruckRequestStatus = async (
  req,
  res
) => {
  try {
    const dispatchId = Number(
      req.params.id
    );

    const status = String(
      req.body.status || ""
    ).trim();

    const assistanceId = Number(
      req.body.assistanceId
    );

    const allowedStatuses = [
      "Approved",
      "Rejected",
      "Dispatched",
      "Completed",
    ];

    if (
      !Number.isInteger(dispatchId) ||
      dispatchId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid dispatch ID is required.",
      });
    }

    if (
      !allowedStatuses.includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid dispatch status is required.",
      });
    }

    if (
      !Number.isInteger(assistanceId) ||
      assistanceId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid assistance officer ID is required.",
      });
    }

    const [existingRequests] =
      await db.query(
        `
          SELECT
            dispatch_id,
            dispatch_status

          FROM tow_dispatch

          WHERE dispatch_id = ?

          LIMIT 1
        `,
        [dispatchId]
      );

    if (
      existingRequests.length === 0
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Tow truck request was not found.",
      });
    }

    await db.query(
      `
        UPDATE tow_dispatch

        SET
          dispatch_status = ?,
          assistance_assistance_id = ?

        WHERE dispatch_id = ?
      `,
      [
        status,
        assistanceId,
        dispatchId,
      ]
    );

    return res.status(200).json({
      success: true,

      message:
        status === "Rejected"
          ? "Tow truck request rejected successfully."
          : status === "Approved"
          ? "Tow truck request approved successfully."
          : status === "Dispatched"
          ? "Tow truck dispatched successfully."
          : "Tow truck request completed successfully.",

      dispatch: {
        dispatchId,
        dispatchStatus: status,
        assistanceId,
      },
    });
  } catch (error) {
    console.error(
      "Update tow truck request status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.sqlMessage ||
        "Unable to update the tow truck request.",
    });
  }
};

// ======================================================
// EXPORT CONTROLLERS
// ======================================================

module.exports = {
  createTowTruckRequest,
  getPendingTowTruckRequests,
  getTowTruckHistory,
  getTowTruckRequestById,
  getLatestTowTruckRequestByServiceRequestId,
  updateTowTruckRequestStatus,
};