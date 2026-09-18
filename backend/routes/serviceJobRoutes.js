const express = require("express");

const router = express.Router();

const {
  assignTechnicianToJob,
  getTechnicianJobs,
  startServiceJob,
  completeServiceJob,
  clearCompletedVehicle,
  getGarageLiveDashboard,
  getGaragePerformanceAudit,
  getGarageJobHistory,
  getCustomerLiveProgress,
  getCompletedJobsForBilling,
  getCompletedVehiclesForClear,
} = require("../controllers/serviceJobController");

// ======================================================
// ASSIGN TECHNICIAN TO SERVICE REQUEST
// POST /api/service-jobs/assign
// ======================================================

router.post(
  "/service-jobs/assign",
  assignTechnicianToJob
);

// ======================================================
// GET JOBS ASSIGNED TO ONE TECHNICIAN
// GET /api/service-jobs/technician/:technicianId
// ======================================================

router.get(
  "/service-jobs/technician/:technicianId",
  getTechnicianJobs
);

// ======================================================
// GARAGE OWNER LIVE DASHBOARD
// GET /api/service-jobs/garage/:garageId/live-dashboard
// ======================================================

router.get(
  "/service-jobs/garage/:garageId/live-dashboard",
  getGarageLiveDashboard
);

// ======================================================
// GARAGE OWNER PERFORMANCE AUDIT
// GET /api/service-jobs/garage/:garageId/performance-audit
// ======================================================

router.get(
  "/service-jobs/garage/:garageId/performance-audit",
  getGaragePerformanceAudit
);

// ======================================================
// GARAGE JOB TECHNICIAN HISTORY
// GET /api/service-jobs/garage/:garageId/job-history
// ======================================================

router.get(
  "/service-jobs/garage/:garageId/job-history",
  getGarageJobHistory
);

// ======================================================
// COMPLETED JOBS FOR ASSISTANCE BILLING
// GET /api/service-jobs/garage/:garageId/completed-for-billing
// ======================================================

router.get(
  "/service-jobs/garage/:garageId/completed-for-billing",
  getCompletedJobsForBilling
);

// ======================================================
// COMPLETED VEHICLES WAITING TO BE CLEARED
// GET /api/service-jobs/garage/:garageId/completed-for-clear
// ======================================================

router.get(
  "/service-jobs/garage/:garageId/completed-for-clear",
  getCompletedVehiclesForClear
);

// ======================================================
// CUSTOMER LIVE PROGRESS
// GET /api/service-jobs/customer/:contactNumber/:vehicleNumber/live-progress
// ======================================================

router.get(
  "/service-jobs/customer/:contactNumber/:vehicleNumber/live-progress",
  getCustomerLiveProgress
);

// ======================================================
// START SERVICE JOB
// PUT /api/service-jobs/:jobId/start
// ======================================================

router.put(
  "/service-jobs/:jobId/start",
  startServiceJob
);

// ======================================================
// COMPLETE SERVICE JOB
// PUT /api/service-jobs/:jobId/complete
// ======================================================

router.put(
  "/service-jobs/:jobId/complete",
  completeServiceJob
);

// ======================================================
// CLEAR COMPLETED VEHICLE FROM GARAGE
// PUT /api/service-jobs/:jobId/clear
// ======================================================

router.put(
  "/service-jobs/:jobId/clear",
  clearCompletedVehicle
);

module.exports = router;