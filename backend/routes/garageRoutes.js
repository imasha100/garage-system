const express = require("express");

const router = express.Router();

const {
  registerGarage,
  getAllGarages,
  updateOutsideVehicleCount,
  getGarageLiveStatus,
  updateGarageOpenStatus,
} = require("../controllers/garageController");

// =======================================
// Register Garage
// =======================================
router.post("/register", registerGarage);

// =======================================
// Get All Garages
// =======================================
router.get("/", getAllGarages);

// =======================================
// Update AI Outside Vehicle Count
// =======================================
router.post("/outside-count", updateOutsideVehicleCount);

// =======================================
// Get Single Garage Live Status
// =======================================
router.get("/:garageId/live-status", getGarageLiveStatus);

// =======================================
// Update Garage OPEN / CLOSED Status
// =======================================
router.put("/:garageId/open-status", updateGarageOpenStatus);

module.exports = router;