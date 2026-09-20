const express = require("express");

const router = express.Router();

const {
  createServiceRequest,
  createWalkInServiceRequest,
  getServiceRequests,
  getServiceRequestById,
  acceptServiceRequest,
  rejectServiceRequest,
  getLatestCustomerRequest,
  updateCustomerStage,
  getVehiclesReadyForTechnician,
} = require("../controllers/serviceRequestController");


// ======================================================
// CREATE CUSTOMER SERVICE REQUEST
//
// POST /api/service-requests
//
// Normal customer/app request flow
// ======================================================

router.post(
  "/service-requests",
  createServiceRequest
);


// ======================================================
// CREATE MAJOR WALK-IN SERVICE REQUEST
//
// POST /api/service-requests/walk-in
//
// Used when a customer directly arrives at the garage
// without creating a request through the customer app.
//
// WALK-IN FLOW:
//
// Vehicle Arrives
//      ↓
// Initial Inspection
//      ↓
// Minor Repair / Major Repair
//
// MINOR:
// Quick/Small Repair Outside
//      ↓
// Payment
//      ↓
// Vehicle Leaves
//
// Minor repairs do NOT use:
// - Full Service Request flow
// - Technician Assignment flow
// - Service Job flow
//
// MAJOR:
// Walk-in Service Request
//      ↓
// Vehicle Check-in
//      ↓
// ARRIVED_AT_GARAGE
//      ↓
// Ready for Technician
//      ↓
// Existing Technician Assignment
//      ↓
// Service Job
//      ↓
// Repair
//      ↓
// Invoice / Payment
//      ↓
// Vehicle Handover
//
// IMPORTANT:
// This endpoint is for MAJOR walk-in repairs only.
// ======================================================

router.post(
  "/service-requests/walk-in",
  createWalkInServiceRequest
);


// ======================================================
// GET SERVICE REQUESTS
//
// GET /api/service-requests
//
// Optional filters:
//
// GET /api/service-requests?garageId=1&status=Pending
// ======================================================

router.get(
  "/service-requests",
  getServiceRequests
);


// ======================================================
// GET LATEST REQUEST OF CUSTOMER
//
// Example:
//
// GET /api/service-requests/customer/0712345678/latest
// ======================================================

router.get(
  "/service-requests/customer/:customerId/latest",
  getLatestCustomerRequest
);


// ======================================================
// GET VEHICLES READY FOR TECHNICIAN ASSIGNMENT
//
// GET
// /api/service-requests/garage/:garageId/ready-for-technician
//
// Returns requests where:
//
// - Request is Accepted
// - Vehicle has ARRIVED_AT_GARAGE
// - Service Job has not been created yet
//
// This includes MAJOR walk-in vehicles because
// they are created directly as:
//
// request_status = Accepted
// customer_stage = ARRIVED_AT_GARAGE
// ======================================================

router.get(
  "/service-requests/garage/:garageId/ready-for-technician",
  getVehiclesReadyForTechnician
);


// ======================================================
// GET SINGLE SERVICE REQUEST
//
// GET /api/service-requests/:id
// ======================================================

router.get(
  "/service-requests/:id",
  getServiceRequestById
);


// ======================================================
// ACCEPT NORMAL CUSTOMER SERVICE REQUEST
//
// PUT /api/service-requests/:id/accept
//
// Normal customer requests:
// Pending -> Accepted -> Navigation
//
// Major walk-in requests do not need this step because
// they are created directly as Accepted.
// ======================================================

router.put(
  "/service-requests/:id/accept",
  acceptServiceRequest
);


// ======================================================
// REJECT SERVICE REQUEST
//
// PUT /api/service-requests/:id/reject
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
//
// {
//   "stage": "ARRIVED_AT_GARAGE"
// }
// ======================================================

router.put(
  "/service-requests/:id/customer-stage",
  updateCustomerStage
);


module.exports = router;