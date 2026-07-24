const express = require("express");
const router = express.Router();

const {
  getOwnerProfile,
} = require("../controllers/ownerController");

router.get("/profile/:loginId", getOwnerProfile);

module.exports = router;