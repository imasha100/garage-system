const express = require("express");
const router = express.Router();

const {
  createServiceRequest,
  getServiceRequests,
  getServiceRequestById,
  acceptServiceRequest,
  rejectServiceRequest,
  getLatestCustomerRequest,
  updateCustomerStage,
} = require("../controllers/serviceRequestController");

// ======================================================
// CREATE CUSTOMER SERVICE REQUEST
// POST /api/service-requests
// ======================================================

router.post(
  "/service-requests",
  createServiceRequest
);

// ======================================================
// GET SERVICE REQUESTS
// ======================================================

router.get(
  "/service-requests",
  getServiceRequests
);

// ======================================================
// GET LATEST REQUEST OF CUSTOMER
//
// GET /api/service-requests/customer/0712345678/latest
// ======================================================

router.get(
  "/service-requests/customer/:customerId/latest",
  getLatestCustomerRequest
);

// ======================================================
// GET SINGLE SERVICE REQUEST
// ======================================================

router.get(
  "/service-requests/:id",
  getServiceRequestById
);

// ======================================================
// ACCEPT SERVICE REQUEST
// ======================================================

router.put(
  "/service-requests/:id/accept",
  acceptServiceRequest
);

// ======================================================
// REJECT SERVICE REQUEST
// ======================================================

router.put(
  "/service-requests/:id/reject",
  rejectServiceRequest
);

// ======================================================
// UPDATE CUSTOMER FLOW STAGE
//
// PUT /api/service-requests/:id/customer-stage
//
// Example body:
// {
//   "stage": "ARRIVED_AT_GARAGE"
// }
// ======================================================

router.put(
  "/service-requests/:id/customer-stage",
  updateCustomerStage
);

module.exports = router;