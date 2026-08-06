const express = require("express");
const router = express.Router();

const {
  createInvoiceAndPayment,
  getGarageInvoiceHistory,
  getLatestCustomerInvoice,
} = require("../controllers/invoiceController");

// ======================================================
// CREATE INVOICE + PAYMENT + REDUCE STOCK
// POST /api/invoices/checkout
// ======================================================

router.post(
  "/invoices/checkout",
  createInvoiceAndPayment
);

// ======================================================
// GET GARAGE INVOICE / PAYMENT HISTORY
// GET /api/invoices/garage/:garageId/history
// ======================================================

router.get(
  "/invoices/garage/:garageId/history",
  getGarageInvoiceHistory
);

// ======================================================
// GET LATEST CUSTOMER INVOICE
// GET /api/invoices/customer/:contactNumber/:vehicleNumber/latest
// ======================================================

router.get(
  "/invoices/customer/:contactNumber/:vehicleNumber/latest",
  getLatestCustomerInvoice
);

module.exports = router;