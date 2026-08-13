const express = require("express");
const router = express.Router();

const {
  createTowTruckRequest,
  getPendingTowTruckRequests,
  getTowTruckHistory,
  getTowTruckRequestById,
  getLatestTowTruckRequestByServiceRequestId,
  getExternalDriverTowAssignments,
  getExternalDriverTowHistory,
  updateTowTruckRequestStatus,
  updateExternalDriverJourneyStage,
} = require("../controllers/towDispatchController");


// ======================================================
// CREATE TOW TRUCK REQUEST
// Customer submits selected tow truck request
// POST /api/tow-dispatches
// ======================================================

router.post(
  "/tow-dispatches",
  createTowTruckRequest
);


// ======================================================
// GET PENDING TOW TRUCK REQUESTS
// Assistance Incident Dispatch page
// GET /api/tow-dispatches/pending
// ======================================================

router.get(
  "/tow-dispatches/pending",
  getPendingTowTruckRequests
);


// ======================================================
// GET TOW TRUCK HISTORY
// Logged-in Assistance Officer's handled requests
// GET /api/tow-dispatches/history?assistanceId=1
// ======================================================

router.get(
  "/tow-dispatches/history",
  getTowTruckHistory
);


// ======================================================
// GET EXTERNAL DRIVER TOW HISTORY
//
// Completed tow jobs only
//
// GET /api/tow-dispatches/driver/:driverId/history
//
// Example:
// GET /api/tow-dispatches/driver/19/history
// ======================================================

router.get(
  "/tow-dispatches/driver/:driverId/history",
  getExternalDriverTowHistory
);


// ======================================================
// GET EXTERNAL DRIVER TOW ASSIGNMENTS
// External Driver Dashboard + Tow Assignments
//
// Active assignments only
//
// GET /api/tow-dispatches/driver/:driverId
//
// Example:
// GET /api/tow-dispatches/driver/19
// ======================================================

router.get(
  "/tow-dispatches/driver/:driverId",
  getExternalDriverTowAssignments
);


// ======================================================
// GET LATEST TOW REQUEST BY SERVICE REQUEST ID
// Used when customer continues an existing request
// GET /api/tow-dispatches/request/:requestId/latest
// ======================================================

router.get(
  "/tow-dispatches/request/:requestId/latest",
  getLatestTowTruckRequestByServiceRequestId
);


// ======================================================
// GET SINGLE TOW TRUCK REQUEST BY DISPATCH ID
// Customer checks latest tow truck request status
// GET /api/tow-dispatches/:id
// ======================================================

router.get(
  "/tow-dispatches/:id",
  getTowTruckRequestById
);


// ======================================================
// UPDATE TOW TRUCK REQUEST STATUS
// Assistance approves, rejects, dispatches or completes
//
// PUT /api/tow-dispatches/:id/status
// ======================================================

router.put(
  "/tow-dispatches/:id/status",
  updateTowTruckRequestStatus
);


// ======================================================
// UPDATE EXTERNAL DRIVER JOURNEY STAGE
//
// External Driver journey:
//
// External Truck Location
//          ↓
// Breakdown Vehicle
//          ↓
// Selected Garage
//          ↓
// Complete Tow Job
//
// PUT /api/tow-dispatches/:id/journey-stage
//
// Body examples:
//
// 1. Start journey to customer
// {
//   "driverId": 19,
//   "stage": "EN_ROUTE_TO_CUSTOMER"
// }
//
// 2. Arrived at breakdown vehicle
// {
//   "driverId": 19,
//   "stage": "ARRIVED_AT_CUSTOMER"
// }
//
// 3. Start journey to garage
// {
//   "driverId": 19,
//   "stage": "EN_ROUTE_TO_GARAGE"
// }
//
// 4. Arrived at selected garage
// {
//   "driverId": 19,
//   "stage": "ARRIVED_AT_GARAGE"
// }
//
// 5. Complete tow job
// {
//   "driverId": 19,
//   "stage": "COMPLETED"
// }
// ======================================================

router.put(
  "/tow-dispatches/:id/journey-stage",
  updateExternalDriverJourneyStage
);


// ======================================================
// EXPORT ROUTER
// ======================================================

module.exports = router;