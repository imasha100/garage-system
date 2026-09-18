const express = require("express");

const router = express.Router();

const {
  assignSupportTechnician,
  getGarageTechnicianAssistance,
  startTechnicianAssistance,
  completeTechnicianAssistance,
} = require("../controllers/technicianAssistanceController");

// ======================================================
// ASSIGN SUPPORT TECHNICIAN
// POST /api/technician-assistance/assign
// ======================================================

router.post(
  "/technician-assistance/assign",
  assignSupportTechnician
);

// ======================================================
// GET GARAGE TECHNICIAN ASSISTANCE
// GET /api/technician-assistance/garage/:garageId
// ======================================================

router.get(
  "/technician-assistance/garage/:garageId",
  getGarageTechnicianAssistance
);

// ======================================================
// START TECHNICIAN ASSISTANCE
// ASSIGNED -> IN_PROGRESS
// PUT /api/technician-assistance/:assistanceId/start
// ======================================================

router.put(
  "/technician-assistance/:assistanceId/start",
  startTechnicianAssistance
);

// ======================================================
// COMPLETE TECHNICIAN ASSISTANCE
// IN_PROGRESS -> COMPLETED
// PUT /api/technician-assistance/:assistanceId/complete
// ======================================================

router.put(
  "/technician-assistance/:assistanceId/complete",
  completeTechnicianAssistance
);

module.exports = router;