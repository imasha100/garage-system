const express = require("express");

const {
  getVehicleTypes,
} = require("../controllers/vehicleTypeController");

const router = express.Router();

router.get(
  "/vehicle-types",
  getVehicleTypes
);

module.exports = router;