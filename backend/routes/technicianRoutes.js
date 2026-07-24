const express = require("express");
const router = express.Router();

const {
  getNextTechnicianId,
  registerTechnician,
  getAllTechnicians,
  getTechnicianById,
  updateTechnician,
  updateTechnicianShiftStatus,
} = require("../controllers/technicianController");

// ========================================
// Get Next Technician ID
// ========================================
router.get("/technicians/next-id", getNextTechnicianId);

// ========================================
// Register Technician
// ========================================
router.post("/technicians", registerTechnician);

// ========================================
// Get All Technicians
// ========================================
router.get("/technicians", getAllTechnicians);

// ========================================
// Update Technician Shift Status
// මේ route එක /technicians/:id ට කලින් තියෙන්න ඕනේ
// ========================================
router.put(
  "/technicians/:id/shift-status",
  updateTechnicianShiftStatus
);

// ========================================
// Get Single Technician
// ========================================
router.get("/technicians/:id", getTechnicianById);

// ========================================
// Update Technician
// ========================================
router.put("/technicians/:id", updateTechnician);

module.exports = router;