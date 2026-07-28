const express = require("express");
const router = express.Router();

const {
  createExternalTruckRequest,
  getExternalTruckRequests,
  getExternalTruckRequestById,
  approveExternalTruckRequest,
  rejectExternalTruckRequest,
  releaseExternalTruck,
} = require("../controllers/externalTruckRequestController");

// =====================================================
// CREATE NEW EXTERNAL TRUCK REGISTRATION REQUEST
// POST /api/external-truck-requests
// =====================================================
router.post(
  "/external-truck-requests",
  createExternalTruckRequest
);

// =====================================================
// GET ALL REQUESTS
// Optional:
// ?garageId=1
// ?status=Pending
// =====================================================
router.get(
  "/external-truck-requests",
  getExternalTruckRequests
);

// =====================================================
// GET SINGLE REQUEST
// =====================================================
router.get(
  "/external-truck-requests/:id",
  getExternalTruckRequestById
);

// =====================================================
// APPROVE REQUEST
// =====================================================
router.put(
  "/external-truck-requests/:id/approve",
  approveExternalTruckRequest
);

// =====================================================
// REJECT REQUEST
// =====================================================
router.put(
  "/external-truck-requests/:id/reject",
  rejectExternalTruckRequest
);

// =====================================================
// RELEASE EXTERNAL TRUCK
// =====================================================
router.put(
  "/external-truck-requests/:id/release",
  releaseExternalTruck
);

module.exports = router;