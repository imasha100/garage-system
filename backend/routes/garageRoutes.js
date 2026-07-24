const express = require("express");
const router = express.Router();

const {
  registerGarage,
  getAllGarages,
} = require("../controllers/garageController");

// Register Garage
router.post("/register", registerGarage);

// Get All Garages
router.get("/", getAllGarages);

module.exports = router;