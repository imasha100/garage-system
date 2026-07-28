const express = require("express");
const router = express.Router();

const {
  createServiceRequest,
  getServiceRequests,
  getServiceRequestById,
  acceptServiceRequest,
  rejectServiceRequest,
  getLatestCustomerRequest,
} = require(
  "../controllers/serviceRequestController"
);

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
//
// Examples:
// GET /api/service-requests
// GET /api/service-requests?garageId=1
// GET /api/service-requests?garageId=1&status=Pending
// ======================================================

router.get(
  "/service-requests",
  getServiceRequests
);

// ======================================================
// GET LATEST REQUEST OF CUSTOMER
//
// GET /api/service-requests/customer/1/latest
// ======================================================

router.get(
  "/service-requests/customer/:customerId/latest",
  getLatestCustomerRequest
);

// ======================================================
// GET SINGLE SERVICE REQUEST
//
// GET /api/service-requests/10
// ======================================================

router.get(
  "/service-requests/:id",
  getServiceRequestById
);

// ======================================================
// ACCEPT SERVICE REQUEST
//
// PUT /api/service-requests/10/accept
//
// Body:
// {
//   "assistanceId": 1
// }
// ======================================================

router.put(
  "/service-requests/:id/accept",
  acceptServiceRequest
);

// ======================================================
// REJECT SERVICE REQUEST
//
// PUT /api/service-requests/10/reject
// ======================================================

router.put(
  "/service-requests/:id/reject",
  rejectServiceRequest
);

module.exports = router;