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

  const [paymentReady, setPaymentReady] =
    useState(false);

  const [readyInSeconds, setReadyInSeconds] =
    useState(0);

  // ======================================================
  // LOAD CUSTOMER INVOICE
  //
  // CUSTOMER RULE:
  // - Assistance can create the bill immediately.
  // - Customer can view it only 1 minute after the
  //   service job has been completed.
  // - Same rule for Driveable and Non-Driveable.
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

        // ------------------------------------------------------
        // STEP 1: CHECK CUSTOMER SERVICE JOB
        // ------------------------------------------------------

        const progressResponse = await fetch(
          `${API_BASE}/api/service-jobs/customer/${encodeURIComponent(
            contactNumber
          )}/${encodeURIComponent(
            vehicleNumber
          )}/live-progress`
        );

        const progressResult =
          await progressResponse.json();

        if (
          !progressResponse.ok ||
          progressResult.success === false ||
          !progressResult.job
        ) {
          setPaymentReady(false);
          setInvoice(null);

          throw new Error(
            progressResult.message ||
              "Service details are not available yet."
          );
        }

        const currentJob =
          progressResult.job;

        const jobStatus = String(
          currentJob.jobStatus || ""
        )
          .trim()
          .toUpperCase();

        // ------------------------------------------------------
        // STEP 2: JOB MUST BE COMPLETED
        // ------------------------------------------------------

        if (jobStatus !== "COMPLETED") {
          setPaymentReady(false);
          setReadyInSeconds(0);
          setInvoice(null);

          throw new Error(
            "Your service is still in progress. The bill will be available after the service is completed."
          );
        }

        // ------------------------------------------------------
        // STEP 3: WAIT 1 MINUTE AFTER COMPLETION
        // ------------------------------------------------------

        const completionTime =
          currentJob.actualCompletionTime;

        if (!completionTime) {
          setPaymentReady(false);
          setReadyInSeconds(0);
          setInvoice(null);

          throw new Error(
            "Your service has been completed. Please wait while the payment process is being prepared."
          );
        }

        const completionDate =
          new Date(completionTime);

        if (
          Number.isNaN(
            completionDate.getTime()
          )
        ) {
          setPaymentReady(false);
          setReadyInSeconds(0);
          setInvoice(null);

          throw new Error(
            "The service completion time could not be verified."
          );
        }

        const readyAt =
          completionDate.getTime() +
          1 * 60 * 1000;

        const remainingMilliseconds =
          readyAt - Date.now();

        if (
          remainingMilliseconds > 0
        ) {
          const remainingSeconds =
            Math.ceil(
              remainingMilliseconds /
                1000
            );

          setPaymentReady(false);
          setReadyInSeconds(
            remainingSeconds
          );
          setInvoice(null);

          const minutes =
            Math.floor(
              remainingSeconds / 60
            );

          const seconds =
            remainingSeconds % 60;

          throw new Error(
            `Your vehicle service is complete. The bill will be available for payment in ${minutes}:${String(
              seconds
            ).padStart(2, "0")}.`
          );
        }

        setPaymentReady(true);
        setReadyInSeconds(0);

        // ------------------------------------------------------
        // STEP 4: LOAD CUSTOMER INVOICE ONLY AFTER 1 MINUTE
        // ------------------------------------------------------

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
              "Your bill is being prepared. Please refresh shortly."
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

    const interval =
      setInterval(() => {
        loadCustomerInvoice();
      }, 5000);

    return () =>
      clearInterval(interval);
  }, [
    contactNumber,
    vehicleNumber,
  ]);

  // ======================================================
  // LIVE PAYMENT COUNTDOWN - UPDATE EVERY SECOND
  // ======================================================

  useEffect(() => {
    if (readyInSeconds <= 0) {
      return;
    }

    const countdownInterval =
      setInterval(() => {
        setReadyInSeconds(
          (previousSeconds) => {
            if (
              previousSeconds <= 1
            ) {
              return 0;
            }

            return (
              previousSeconds - 1
            );
          }
        );
      }, 1000);

    return () => {
      clearInterval(
        countdownInterval
      );
    };
  }, [
    readyInSeconds > 0,
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

    const paymentIsConfirmed =
      String(
        invoice.paymentStatus || ""
      )
        .trim()
        .toUpperCase() === "PAID" ||
      Boolean(invoice.paymentId);

    if (!paymentIsConfirmed) {
      return;
    }

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth =
      doc.internal.pageSize.getWidth();

    const pageHeight =
      doc.internal.pageSize.getHeight();

    const margin = 14;

    const contentWidth =
      pageWidth -
      margin * 2;

    // ======================================================
    // RECEIPT COLORS
    // ======================================================

    const navy = [8, 18, 38];
    const blue = [37, 99, 235];
    const lightBlue = [239, 246, 255];
    const green = [5, 150, 105];
    const lightGreen = [236, 253, 245];
    const dark = [17, 24, 39];
    const gray = [107, 114, 128];
    const border = [226, 232, 240];
    const white = [255, 255, 255];
    const soft = [248, 250, 252];

    // ======================================================
    // HELPERS
    // ======================================================

    const money = (value) =>
      Number(
        value || 0
      ).toLocaleString(
        "en-US",
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      );

    const safeText = (
      value,
      fallback = "-"
    ) => {
      const textValue =
        String(
          value ?? ""
        ).trim();

      return (
        textValue ||
        fallback
      );
    };

    // ======================================================
    // DATA
    // ======================================================

    const invoiceNo =
      `INV-${
        invoice.invoiceId
      }`;

    const paymentRef =
      invoice.paymentId
        ? `PAY-${
            invoice.paymentId
          }`
        : "-";

    const ticketNo =
      safeText(
        invoice.ticketNumber,
        `${
          invoice.vehicleNumber ||
          vehicleNumber
        }-${invoiceNo}`
      );

    const customerName =
      safeText(
        invoice.customerName,
        "Customer"
      );

    const contact =
      safeText(
        invoice.contactNumber ||
        contactNumber
      );

    const vehicle =
      safeText(
        invoice.vehicleNumber ||
        vehicleNumber
      );

    const vehicleType =
      safeText(
        invoice.vehicleType,
        "Vehicle"
      );

    const paymentDate =
      formatDate(
        invoice.paymentDate ||
        invoice.invoiceDate
      );

    const paymentTime =
      safeText(
        invoice.paymentTime
      );

    const paymentMethod =
      safeText(
        invoice.paymentMethod,
        "Paid"
      );

    const subtotal =
      Number(
        invoice.totalAmount ||
        0
      );

    const tax =
      Number(
        invoice.taxAmount ||
        0
      );

    const discount =
      Number(
        invoice.discountAmount ||
        0
      );

    const totalPaid =
      Number(
        invoice.amountPaid ??
        invoice.finalAmount ??
        0
      );

    const items =
      Array.isArray(
        invoice.items
      )
        ? invoice.items
        : [];

    // ======================================================
    // HEADER
    // ======================================================

    doc.setFillColor(
      ...navy
    );

    doc.roundedRect(
      margin,
      12,
      contentWidth,
      44,
      4,
      4,
      "F"
    );

    doc.setFillColor(
      ...blue
    );

    doc.roundedRect(
      margin + 5,
      17,
      10,
      34,
      3,
      3,
      "F"
    );

    doc.setTextColor(
      ...white
    );

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(19);

    doc.text(
      "MAGIC TOUCH",
      margin + 21,
      26
    );

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(8.5);

    doc.text(
      "AUTOMOBILE REPAIR & SERVICE CENTER",
      margin + 21,
      33
    );

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(10);

    doc.text(
      "OFFICIAL SERVICE RECEIPT",
      margin + 21,
      42
    );

    doc.setFillColor(
      ...green
    );

    doc.roundedRect(
      pageWidth -
      margin -
      36,
      21,
      28,
      12,
      4,
      4,
      "F"
    );

    doc.setTextColor(
      ...white
    );

    doc.setFontSize(10);

    doc.text(
      "PAID",
      pageWidth -
      margin -
      22,
      28.5,
      {
        align:
          "center",
      }
    );

    // ======================================================
    // TICKET / INVOICE SUMMARY
    // ======================================================

    let y = 64;

    doc.setFillColor(
      ...lightBlue
    );

    doc.setDrawColor(
      ...border
    );

    doc.roundedRect(
      margin,
      y,
      contentWidth,
      22,
      3,
      3,
      "FD"
    );

    const metaWidth =
      contentWidth / 3;

    const drawMeta = (
      title,
      value,
      x,
      valueColor = dark
    ) => {
      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.setFontSize(7);

      doc.setTextColor(
        ...gray
      );

      doc.text(
        title,
        x,
        y + 7
      );

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(9.5);

      doc.setTextColor(
        ...valueColor
      );

      doc.text(
        safeText(value),
        x,
        y + 15
      );
    };

    drawMeta(
      "TICKET",
      ticketNo,
      margin + 6,
      blue
    );

    drawMeta(
      "INVOICE",
      invoiceNo,
      margin +
      metaWidth +
      3
    );

    drawMeta(
      "PAYMENT REF",
      paymentRef,
      margin +
      metaWidth * 2 +
      1,
      green
    );

    // ======================================================
    // CUSTOMER / VEHICLE CARD
    // ======================================================

    y += 30;

    doc.setTextColor(
      ...dark
    );

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(11);

    doc.text(
      "CUSTOMER & VEHICLE",
      margin,
      y
    );

    y += 5;

    const gap = 6;

    const cardWidth =
      (
        contentWidth -
        gap
      ) / 2;

    const drawCard = (
      x,
      title,
      primary,
      secondary
    ) => {
      doc.setFillColor(
        ...soft
      );

      doc.setDrawColor(
        ...border
      );

      doc.roundedRect(
        x,
        y,
        cardWidth,
        31,
        3,
        3,
        "FD"
      );

      doc.setFillColor(
        ...blue
      );

      doc.roundedRect(
        x + 4,
        y + 5,
        3,
        21,
        1,
        1,
        "F"
      );

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.setFontSize(7);

      doc.setTextColor(
        ...gray
      );

      doc.text(
        title,
        x + 11,
        y + 8
      );

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(10);

      doc.setTextColor(
        ...dark
      );

      const primaryText =
        doc.splitTextToSize(
          safeText(primary),
          cardWidth - 16
        )[0];

      doc.text(
        primaryText,
        x + 11,
        y + 17
      );

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.setFontSize(8);

      doc.setTextColor(
        ...gray
      );

      doc.text(
        safeText(secondary),
        x + 11,
        y + 26
      );
    };

    drawCard(
      margin,
      "CUSTOMER",
      customerName,
      contact
    );

    drawCard(
      margin +
      cardWidth +
      gap,
      "VEHICLE",
      vehicle,
      vehicleType
    );

    // ======================================================
    // ITEMS
    // ======================================================

    y += 40;

    doc.setTextColor(
      ...dark
    );

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(11);

    doc.text(
      "SERVICE / PARTS SUMMARY",
      margin,
      y
    );

    y += 6;

    const tableX = margin;
    const tableWidth =
      contentWidth;

    const colItem = 78;
    const colQty = 20;
    const colPrice = 39;

    const colTotal =
      tableWidth -
      colItem -
      colQty -
      colPrice;

    const drawTableHeader = () => {
      doc.setFillColor(
        ...blue
      );

      doc.roundedRect(
        tableX,
        y,
        tableWidth,
        10,
        2,
        2,
        "F"
      );

      doc.setTextColor(
        ...white
      );

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(7.5);

      doc.text(
        "ITEM",
        tableX + 5,
        y + 6.5
      );

      doc.text(
        "QTY",
        tableX +
        colItem +
        colQty / 2,
        y + 6.5,
        {
          align:
            "center",
        }
      );

      doc.text(
        "UNIT PRICE",
        tableX +
        colItem +
        colQty +
        colPrice -
        4,
        y + 6.5,
        {
          align:
            "right",
        }
      );

      doc.text(
        "AMOUNT",
        tableX +
        tableWidth -
        4,
        y + 6.5,
        {
          align:
            "right",
        }
      );

      y += 10;
    };

    drawTableHeader();

    if (
      items.length === 0
    ) {
      doc.setFillColor(
        ...soft
      );

      doc.rect(
        tableX,
        y,
        tableWidth,
        14,
        "F"
      );

      doc.setTextColor(
        ...gray
      );

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.setFontSize(8.5);

      doc.text(
        "No invoice items available.",
        tableX + 5,
        y + 9
      );

      y += 14;
    } else {
      items.forEach(
        (
          item,
          index
        ) => {
          if (
            y >
            pageHeight -
            65
          ) {
            doc.addPage();

            y = 18;

            drawTableHeader();
          }

          const quantity =
            Number(
              item.quantity ||
              0
            );

          const unitPrice =
            Number(
              item.unitPrice ||
              0
            );

          const lineTotal =
            Number(
              item.lineTotal ??
              quantity *
              unitPrice
            );

          if (
            index % 2 === 0
          ) {
            doc.setFillColor(
              ...soft
            );

            doc.rect(
              tableX,
              y,
              tableWidth,
              13,
              "F"
            );
          }

          doc.setDrawColor(
            ...border
          );

          doc.line(
            tableX,
            y + 13,
            tableX +
            tableWidth,
            y + 13
          );

          doc.setTextColor(
            ...dark
          );

          doc.setFont(
            "helvetica",
            "bold"
          );

          doc.setFontSize(8.5);

          const itemName =
            doc.splitTextToSize(
              safeText(
                item.itemName,
                "Item"
              ),
              colItem - 10
            )[0];

          doc.text(
            itemName,
            tableX + 5,
            y + 8
          );

          doc.setFont(
            "helvetica",
            "normal"
          );

          doc.text(
            String(
              quantity
            ),
            tableX +
            colItem +
            colQty / 2,
            y + 8,
            {
              align:
                "center",
            }
          );

          doc.text(
            `LKR ${money(
              unitPrice
            )}`,
            tableX +
            colItem +
            colQty +
            colPrice -
            4,
            y + 8,
            {
              align:
                "right",
            }
          );

          doc.setFont(
            "helvetica",
            "bold"
          );

          doc.setTextColor(
            ...green
          );

          doc.text(
            `LKR ${money(
              lineTotal
            )}`,
            tableX +
            tableWidth -
            4,
            y + 8,
            {
              align:
                "right",
            }
          );

          y += 13;
        }
      );
    }

    // ======================================================
    // TOTALS
    // ======================================================

    y += 8;

    if (
      y >
      pageHeight -
      85
    ) {
      doc.addPage();
      y = 20;
    }

    const totalsBoxWidth = 82;

    const totalsX =
      pageWidth -
      margin -
      totalsBoxWidth;

    doc.setFillColor(
      ...white
    );

    doc.setDrawColor(
      ...border
    );

    doc.roundedRect(
      totalsX,
      y,
      totalsBoxWidth,
      34,
      3,
      3,
      "FD"
    );

    const drawTotalLine = (
      label,
      value,
      lineY
    ) => {
      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.setFontSize(8);

      doc.setTextColor(
        ...gray
      );

      doc.text(
        label,
        totalsX + 5,
        lineY
      );

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setTextColor(
        ...dark
      );

      doc.text(
        `LKR ${money(
          value
        )}`,
        totalsX +
        totalsBoxWidth -
        5,
        lineY,
        {
          align:
            "right",
        }
      );
    };

    drawTotalLine(
      "Subtotal",
      subtotal,
      y + 8
    );

    drawTotalLine(
      "Tax",
      tax,
      y + 17
    );

    drawTotalLine(
      "Discount",
      discount,
      y + 26
    );

    y += 42;

    // ======================================================
    // TOTAL PAID CARD
    // ======================================================

    doc.setFillColor(
      ...lightGreen
    );

    doc.setDrawColor(
      167,
      243,
      208
    );

    doc.roundedRect(
      margin,
      y,
      contentWidth,
      24,
      4,
      4,
      "FD"
    );

    doc.setTextColor(
      ...green
    );

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(10);

    doc.text(
      "TOTAL PAID",
      margin + 7,
      y + 10
    );

    doc.setFontSize(18);

    doc.text(
      `LKR ${money(
        totalPaid
      )}`,
      pageWidth -
      margin -
      7,
      y + 16,
      {
        align:
          "right",
      }
    );

    // ======================================================
    // PAYMENT DETAILS
    // ======================================================

    y += 33;

    if (
      y >
      pageHeight -
      55
    ) {
      doc.addPage();
      y = 20;
    }

    doc.setTextColor(
      ...dark
    );

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(10);

    doc.text(
      "PAYMENT DETAILS",
      margin,
      y
    );

    y += 5;

    doc.setFillColor(
      ...navy
    );

    doc.roundedRect(
      margin,
      y,
      contentWidth,
      25,
      3,
      3,
      "F"
    );

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(7);

    doc.setTextColor(
      191,
      219,
      254
    );

    doc.text(
      "METHOD",
      margin + 6,
      y + 7
    );

    doc.text(
      "PAID ON",
      margin + 66,
      y + 7
    );

    doc.text(
      "REFERENCE",
      margin + 126,
      y + 7
    );

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(9);

    doc.setTextColor(
      ...white
    );

    doc.text(
      paymentMethod,
      margin + 6,
      y + 16
    );

    doc.text(
      `${
        paymentDate
      } ${
        paymentTime !== "-"
          ? paymentTime
          : ""
      }`.trim(),
      margin + 66,
      y + 16
    );

    doc.text(
      paymentRef,
      margin + 126,
      y + 16
    );

    // ======================================================
    // FOOTER
    // ======================================================

    y += 36;

    if (
      y >
      pageHeight -
      34
    ) {
      doc.addPage();
      y = 20;
    }

    doc.setFillColor(
      ...navy
    );

    doc.roundedRect(
      margin,
      y,
      contentWidth,
      28,
      4,
      4,
      "F"
    );

    doc.setTextColor(
      ...white
    );

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(11);

    doc.text(
      "Thank you for choosing Magic Touch!",
      pageWidth / 2,
      y + 10,
      {
        align:
          "center",
      }
    );

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(8);

    doc.setTextColor(
      191,
      219,
      254
    );

    doc.text(
      "Quality Service  |  Trusted Care  |  Drive Safe",
      pageWidth / 2,
      y + 17,
      {
        align:
          "center",
      }
    );

    doc.setFontSize(6.5);

    doc.setTextColor(
      148,
      163,
      184
    );

    doc.text(
      "Computer-generated official service receipt",
      pageWidth / 2,
      y + 23,
      {
        align:
          "center",
      }
    );

    // ======================================================
    // FILE NAME
    // ======================================================

    const safeVehicle =
      vehicle
        .replace(
          /[^a-zA-Z0-9-_]/g,
          "-"
        )
        .replace(
          /-+/g,
          "-"
        );

    const pdfBlob = doc.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);

    const downloadLink = document.createElement("a");
    downloadLink.href = pdfUrl;
    downloadLink.download =
      `MagicTouch_Service_Receipt_${safeVehicle}_${invoiceNo}_${Date.now()}.pdf`;

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    window.setTimeout(() => {
      URL.revokeObjectURL(pdfUrl);
    }, 1000);
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
              {paymentReady
                ? "INVOICE NOT READY YET"
                : "PAYMENT NOT READY YET"}
            </h2>

            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
              {error ||
                "Your invoice is not available yet."}
            </p>

            {readyInSeconds > 0 && (
              <div className="mt-4 border border-amber-500/30 bg-amber-500/10 px-4 py-3">
                <p className="text-[10px] uppercase tracking-widest text-amber-300">
                  PAYMENT OPENS IN
                </p>

                <p className="mt-2 text-xl font-black text-white">
                  {Math.floor(
                    readyInSeconds / 60
                  )}
                  :
                  {String(
                    readyInSeconds % 60
                  ).padStart(2, "0")}
                </p>
              </div>
            )}

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

  const isPaid =
    String(
      invoice.paymentStatus || ""
    )
      .trim()
      .toUpperCase() === "PAID" ||
    Boolean(invoice.paymentId);

  const paymentStatus =
    isPaid
      ? "PAID"
      : "UNPAID";

  const amountPaid =
    isPaid
      ? Number(
          invoice.amountPaid || 0
        )
      : 0;

  const displayAmount =
    isPaid
      ? amountPaid
      : finalAmount;

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

              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold ${
                  isPaid
                    ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                    : "border border-amber-500/40 bg-amber-500/10 text-amber-400"
                }`}
              >

                {isPaid ? (
                  <CheckCircle
                    size={13}
                  />
                ) : (
                  <AlertCircle
                    size={13}
                  />
                )}

                {paymentStatus}

              </span>

              <span className="text-[10px] text-slate-500">
                Invoice #{invoice.invoiceId}
              </span>

            </div>

          </div>

          <div className="text-left lg:text-right">

            <p className="text-[10px] text-slate-500">
              {isPaid
                ? "TOTAL PAID"
                : "AMOUNT DUE"}
            </p>

            <h1
              className={`text-2xl md:text-3xl font-black mt-1 ${
                isPaid
                  ? "text-emerald-400"
                  : "text-amber-400"
              }`}
            >

              LKR{" "}

              {displayAmount.toLocaleString(
                undefined,
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              )}

            </h1>

          </div>

        </div>

        {!isPaid && (
          <div className="mt-5 border border-amber-500/30 bg-amber-500/10 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0 text-amber-400"
              />

              <div>
                <p className="text-sm font-bold text-amber-300">
                  PAYMENT PENDING
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Your bill has been created. Please complete the payment at the counter. This page will automatically change to PAID after Assistance confirms the payment.
                </p>
              </div>
            </div>
          </div>
        )}

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

          <div
            className={`bg-[#0c1219] border p-4 ${
              isPaid
                ? "border-emerald-500/30"
                : "border-amber-500/30"
            }`}
          >

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

              {isPaid
                ? invoice.paymentMethod ||
                  "Paid"
                : "Payment Pending"}

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
              {isPaid
                ? formatDate(
                    invoice.paymentDate
                  )
                : "-"}
            </p>

            {isPaid &&
              invoice.paymentTime && (

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
            disabled={!isPaid}
            className={`w-full py-3 text-xs font-black flex items-center justify-center gap-2 transition ${
              isPaid
                ? "border border-emerald-500 text-emerald-400 hover:bg-emerald-500/10"
                : "cursor-not-allowed border border-slate-700 text-slate-600 opacity-60"
            }`}
          >

            <Download className="w-4 h-4" />

            {isPaid
              ? "DOWNLOAD RECEIPT"
              : "RECEIPT AVAILABLE AFTER PAYMENT"}

          </button>

        </div>

      </div>

    </div>
  );
}