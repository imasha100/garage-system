const express = require("express");
const router = express.Router();

const {
  externalDriverLogin,
  changeExternalDriverPassword,
} = require("../controllers/externalDriverController");

// ======================================================
// EXTERNAL DRIVER LOGIN
// POST /api/external-driver/login
// ======================================================

router.post(
  "/external-driver/login",
  externalDriverLogin
);

// ======================================================
// CHANGE EXTERNAL DRIVER PASSWORD
// PUT /api/external-driver/change-password
// ======================================================

router.put(
  "/external-driver/change-password",
  changeExternalDriverPassword
);

// ======================================================
// EXPORT ROUTER
// ======================================================

module.exports = router;