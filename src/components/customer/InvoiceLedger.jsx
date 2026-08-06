import React, { useEffect, useMemo, useState } from "react";
import {
  Download,
  Receipt,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  User,
  Car,
  CreditCard,
} from "lucide-react";
import jsPDF from "jspdf";

const API_BASE = "http://localhost:5000";

export default function InvoiceLedger() {
  // ======================================================
  // CUSTOMER SESSION
  // ======================================================

  const customerRequest = useMemo(() => {
    try {
      const stored =
        sessionStorage.getItem(
          "latestServiceRequest"
        );

      return stored
        ? JSON.parse(stored)
        : null;
    } catch (error) {
      console.error(
        "Unable to read customer request:",
        error
      );

      return null;
    }
  }, []);

  // ======================================================
  // CUSTOMER DETAILS
  // ======================================================

  const contactNumber = String(
    customerRequest?.contactNumber ??
      customerRequest?.contact_number ??
      customerRequest?.customerContact ??
      ""
  ).trim();

  const vehicleNumber = String(
    customerRequest?.vehicleNumber ??
      customerRequest?.vehicle_number ??
      ""
  ).trim();

  // ======================================================
  // INVOICE STATE
  // ======================================================

  const [invoice, setInvoice] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ======================================================
  // LOAD CUSTOMER INVOICE
  // ======================================================

  const loadCustomerInvoice =
    async () => {
      try {
        setLoading(true);
        setError("");

        if (
          !contactNumber ||
          !vehicleNumber
        ) {
          throw new Error(
            "Customer contact number or vehicle number could not be identified."
          );
        }

        const response = await fetch(
          `${API_BASE}/api/invoices/customer/${encodeURIComponent(
            contactNumber
          )}/${encodeURIComponent(
            vehicleNumber
          )}/latest`
        );

        const result =
          await response.json();

        if (
          !response.ok ||
          result.success === false
        ) {
          throw new Error(
            result.message ||
              "Unable to load invoice."
          );
        }

        setInvoice(
          result.invoice || null
        );
      } catch (error) {
        console.error(
          "Load customer invoice error:",
          error
        );

        setInvoice(null);

        setError(
          error.message ||
            "Unable to load invoice."
        );
      } finally {
        setLoading(false);
      }
    };

  // ======================================================
  // LOAD WHEN PAGE OPENS
  // ======================================================

  useEffect(() => {
    loadCustomerInvoice();
  }, [
    contactNumber,
    vehicleNumber,
  ]);

  // ======================================================
  // FORMAT DATE
  // ======================================================

  const formatDate = (value) => {
    if (!value) {
      return "-";
    }

    return String(value)
      .split("T")[0];
  };

  // ======================================================
  // DOWNLOAD RECEIPT
  // ======================================================

  const handleDownloadReceipt = () => {
    if (!invoice) {
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(18);

    doc.text(
      "OFFICIAL RECEIPT",
      20,
      20
    );

    doc.setFontSize(11);

    doc.text(
      `Ticket: ${
        invoice.ticketNumber || "-"
      }`,
      20,
      32
    );

    doc.text(
      `Customer: ${
        invoice.customerName ||
        "Customer"
      }`,
      20,
      40
    );

    doc.text(
      `Contact: ${
        invoice.contactNumber || "-"
      }`,
      20,
      48
    );

    doc.text(
      `Vehicle: ${
        invoice.vehicleNumber || "-"
      }`,
      20,
      56
    );

    if (invoice.vehicleType) {
      doc.text(
        `Vehicle Type: ${invoice.vehicleType}`,
        20,
        64
      );
    }

    doc.text(
      `Invoice ID: INV-${invoice.invoiceId}`,
      20,
      76
    );

    doc.text(
      `Payment Ref: ${
        invoice.paymentId
          ? `PAY-${invoice.paymentId}`
          : "-"
      }`,
      20,
      84
    );

    doc.text(
      `Invoice Date: ${formatDate(
        invoice.invoiceDate
      )}`,
      20,
      92
    );

    doc.text(
      `Payment Method: ${
        invoice.paymentMethod || "-"
      }`,
      20,
      100
    );

    doc.text(
      "------------------------------------------",
      20,
      110
    );

    let y = 120;

    const items =
      Array.isArray(invoice.items)
        ? invoice.items
        : [];

    items.forEach(
      (item, index) => {
        const quantity = Number(
          item.quantity || 0
        );

        const unitPrice = Number(
          item.unitPrice || 0
        );

        const lineTotal = Number(
          item.lineTotal || 0
        );

        doc.text(
          `${index + 1}. ${
            item.itemName || "Item"
          }`,
          20,
          y
        );

        y += 7;

        doc.text(
          `Qty ${quantity} x LKR ${unitPrice.toFixed(
            2
          )}`,
          25,
          y
        );

        doc.text(
          `LKR ${lineTotal.toFixed(
            2
          )}`,
          145,
          y
        );

        y += 11;
      }
    );

    doc.text(
      "------------------------------------------",
      20,
      y
    );

    y += 10;

    doc.setFontSize(13);

    doc.text(
      `TOTAL PAID: LKR ${Number(
        invoice.amountPaid ??
          invoice.finalAmount ??
          0
      ).toFixed(2)}`,
      20,
      y
    );

    y += 10;

    doc.setFontSize(11);

    doc.text(
      "STATUS: PAID",
      20,
      y
    );

    doc.save(
      `Receipt_${
        invoice.ticketNumber ||
        invoice.invoiceId
      }.pdf`
    );
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="w-full h-full min-h-[500px] flex items-center justify-center text-slate-300 font-mono">
        <div className="text-center">
          <RefreshCw className="w-7 h-7 mx-auto mb-3 animate-spin text-emerald-400" />

          <p className="text-sm">
            Loading invoice...
          </p>
        </div>
      </div>
    );
  }

  // ======================================================
  // ERROR / NO INVOICE
  // ======================================================

  if (error || !invoice) {
    return (
      <div className="w-full h-full text-slate-300 font-mono overflow-y-auto">
        <div className="p-4 md:p-8">

          <div className="max-w-xl mx-auto border border-slate-800 bg-[#0c1219] p-6">

            <AlertCircle className="w-9 h-9 text-amber-400 mb-4" />

            <h2 className="text-white font-black text-lg">
              NO INVOICE AVAILABLE
            </h2>

            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
              {error ||
                "No invoice has been created for this vehicle yet."}
            </p>

            <button
              type="button"
              onClick={
                loadCustomerInvoice
              }
              className="mt-5 flex items-center justify-center gap-2 border border-emerald-500 text-emerald-400 px-4 py-2.5 text-xs hover:bg-emerald-500/10"
            >
              <RefreshCw
                size={15}
              />

              REFRESH
            </button>

          </div>

        </div>
      </div>
    );
  }

  // ======================================================
  // VALUES
  // ======================================================

  const invoiceItems =
    Array.isArray(invoice.items)
      ? invoice.items
      : [];

  const finalAmount = Number(
    invoice.finalAmount || 0
  );

  const amountPaid = Number(
    invoice.amountPaid ??
      finalAmount
  );

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="w-full h-full text-slate-300 font-mono overflow-y-auto">

      <div className="p-4 md:p-8">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5 border-b border-slate-900 pb-5">

          <div>

            <p className="text-[10px] text-slate-500 tracking-widest">
              INVOICE LEDGER
            </p>

            <h2 className="text-white font-black text-lg md:text-xl mt-1">

              {invoice.ticketNumber ||
                `INV-${invoice.invoiceId}`}

            </h2>

            <div className="mt-2 flex items-center gap-2">

              <span className="inline-flex items-center gap-1.5 border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-400">

                <CheckCircle
                  size={13}
                />

                PAID

              </span>

              <span className="text-[10px] text-slate-500">
                Invoice #{invoice.invoiceId}
              </span>

            </div>

          </div>

          <div className="text-left lg:text-right">

            <p className="text-[10px] text-slate-500">
              TOTAL PAID
            </p>

            <h1 className="text-2xl md:text-3xl font-black text-emerald-400 mt-1">

              LKR{" "}

              {amountPaid.toLocaleString(
                undefined,
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              )}

            </h1>

          </div>

        </div>

        {/* ==================================================
            CUSTOMER / VEHICLE
        ================================================== */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-5">

          <div className="bg-[#0c1219] border border-slate-900 p-4">

            <div className="flex items-center gap-2 text-slate-500 mb-3">

              <User
                size={15}
              />

              <span className="text-[10px] tracking-widest">
                CUSTOMER
              </span>

            </div>

            <p className="text-sm font-bold text-white">
              {invoice.customerName ||
                "Customer"}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {invoice.contactNumber ||
                contactNumber}
            </p>

          </div>

          <div className="bg-[#0c1219] border border-slate-900 p-4">

            <div className="flex items-center gap-2 text-slate-500 mb-3">

              <Car
                size={15}
              />

              <span className="text-[10px] tracking-widest">
                VEHICLE
              </span>

            </div>

            <p className="text-sm font-bold text-white">
              {invoice.vehicleNumber ||
                vehicleNumber}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {invoice.vehicleType ||
                "Vehicle"}
            </p>

          </div>

        </div>

        {/* ==================================================
            BILL ITEMS
        ================================================== */}

        <div className="mt-6">

          <div className="flex items-center gap-2 mb-3">

            <Receipt
              size={16}
              className="text-emerald-400"
            />

            <h3 className="text-xs font-bold tracking-widest text-slate-400">
              BILL BREAKDOWN
            </h3>

          </div>

          <div className="space-y-2 max-h-[330px] overflow-y-auto pr-1">

            {invoiceItems.map(
              (item) => {

                const quantity =
                  Number(
                    item.quantity || 0
                  );

                const unitPrice =
                  Number(
                    item.unitPrice ||
                      0
                  );

                const lineTotal =
                  Number(
                    item.lineTotal ||
                      0
                  );

                return (
                  <div
                    key={
                      item.invoiceItemId
                    }
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0c1219] border border-slate-900 p-4"
                  >

                    <div className="min-w-0">

                      <h3 className="text-sm text-white font-bold">
                        {item.itemName}
                      </h3>

                      <p className="text-[11px] text-slate-500 mt-1">

                        Qty {quantity}

                        {" × "}

                        LKR{" "}

                        {unitPrice.toLocaleString(
                          undefined,
                          {
                            minimumFractionDigits:
                              2,
                          }
                        )}

                      </p>

                    </div>

                    <span className="text-sm font-bold text-white shrink-0">

                      LKR{" "}

                      {lineTotal.toLocaleString(
                        undefined,
                        {
                          minimumFractionDigits:
                            2,
                        }
                      )}

                    </span>

                  </div>
                );
              }
            )}

          </div>

        </div>

        {/* ==================================================
            TOTAL BREAKDOWN
        ================================================== */}

        <div className="mt-6 bg-[#0c1219] border border-slate-900 p-4">

          <div className="space-y-3 text-xs">

            <div className="flex justify-between gap-4">

              <span className="text-slate-500">
                Subtotal
              </span>

              <span className="text-white">

                LKR{" "}

                {Number(
                  invoice.totalAmount ||
                    0
                ).toFixed(2)}

              </span>

            </div>

            <div className="flex justify-between gap-4">

              <span className="text-slate-500">
                Tax
              </span>

              <span className="text-white">

                LKR{" "}

                {Number(
                  invoice.taxAmount ||
                    0
                ).toFixed(2)}

              </span>

            </div>

            <div className="flex justify-between gap-4">

              <span className="text-slate-500">
                Discount
              </span>

              <span className="text-white">

                LKR{" "}

                {Number(
                  invoice.discountAmount ||
                    0
                ).toFixed(2)}

              </span>

            </div>

            <div className="border-t border-slate-800 pt-3 flex justify-between gap-4">

              <span className="font-bold text-emerald-400">
                FINAL TOTAL
              </span>

              <span className="text-lg font-black text-emerald-400">

                LKR{" "}

                {finalAmount.toFixed(
                  2
                )}

              </span>

            </div>

          </div>

        </div>

        {/* ==================================================
            PAYMENT INFORMATION
        ================================================== */}

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">

          <div className="bg-[#0c1219] border border-emerald-500/30 p-4">

            <div className="flex items-center gap-2">

              <CreditCard
                size={17}
                className="text-emerald-400"
              />

              <p className="text-[10px] text-slate-500 tracking-widest">
                PAYMENT METHOD
              </p>

            </div>

            <p className="mt-3 text-sm text-white font-bold">

              {invoice.paymentMethod ||
                "Paid"}

            </p>

            {invoice.paymentId && (

              <p className="mt-1 text-[10px] text-slate-500">

                Reference: PAY-
                {invoice.paymentId}

              </p>

            )}

          </div>

          <div className="bg-[#0c1219] border border-slate-900 p-4">

            <p className="text-[10px] text-slate-500 tracking-widest">
              PAYMENT DATE
            </p>

            <p className="mt-3 text-sm text-white font-bold">
              {formatDate(
                invoice.paymentDate ||
                  invoice.invoiceDate
              )}
            </p>

            {invoice.paymentTime && (

              <p className="mt-1 text-[10px] text-slate-500">
                {invoice.paymentTime}
              </p>

            )}

          </div>

        </div>

        {/* ==================================================
            DOWNLOAD RECEIPT
        ================================================== */}

        <div className="mt-5 pb-10">

          <button
            type="button"
            onClick={
              handleDownloadReceipt
            }
            className="w-full border border-emerald-500 text-emerald-400 hover:bg-emerald-500/10 py-3 text-xs font-black flex items-center justify-center gap-2 transition"
          >

            <Download className="w-4 h-4" />

            DOWNLOAD RECEIPT

          </button>

        </div>

      </div>

    </div>
  );
}