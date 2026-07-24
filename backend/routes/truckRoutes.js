const express = require("express");
const router = express.Router();

const {
  registerTruck,
  getAllTrucks,
  getTruckById,
  updateTruck,
} = require("../controllers/truckController");

// ======================================================
// REGISTER TOW TRUCK AND DRIVER
// POST /api/trucks
// ======================================================

router.post(
  "/trucks",
  registerTruck
);

// ======================================================
// GET ALL TOW TRUCKS
// GET /api/trucks
// GET /api/trucks?garageId=1
// ======================================================

router.get(
  "/trucks",
  getAllTrucks
);

// ======================================================
// GET SINGLE TOW TRUCK
// GET /api/trucks/:id
// ======================================================

router.get(
  "/trucks/:id",
  getTruckById
);

// ======================================================
// UPDATE TOW TRUCK AND DRIVER
// PUT /api/trucks/:id
// ======================================================

router.put(
  "/trucks/:id",
  updateTruck
);

module.exports = router;