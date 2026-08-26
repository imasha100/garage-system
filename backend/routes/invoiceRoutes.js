const express = require("express");

const router = express.Router();

const {
  createInvoiceAndPayment,
  confirmInvoicePayment,
  getGarageInvoiceHistory,
  getLatestCustomerInvoice,
} = require("../controllers/invoiceController");

// ======================================================
// CREATE INVOICE ONLY
//
// POST /api/invoices/checkout
//
// FLOW:
// Assistance creates bill
// -> Invoice created
// -> No payment record yet
// -> Customer sees UNPAID
// ======================================================

router.post(
  "/invoices/checkout",
  createInvoiceAndPayment
);

// ======================================================
// CONFIRM INVOICE PAYMENT
//
// POST /api/invoices/:invoiceId/confirm-payment
//
// FLOW:
// Customer pays Cash / POS
// -> Assistance confirms payment
// -> Payment record created
// -> Customer sees PAID
// ======================================================

router.post(
  "/invoices/:invoiceId/confirm-payment",
  confirmInvoicePayment
);

// ======================================================
// GET GARAGE INVOICE / PAYMENT HISTORY
//
// GET /api/invoices/garage/:garageId/history
// ======================================================

router.get(
  "/invoices/garage/:garageId/history",
  getGarageInvoiceHistory
);

// ======================================================
// GET LATEST CUSTOMER INVOICE
//
// GET
// /api/invoices/customer/:contactNumber/:vehicleNumber/latest
//
// Returns:
// payment record exists     -> PAID
// payment record not exists -> UNPAID
// ======================================================

router.get(
  "/invoices/customer/:contactNumber/:vehicleNumber/latest",
  getLatestCustomerInvoice
);

// ======================================================
// EXPORT ROUTER
// ======================================================

module.exports = router;