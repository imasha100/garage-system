const db = require("../config/db");

const {
  createNotification,
} = require("./notificationController");

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
      towCharge,
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

    const finalTowCharge =
      Number(towCharge);

    if (
      !Number.isFinite(finalTowCharge) ||
      finalTowCharge < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid tow truck charge is required.",
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
        tow_charge,
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
        ?,
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
        Number(finalTowCharge.toFixed(2)),
        "Pending Verification",
      ]
    );

    const newDispatchId =
      Number(result.insertId);

    // ==================================================
    // NOTIFY ON-SHIFT ASSISTANCE OFFICERS
    // ==================================================

    try {
      const numericGarageId =
        Number(garageId);

      const numericRequestId =
        Number(requestId);

      const [requestRows] =
        await db.query(
          `
          SELECT
            request_id,
            customer_name,
            vehicle_number,
            garage_garage_id
          FROM service_request
          WHERE request_id = ?
          LIMIT 1
          `,
          [numericRequestId]
        );

      const serviceRequest =
        requestRows[0] || null;

      const customerName =
        serviceRequest?.customer_name ||
        "Customer";

      const vehicleNumber =
        serviceRequest?.vehicle_number ||
        "the selected vehicle";

      const resolvedGarageId =
        Number(
          serviceRequest?.garage_garage_id ??
          numericGarageId
        );

      if (
        Number.isInteger(resolvedGarageId) &&
        resolvedGarageId > 0
      ) {
        const [assistanceRows] =
          await db.query(
            `
            SELECT
              assistance_id
            FROM assistance
            WHERE garage_garage_id = ?
              AND UPPER(
                TRIM(
                  COALESCE(
                    shift_status,
                    'OFF'
                  )
                )
              ) = 'ON'
            `,
            [resolvedGarageId]
          );

        if (
          Array.isArray(assistanceRows) &&
          assistanceRows.length > 0
        ) {
          const notificationMessage =
            `${customerName} requested a tow truck for ${vehicleNumber}.`;

          const notificationResults =
            await Promise.all(
              assistanceRows.map(
                async (assistanceRow) => {
                  const resolvedAssistanceId =
                    Number(
                      assistanceRow.assistance_id
                    );

                  if (
                    !Number.isInteger(
                      resolvedAssistanceId
                    ) ||
                    resolvedAssistanceId <= 0
                  ) {
                    return null;
                  }

                  return createNotification({
                    garageId:
                      resolvedGarageId,

                    assistanceId:
                      resolvedAssistanceId,

                    notificationType:
                      "NEW_TOW_REQUEST",

                    title:
                      "New Tow Request",

                    message:
                      notificationMessage,

                    targetPage:
                      "incident-dispatch",

                    referenceId:
                      newDispatchId,
                  });
                }
              )
            );

          notificationResults.forEach(
            (notificationResult) => {
              if (
                notificationResult &&
                notificationResult.success ===
                  false
              ) {
                console.error(
                  "New tow request notification error:",
                  notificationResult.error
                );
              }
            }
          );
        } else {
          console.warn(
            "No ON-shift assistance officers found for tow request garage:",
            resolvedGarageId
          );
        }
      }
    } catch (notificationError) {
      console.error(
        "Create tow request assistance notification error:",
        notificationError
      );
    }

    return res.status(201).json({
      success: true,

      message:
        "Tow truck request submitted successfully.",

      dispatch: {
        dispatchId:
          newDispatchId,

        requestId,
        truckId,
        driverId,
        garageId,

        estimatedArrivalMinutes:
          etaMinutes,

        towCharge:
          Number(finalTowCharge.toFixed(2)),

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

    td.tow_charge
      AS towCharge,

    td.dispatch_status
      AS dispatchStatus,

    td.journey_started_at
      AS journeyStartedAt,

    td.arrived_customer_at
      AS arrivedCustomerAt,

    td.garage_journey_started_at
      AS garageJourneyStartedAt,

    td.arrived_garage_at
      AS arrivedGarageAt,

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

    d.driver_status
      AS driverStatus,

    g.garage_name
      AS garageName,

    g.address
      AS garageAddress,

    g.contact_number
      AS garageContact,

    g.latitude
      AS garageLatitude,

    g.longitude
      AS garageLongitude

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
// GET /api/tow-dispatches/pending
// ======================================================

const getPendingTowTruckRequests = async (
  req,
  res
) => {
  try {
    const [requests] = await db.query(
      `
      ${dispatchSelectQuery}

      WHERE
        td.dispatch_status =
        'Pending Verification'

      ORDER BY
        td.dispatch_id DESC
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
// GET /api/tow-dispatches/history?assistanceId=1
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

      ORDER BY
        td.dispatch_id DESC
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
// GET SINGLE TOW TRUCK REQUEST
// GET /api/tow-dispatches/:id
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

      WHERE
        td.dispatch_id = ?

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

      dispatch:
        requests[0],
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
// GET /api/tow-dispatches/request/:requestId/latest
// ======================================================

const getLatestTowTruckRequestByServiceRequestId =
  async (req, res) => {
    try {
      const requestId = Number(
        req.params.requestId
      );

      if (
        !Number.isInteger(
          requestId
        ) ||
        requestId <= 0
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "A valid service request ID is required.",
          });
      }

      const [requests] =
        await db.query(
          `
          ${dispatchSelectQuery}

          WHERE
            td.service_request_request_id = ?

          ORDER BY
            td.dispatch_id DESC

          LIMIT 1
          `,
          [requestId]
        );

      if (
        requests.length === 0
      ) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "No tow truck request was found for this service request.",
          });
      }

      return res
        .status(200)
        .json({
          success: true,

          dispatch:
            requests[0],
        });
    } catch (error) {
      console.error(
        "Get latest tow truck request error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            error.sqlMessage ||
            "Unable to load the latest tow truck request.",
        });
    }
  };
    

// ======================================================
// GET EXTERNAL DRIVER TOW ASSIGNMENTS
//
// GET /api/tow-dispatches/external-driver/:driverId
//
// IMPORTANT:
// This endpoint returns the tow assignments for the
// logged-in external driver.
//
// LOCATION FLOW:
//
// 1. External Tow Truck Location
//    = tow_truck.latitude / longitude
//
// 2. Breakdown Vehicle Location
//    = service_request.customer_latitude / longitude
//
// 3. Selected Garage Location
//    = garage.latitude / longitude
//
// Journey:
//
// Driver -> Breakdown Vehicle -> Selected Garage
// ======================================================

const getExternalDriverTowAssignments =
  async (req, res) => {
    try {
      const driverId = Number(
        req.params.driverId
      );

      if (
        !Number.isInteger(
          driverId
        ) ||
        driverId <= 0
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "A valid external driver ID is required.",
          });
      }

      // ==================================================
      // CHECK DRIVER
      // ==================================================

      const [driverRows] =
        await db.query(
          `
          SELECT
            d.driver_id
              AS driverId,

            d.full_name
              AS driverName,

            d.contact_number
              AS driverContact,

            d.email
              AS driverEmail,

            d.license_number
              AS licenseNumber,

            d.driver_status
              AS driverStatus,

            t.truck_id
              AS truckId,

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

            t.garage_garage_id
              AS garageId

          FROM truck_driver d

          LEFT JOIN tow_truck t
            ON t.truck_id =
               d.tow_truck_truck_id

          WHERE
            d.driver_id = ?

          LIMIT 1
          `,
          [driverId]
        );

      if (
        driverRows.length === 0
      ) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "External driver was not found.",
          });
      }

      const driver =
        driverRows[0];

      const driverStatus =
        String(
          driver.driverStatus ||
            ""
        )
          .trim()
          .toLowerCase();

      if (
        driverStatus !==
        "external"
      ) {
        return res
          .status(403)
          .json({
            success: false,

            message:
              "This account is not an external tow truck driver.",
          });
      }

      // ==================================================
      // GET DRIVER ASSIGNMENTS
      // ==================================================

      const [assignments] =
        await db.query(
          `
          ${dispatchSelectQuery}

          WHERE
            td.truck_driver_driver_id = ?

            AND td.dispatch_status IN (
              'Approved',
              'Dispatched',
              'EN_ROUTE_TO_CUSTOMER',
              'ARRIVED_AT_CUSTOMER',
              'EN_ROUTE_TO_GARAGE',
              'ARRIVED_AT_GARAGE'
            )

          ORDER BY
            CASE
              WHEN td.dispatch_status =
                   'Approved'
                THEN 1

              WHEN td.dispatch_status =
                   'Dispatched'
                THEN 2

              WHEN td.dispatch_status =
                   'EN_ROUTE_TO_CUSTOMER'
                THEN 3

              WHEN td.dispatch_status =
                   'ARRIVED_AT_CUSTOMER'
                THEN 4

              WHEN td.dispatch_status =
                   'EN_ROUTE_TO_GARAGE'
                THEN 5

              WHEN td.dispatch_status =
                   'ARRIVED_AT_GARAGE'
                THEN 6

              ELSE 7
            END ASC,

            td.dispatch_id DESC
          `,
          [driverId]
        );

      const activeAssignment =
        assignments.find(
          (item) =>
            item.dispatchStatus ===
              "Approved" ||
            item.dispatchStatus ===
              "Dispatched" ||
            item.dispatchStatus ===
              "EN_ROUTE_TO_CUSTOMER" ||
            item.dispatchStatus ===
              "ARRIVED_AT_CUSTOMER" ||
            item.dispatchStatus ===
              "EN_ROUTE_TO_GARAGE" ||
            item.dispatchStatus ===
              "ARRIVED_AT_GARAGE"
        ) || null;

      return res
        .status(200)
        .json({
          success: true,

          driver,

          activeAssignment,

          count:
            assignments.length,

          assignments,
        });
    } catch (error) {
      console.error(
        "Get external driver tow assignments error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            error.sqlMessage ||
            "Unable to load external driver tow assignments.",
        });
    }
  };

// ======================================================
// UPDATE TOW TRUCK REQUEST STATUS
//
// Assistance approves/rejects/dispatches request
//
// PUT /api/tow-dispatches/:id/status
// ======================================================

const updateTowTruckRequestStatus =
  async (req, res) => {
    try {
      const dispatchId = Number(
        req.params.id
      );

      const status = String(
        req.body.status || ""
      ).trim();

      const assistanceId =
        req.body.assistanceId ===
          null ||
        req.body.assistanceId ===
          undefined ||
        req.body.assistanceId ===
          ""
          ? null
          : Number(
              req.body.assistanceId
            );

      if (
        !Number.isInteger(
          dispatchId
        ) ||
        dispatchId <= 0
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "A valid dispatch ID is required.",
          });
      }

      const allowedStatuses = [
        "Approved",
        "Rejected",
        "Dispatched",
        "Completed",
      ];

      if (
        !allowedStatuses.includes(
          status
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Invalid tow dispatch status.",
          });
      }

      if (
        assistanceId !== null &&
        (
          !Number.isInteger(
            assistanceId
          ) ||
          assistanceId <= 0
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "A valid assistance officer ID is required.",
          });
      }

      // ==================================================
      // LOAD CURRENT DISPATCH DETAILS
      // ==================================================

      const [currentRows] =
        await db.query(
          `
          SELECT
            td.dispatch_id,

            td.dispatch_status,

            td.truck_driver_driver_id,

            td.tow_truck_truck_id,

            td.assistance_assistance_id,

            td.service_request_request_id,

            sr.customer_customer_id
              AS customer_id,

            sr.customer_name,

            sr.vehicle_number,

            sr.garage_garage_id
              AS garage_id,

            t.truck_number,

            d.full_name
              AS driver_name,

            d.contact_number
              AS driver_contact,

            d.driver_status,

            g.garage_name

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

          WHERE
            td.dispatch_id = ?

          LIMIT 1
          `,
          [dispatchId]
        );

      if (
        currentRows.length === 0
      ) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "Tow truck request was not found.",
          });
      }

      const currentRequest =
        currentRows[0];

      // ==================================================
      // IMPORTANT LOCK
      //
      // External driver journey completion must happen
      // through updateExternalDriverJourneyStage().
      //
      // Assistance must NOT manually mark an external
      // driver's tow dispatch as Completed.
      // ==================================================

      const isExternalDriver =
        String(
          currentRequest
            .driver_status ||
            ""
        )
          .trim()
          .toLowerCase() ===
        "external";

      if (
        status === "Completed" &&
        isExternalDriver
      ) {
        return res.status(409).json({
          success: false,

          message:
            "External tow jobs can only be completed by the assigned driver after arriving at the garage.",
        });
      }

      // ==================================================
      // UPDATE TOW DISPATCH
      // ==================================================

      await db.query(
        `
        UPDATE tow_dispatch

        SET
          dispatch_status = ?,

          assistance_assistance_id =
            COALESCE(
              ?,
              assistance_assistance_id
            )

        WHERE
          dispatch_id = ?
        `,
        [
          status,
          assistanceId,
          dispatchId,
        ]
      );

      // ==================================================
      // UPDATE SERVICE REQUEST STATUS
      // ==================================================

      let serviceRequestStatus =
        null;

      if (
        status ===
        "Approved"
      ) {
        serviceRequestStatus =
          "Approved";
      } else if (
        status ===
        "Rejected"
      ) {
        serviceRequestStatus =
          "Rejected";
      } else if (
        status ===
        "Dispatched"
      ) {
        serviceRequestStatus =
          "Dispatched";
      } else if (
        status ===
        "Completed"
      ) {
        serviceRequestStatus =
          "Completed";
      }

      if (
        serviceRequestStatus
      ) {
        await db.query(
          `
          UPDATE service_request

          SET
            request_status = ?

          WHERE
            request_id = ?
          `,
          [
            serviceRequestStatus,

            currentRequest
              .service_request_request_id,
          ]
        );
      }

      // ==================================================
      // NOTIFICATION RESULT OBJECTS
      // ==================================================

      let driverNotification = {
        created: false,
        notificationId: null,
      };

      let customerApprovalNotification = {
        created: false,
        notificationId: null,
      };

      // ==================================================
      // APPROVED EXTERNAL TOW REQUEST
      // SEND NOTIFICATION TO EXTERNAL DRIVER
      // ==================================================

      if (
        status ===
          "Approved" &&
        isExternalDriver
      ) {
        const garageId =
          Number(
            currentRequest
              .garage_id
          );

        const driverId =
          Number(
            currentRequest
              .truck_driver_driver_id
          );

        if (
          Number.isInteger(
            garageId
          ) &&
          garageId > 0 &&
          Number.isInteger(
            driverId
          ) &&
          driverId > 0
        ) {
          const notificationResult =
            await createNotification({
              garageId,

              driverId,

              notificationType:
                "TOW_REQUEST_APPROVED",

              title:
                "New Tow Assignment",

              message:
                `A tow request for ${
                  currentRequest
                    .vehicle_number ||
                  "a customer vehicle"
                } has been approved and assigned to you.`,

              targetPage:
                "tow-assignments",

              referenceId:
                dispatchId,

              priority:
                "HIGH",
            });

          if (
            notificationResult.success
          ) {
            driverNotification = {
              created: true,

              notificationId:
                notificationResult
                  .notificationId,
            };
          } else {
            console.error(
              "External driver notification creation failed:",
              notificationResult.error
            );
          }
        }
      }

      // ==================================================
      // APPROVED EXTERNAL TOW REQUEST
      // SEND NOTIFICATION TO CUSTOMER
      // ==================================================

      if (
        status ===
          "Approved" &&
        isExternalDriver
      ) {
        const garageId =
          Number(
            currentRequest
              .garage_id
          );

        const customerId =
          Number(
            currentRequest
              .customer_id
          );

        const driverName =
          currentRequest
            .driver_name ||
          "External Tow Driver";

        const driverContact =
          currentRequest
            .driver_contact ||
          "Contact unavailable";

        const truckNumber =
          currentRequest
            .truck_number ||
          "Tow Truck";

        if (
          Number.isInteger(
            garageId
          ) &&
          garageId > 0 &&
          Number.isInteger(
            customerId
          ) &&
          customerId > 0
        ) {
          const result =
            await createNotification({
              garageId,

              customerId,

              notificationType:
                "TOW_REQUEST_ACCEPTED",

              title:
                "Tow Request Accepted",

              message:
                `Your tow truck request has been accepted. Assigned tow truck: ${truckNumber}. Driver: ${driverName}. Contact: ${driverContact}. The driver will contact you shortly.`,

              targetPage:
                "mobility-recovery",

              referenceId:
                dispatchId,

              priority:
                "HIGH",
            });

          if (
            result.success
          ) {
            customerApprovalNotification = {
              created: true,

              notificationId:
                result.notificationId,
            };
          } else {
            console.error(
              "Customer approval notification creation failed:",
              result.error
            );
          }
        }
      }

      // ==================================================
      // RESPONSE
      // ==================================================

      return res
        .status(200)
        .json({
          success: true,

          message:
            `Tow truck request ${status.toLowerCase()} successfully.`,

          dispatch: {
            dispatchId,

            dispatchStatus:
              status,

            assistanceId:
              assistanceId ||
              currentRequest
                .assistance_assistance_id,

            driverId:
              currentRequest
                .truck_driver_driver_id,

            truckId:
              currentRequest
                .tow_truck_truck_id,

            requestId:
              currentRequest
                .service_request_request_id,
          },

          driverNotification,

          customerApprovalNotification,
        });
    } catch (error) {
      console.error(
        "Update tow truck request status error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            error.sqlMessage ||
            "Unable to update tow truck request status.",
        });
    }
  };
  // ======================================================
// UPDATE EXTERNAL DRIVER JOURNEY STAGE
//
// PUT /api/tow-dispatches/:id/journey-stage
//
// Body:
// {
//   driverId,
//   stage
// }
//
// Allowed stages:
//
// EN_ROUTE_TO_CUSTOMER
// ARRIVED_AT_CUSTOMER
// EN_ROUTE_TO_GARAGE
// ARRIVED_AT_GARAGE
// COMPLETED
//
// IMPORTANT:
//
// ARRIVED_AT_GARAGE does NOT unlock technician assignment.
//
// Only COMPLETED changes the service request to
// "Arrived at Garage", which allows Assistance
// to assign a technician.
//
// ARRIVED_AT_GARAGE also records the physical
// garage arrival date and time.
// ======================================================

const updateExternalDriverJourneyStage =
  async (req, res) => {
    try {
      const dispatchId = Number(
        req.params.id
      );

      const driverId = Number(
        req.body.driverId
      );

      const stage = String(
        req.body.stage || ""
      )
        .trim()
        .toUpperCase();

      const allowedStages = [
        "EN_ROUTE_TO_CUSTOMER",
        "ARRIVED_AT_CUSTOMER",
        "EN_ROUTE_TO_GARAGE",
        "ARRIVED_AT_GARAGE",
        "COMPLETED",
      ];

      // ==================================================
      // VALIDATION
      // ==================================================

      if (
        !Number.isInteger(
          dispatchId
        ) ||
        dispatchId <= 0
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "A valid dispatch ID is required.",
          });
      }

      if (
        !Number.isInteger(
          driverId
        ) ||
        driverId <= 0
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "A valid external driver ID is required.",
          });
      }

      if (
        !allowedStages.includes(
          stage
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "A valid journey stage is required.",
          });
      }

      // ==================================================
      // LOAD DISPATCH
      // ==================================================

      const [rows] =
        await db.query(
          `
          SELECT
            td.dispatch_id,

            td.dispatch_status,

            td.truck_driver_driver_id
              AS driver_id,

            td.tow_truck_truck_id
              AS truck_id,

            td.assistance_assistance_id
              AS assistance_id,

            td.service_request_request_id
              AS request_id,

            sr.customer_customer_id
              AS customer_id,

            sr.customer_name,

            sr.vehicle_number,

            sr.vehicle_type,

            sr.customer_latitude,

            sr.customer_longitude,

            sr.garage_garage_id
              AS garage_id,

            t.truck_number,

            t.latitude
              AS truck_latitude,

            t.longitude
              AS truck_longitude,

            d.full_name
              AS driver_name,

            d.contact_number
              AS driver_contact,

            d.driver_status,

            g.garage_name,

            g.latitude
              AS garage_latitude,

            g.longitude
              AS garage_longitude

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

          WHERE
            td.dispatch_id = ?

          LIMIT 1
          `,
          [dispatchId]
        );

      if (
        rows.length === 0
      ) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "Tow dispatch was not found.",
          });
      }

      const dispatch =
        rows[0];

      // ==================================================
      // VERIFY DRIVER
      // ==================================================

      if (
        Number(
          dispatch.driver_id
        ) !== driverId
      ) {
        return res
          .status(403)
          .json({
            success: false,

            message:
              "This tow dispatch is not assigned to the logged-in external driver.",
          });
      }

      const isExternalDriver =
        String(
          dispatch.driver_status ||
            ""
        )
          .trim()
          .toLowerCase() ===
        "external";

      if (
        !isExternalDriver
      ) {
        return res
          .status(403)
          .json({
            success: false,

            message:
              "Only an external tow truck driver can update this journey.",
          });
      }

      // ==================================================
      // VALIDATE JOURNEY ORDER
      // ==================================================

      const currentStatus =
        String(
          dispatch.dispatch_status ||
            ""
        ).trim();

      const validPreviousStatuses = {
        EN_ROUTE_TO_CUSTOMER: [
          "Approved",
          "Dispatched",
        ],

        ARRIVED_AT_CUSTOMER: [
          "EN_ROUTE_TO_CUSTOMER",
        ],

        EN_ROUTE_TO_GARAGE: [
          "ARRIVED_AT_CUSTOMER",
        ],

        ARRIVED_AT_GARAGE: [
          "EN_ROUTE_TO_GARAGE",
        ],

        COMPLETED: [
          "ARRIVED_AT_GARAGE",
        ],
      };

      const allowedPrevious =
        validPreviousStatuses[
          stage
        ] || [];

      if (
        !allowedPrevious.includes(
          currentStatus
        )
      ) {
        return res
          .status(409)
          .json({
            success: false,

            message:
              `Journey stage cannot change from ${currentStatus} to ${stage}.`,
          });
      }

      // ==================================================
      // SELECT TIMESTAMP COLUMN
      // ==================================================

      let timestampColumn =
        null;

      if (
        stage ===
        "EN_ROUTE_TO_CUSTOMER"
      ) {
        timestampColumn =
          "journey_started_at";
      } else if (
        stage ===
        "ARRIVED_AT_CUSTOMER"
      ) {
        timestampColumn =
          "arrived_customer_at";
      } else if (
        stage ===
        "EN_ROUTE_TO_GARAGE"
      ) {
        timestampColumn =
          "garage_journey_started_at";
      } else if (
        stage ===
        "ARRIVED_AT_GARAGE"
      ) {
        timestampColumn =
          "arrived_garage_at";
      }

      // ==================================================
      // UPDATE TOW DISPATCH
      // ==================================================

      if (
        stage ===
        "COMPLETED"
      ) {
        await db.query(
          `
          UPDATE tow_dispatch

          SET
            dispatch_status =
              'Completed'

          WHERE
            dispatch_id = ?
          `,
          [dispatchId]
        );
      } else {
        await db.query(
          `
          UPDATE tow_dispatch

          SET
            dispatch_status = ?,

            ${timestampColumn} =
              NOW()

          WHERE
            dispatch_id = ?
          `,
          [
            stage,
            dispatchId,
          ]
        );
      }

      // ==================================================
      // UPDATE SERVICE REQUEST
      // ==================================================
      //
      // CRITICAL LOCK:
      //
      // ARRIVED_AT_GARAGE:
      // request_status = "Tow Arrived at Garage"
      //
      // Technician assignment is still BLOCKED.
      //
      // Physical arrival date/time is recorded here.
      //
      // COMPLETED:
      // request_status = "Arrived at Garage"
      //
      // This is the point where technician assignment
      // becomes available.
      // ==================================================

      let serviceRequestStatus =
        null;

      let customerStage =
        null;

      if (
        stage ===
        "EN_ROUTE_TO_CUSTOMER"
      ) {
        serviceRequestStatus =
          "Tow Driver En Route";

        customerStage =
          "EN_ROUTE_TO_CUSTOMER";
      } else if (
        stage ===
        "ARRIVED_AT_CUSTOMER"
      ) {
        serviceRequestStatus =
          "Tow Truck Arrived";

        customerStage =
          "ARRIVED_AT_CUSTOMER";
      } else if (
        stage ===
        "EN_ROUTE_TO_GARAGE"
      ) {
        serviceRequestStatus =
          "Vehicle En Route";

        customerStage =
          "EN_ROUTE_TO_GARAGE";
      } else if (
        stage ===
        "ARRIVED_AT_GARAGE"
      ) {
        // ================================================
        // VEHICLE PHYSICALLY ARRIVED AT GARAGE
        //
        // DRIVER HAS NOT COMPLETED TOW HANDOVER YET.
        //
        // DO NOT use "Arrived at Garage" here.
        // ================================================

        serviceRequestStatus =
          "Tow Arrived at Garage";

        customerStage =
          "ARRIVED_AT_GARAGE";
      } else if (
        stage ===
        "COMPLETED"
      ) {
        // ================================================
        // DRIVER CONFIRMED JOURNEY COMPLETE.
        //
        // NOW the vehicle becomes ready for Assistance
        // to assign a technician.
        // ================================================

        serviceRequestStatus =
          "Arrived at Garage";

        customerStage =
          "COMPLETED";
      }

      if (
        serviceRequestStatus &&
        customerStage
      ) {
        // ================================================
        // EXTERNAL TOW PHYSICAL GARAGE ARRIVAL
        // ================================================

        if (
          stage ===
          "ARRIVED_AT_GARAGE"
        ) {
          await db.query(
            `
            UPDATE service_request

            SET
              request_status = ?,

              customer_stage = ?,

              arrived_at_garage_date =
                COALESCE(
                  arrived_at_garage_date,
                  CURRENT_DATE()
                ),

              arrived_at_garage_time =
                COALESCE(
                  arrived_at_garage_time,
                  CURRENT_TIME()
                )

            WHERE
              request_id = ?
            `,
            [
              serviceRequestStatus,
              customerStage,
              dispatch.request_id,
            ]
          );
        } else {
          // ==============================================
          // ALL OTHER JOURNEY STAGES
          // ==============================================

          await db.query(
            `
            UPDATE service_request

            SET
              request_status = ?,
              customer_stage = ?

            WHERE
              request_id = ?
            `,
            [
              serviceRequestStatus,
              customerStage,
              dispatch.request_id,
            ]
          );
        }
      }

      // ==================================================
      // NOTIFICATION RESULT OBJECTS
      // ==================================================

      let customerNotification = {
        created: false,
        notificationId: null,
      };

      let assistanceNotification = {
        created: false,
        notificationId: null,
      };

      // ==================================================
      // COMMON DETAILS
      // ==================================================

      const garageId =
        Number(
          dispatch.garage_id
        );

      const customerId =
        Number(
          dispatch.customer_id
        );

      const assistanceId =
        Number(
          dispatch.assistance_id
        );

      const customerName =
        dispatch.customer_name ||
        "Customer";

      const driverName =
        dispatch.driver_name ||
        "External Tow Driver";

      const driverContact =
        dispatch.driver_contact ||
        "Contact unavailable";

      const truckNumber =
        dispatch.truck_number ||
        "Tow Truck";

      const vehicleNumber =
        dispatch.vehicle_number ||
        "Vehicle";

      const garageName =
        dispatch.garage_name ||
        "Selected Garage";

      // ==================================================
      // PREPARE CUSTOMER NOTIFICATION
      // ==================================================

      let customerTitle =
        null;

      let customerMessage =
        null;

      let customerNotificationType =
        null;

      // ==================================================
      // PREPARE ASSISTANCE NOTIFICATION
      // ==================================================

      let assistanceTitle =
        null;

      let assistanceMessage =
        null;

      let assistanceNotificationType =
        null;

      // ==================================================
      // EN ROUTE TO CUSTOMER
      // ==================================================

      if (
        stage ===
        "EN_ROUTE_TO_CUSTOMER"
      ) {
        customerNotificationType =
          "TOW_EN_ROUTE_TO_CUSTOMER";

        customerTitle =
          "Tow Truck Journey Started";

        customerMessage =
          `${driverName} has started the journey with tow truck ${truckNumber} to your breakdown location.`;

        assistanceNotificationType =
          "TOW_DRIVER_EN_ROUTE_CUSTOMER";

        assistanceTitle =
          "External Driver Started Journey";

        assistanceMessage =
          `${driverName} with tow truck ${truckNumber} has started the journey to ${customerName}'s breakdown location.`;
      }

      // ==================================================
      // ARRIVED AT CUSTOMER
      // ==================================================

      else if (
        stage ===
        "ARRIVED_AT_CUSTOMER"
      ) {
        customerNotificationType =
          "TOW_ARRIVED_CUSTOMER";

        customerTitle =
          "Tow Truck Arrived";

        customerMessage =
          `Your tow truck ${truckNumber}, driven by ${driverName}, has arrived at your breakdown location.`;

        assistanceNotificationType =
          "TOW_REACHED_CUSTOMER";

        assistanceTitle =
          "Tow Truck Reached Customer";

        assistanceMessage =
          `${driverName} with tow truck ${truckNumber} has reached ${customerName} at the breakdown location.`;
      }

      // ==================================================
      // EN ROUTE TO GARAGE
      // ==================================================

      else if (
        stage ===
        "EN_ROUTE_TO_GARAGE"
      ) {
        customerNotificationType =
          "TOW_EN_ROUTE_TO_GARAGE";

        customerTitle =
          "Journey to Garage Started";

        customerMessage =
          `Your vehicle ${vehicleNumber} is now being transported to ${garageName}.`;

        assistanceNotificationType =
          "TOW_DRIVER_EN_ROUTE_GARAGE";

        assistanceTitle =
          "Tow Journey to Garage Started";

        assistanceMessage =
          `${driverName} has started transporting ${customerName}'s vehicle ${vehicleNumber} to ${garageName}.`;
      }

      // ==================================================
      // ARRIVED AT GARAGE
      // ==================================================

      else if (
        stage ===
        "ARRIVED_AT_GARAGE"
      ) {
        customerNotificationType =
          "TOW_ARRIVED_GARAGE";

        customerTitle =
          "Vehicle Arrived at Garage";

        customerMessage =
          `Your vehicle ${vehicleNumber} has arrived at ${garageName}. The external driver is completing the tow handover.`;

        assistanceNotificationType =
          "TOW_REACHED_GARAGE";

        assistanceTitle =
          "Tow Truck Reached Garage";

        assistanceMessage =
          `${driverName} with tow truck ${truckNumber} and customer vehicle ${vehicleNumber} has arrived at ${garageName}. Wait for the driver to complete the tow job before assigning a technician.`;
      }

      // ==================================================
      // COMPLETED
      // ==================================================

      else if (
        stage ===
        "COMPLETED"
      ) {
        customerNotificationType =
          "TOW_JOB_COMPLETED";

        customerTitle =
          "Tow Service Completed";

        customerMessage =
          `The tow service for your vehicle ${vehicleNumber} has been completed successfully at ${garageName}.`;

        assistanceNotificationType =
          "TOW_JOB_COMPLETED";

        assistanceTitle =
          "Tow Job Completed";

        assistanceMessage =
          `${driverName} has completed the tow job for ${customerName}'s vehicle ${vehicleNumber} at ${garageName}. The vehicle is now ready for technician assignment.`;
      }

      // ==================================================
      // CREATE CUSTOMER NOTIFICATION
      // ==================================================

      if (
        customerNotificationType &&
        Number.isInteger(
          garageId
        ) &&
        garageId > 0 &&
        Number.isInteger(
          customerId
        ) &&
        customerId > 0
      ) {
        const result =
          await createNotification({
            garageId,

            customerId,

            notificationType:
              customerNotificationType,

            title:
              customerTitle,

            message:
              customerMessage,

            targetPage:
              "mobility-recovery",

            referenceId:
              dispatchId,

            priority:
              "HIGH",
          });

        if (
          result.success
        ) {
          customerNotification = {
            created: true,

            notificationId:
              result.notificationId,
          };
        } else {
          console.error(
            "Customer journey notification creation failed:",
            result.error
          );
        }
      }

      // ==================================================
      // CREATE ASSISTANCE NOTIFICATION
      // ==================================================

      if (
        assistanceNotificationType &&
        Number.isInteger(
          garageId
        ) &&
        garageId > 0 &&
        Number.isInteger(
          assistanceId
        ) &&
        assistanceId > 0
      ) {
        const result =
          await createNotification({
            garageId,

            assistanceId,

            notificationType:
              assistanceNotificationType,

            title:
              assistanceTitle,

            message:
              assistanceMessage,

            targetPage:
              "incident-dispatch",

            referenceId:
              dispatchId,

            priority:
              "HIGH",
          });

        if (
          result.success
        ) {
          assistanceNotification = {
            created: true,

            notificationId:
              result.notificationId,
          };
        } else {
          console.error(
            "Assistance journey notification creation failed:",
            result.error
          );
        }
      }

      // ==================================================
      // RESPONSE MESSAGE FOR EACH JOURNEY STAGE
      // ==================================================

      const stageMessages = {
        EN_ROUTE_TO_CUSTOMER:
          "Journey to the breakdown vehicle started successfully.",

        ARRIVED_AT_CUSTOMER:
          "Arrival at the breakdown vehicle confirmed successfully.",

        EN_ROUTE_TO_GARAGE:
          "Journey to the selected garage started successfully.",

        ARRIVED_AT_GARAGE:
          "Arrival at the selected garage confirmed. Garage arrival date and time were recorded. Complete the tow job to hand the vehicle over for service.",

        COMPLETED:
          "Tow job completed successfully. The vehicle is now ready for technician assignment.",
      };

      // ==================================================
      // NORMALIZE FINAL STATUS
      // ==================================================

      const finalDispatchStatus =
        stage === "COMPLETED"
          ? "Completed"
          : stage;
                // ==================================================
      // RESPONSE
      // ==================================================

      return res
        .status(200)
        .json({
          success: true,

          message:
            stageMessages[
              stage
            ],

          dispatch: {
            dispatchId,

            previousStatus:
              currentStatus,

            dispatchStatus:
              finalDispatchStatus,

            requestId:
              dispatch.request_id
                ? Number(
                    dispatch.request_id
                  )
                : null,

            driverId,

            customerId:
              Number.isInteger(
                customerId
              )
                ? customerId
                : null,

            assistanceId:
              Number.isInteger(
                assistanceId
              )
                ? assistanceId
                : null,

            garageId:
              Number.isInteger(
                garageId
              )
                ? garageId
                : null,

            truckNumber,

            driverName,

            driverContact:
              dispatch.driver_contact ||
              null,

            customerName,

            vehicleNumber,

            garageName,

            // ============================================
            // SERVICE PROCESS LOCK INFORMATION
            // ============================================

            technicianAssignmentAllowed:
              stage ===
              "COMPLETED",

            serviceRequestStatus,

            customerStage,

            truckLatitude:
              dispatch.truck_latitude !==
                null &&
              dispatch.truck_latitude !==
                undefined
                ? Number(
                    dispatch.truck_latitude
                  )
                : null,

            truckLongitude:
              dispatch.truck_longitude !==
                null &&
              dispatch.truck_longitude !==
                undefined
                ? Number(
                    dispatch.truck_longitude
                  )
                : null,

            customerLatitude:
              dispatch.customer_latitude !==
                null &&
              dispatch.customer_latitude !==
                undefined
                ? Number(
                    dispatch.customer_latitude
                  )
                : null,

            customerLongitude:
              dispatch.customer_longitude !==
                null &&
              dispatch.customer_longitude !==
                undefined
                ? Number(
                    dispatch.customer_longitude
                  )
                : null,

            garageLatitude:
              dispatch.garage_latitude !==
                null &&
              dispatch.garage_latitude !==
                undefined
                ? Number(
                    dispatch.garage_latitude
                  )
                : null,

            garageLongitude:
              dispatch.garage_longitude !==
                null &&
              dispatch.garage_longitude !==
                undefined
                ? Number(
                    dispatch.garage_longitude
                  )
                : null,
          },

          customerNotification,

          assistanceNotification,
        });
    } catch (error) {
      console.error(
        "Update external driver journey stage error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            error.sqlMessage ||
            "Unable to update the external driver journey stage.",
        });
    }
  };

// ======================================================
// GET EXTERNAL DRIVER TOW HISTORY
//
// GET /api/tow-dispatches/driver/:driverId/history
//
// Only completed tow jobs are returned.
// Completed jobs are NOT returned by active assignments.
// ======================================================

const getExternalDriverTowHistory =
  async (req, res) => {
    try {
      const driverId = Number(
        req.params.driverId
      );

      if (
        !Number.isInteger(
          driverId
        ) ||
        driverId <= 0
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "A valid external driver ID is required.",
          });
      }

      // ==================================================
      // VERIFY DRIVER EXISTS + IS EXTERNAL
      // ==================================================

      const [driverRows] =
        await db.query(
          `
          SELECT
            driver_id,
            driver_status

          FROM truck_driver

          WHERE
            driver_id = ?

          LIMIT 1
          `,
          [driverId]
        );

      if (
        driverRows.length === 0
      ) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "External driver was not found.",
          });
      }

      const driverStatus =
        String(
          driverRows[0]
            .driver_status ||
            ""
        )
          .trim()
          .toLowerCase();

      if (
        driverStatus !==
        "external"
      ) {
        return res
          .status(403)
          .json({
            success: false,

            message:
              "This account is not an external tow truck driver.",
          });
      }

      // ==================================================
      // LOAD COMPLETED TOW JOBS
      // ==================================================

      const [history] =
        await db.query(
          `
          ${dispatchSelectQuery}

          WHERE
            td.truck_driver_driver_id = ?

            AND UPPER(
              TRIM(
                td.dispatch_status
              )
            ) = 'COMPLETED'

          ORDER BY
            td.dispatch_id DESC
          `,
          [driverId]
        );

      return res
        .status(200)
        .json({
          success: true,

          driverId,

          count:
            history.length,

          history,
        });
    } catch (error) {
      console.error(
        "Get external driver tow history error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            error.sqlMessage ||
            "Unable to load tow history.",
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

  getExternalDriverTowAssignments,

  getExternalDriverTowHistory,

  updateTowTruckRequestStatus,

  updateExternalDriverJourneyStage,
};