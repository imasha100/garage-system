const express = require("express");
const router = express.Router();

const {
  createTowTruckRequest,
  getPendingTowTruckRequests,
  getTowTruckHistory,
  getTowTruckRequestById,
  getLatestTowTruckRequestByServiceRequestId,
  updateTowTruckRequestStatus,
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
// PUT /api/tow-dispatches/:id/status
// ======================================================

router.put(
  "/tow-dispatches/:id/status",
  updateTowTruckRequestStatus
);

module.exports = router;