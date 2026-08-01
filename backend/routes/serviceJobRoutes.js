const express = require("express");
const router = express.Router();

const {
  assignTechnicianToJob,
  getTechnicianJobs,
  startServiceJob,
  completeServiceJob,
  getGarageLiveDashboard,
  getGaragePerformanceAudit,
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
// START SERVICE JOB / ADD TO ACTIVE WORKLOAD
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

module.exports = router;