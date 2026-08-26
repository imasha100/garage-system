const db = require("../config/db");

// ======================================================
// CREATE INVOICE + INVOICE ITEMS
// AND REDUCE STOCK
//
// POST /api/invoices/checkout
//
// IMPORTANT:
// - Creates the customer bill only.
// - Does NOT create a payment record.
// - Customer sees the invoice as UNPAID.
// ======================================================

const createInvoiceAndPayment = async (req, res) => {
  let connection;

  try {
    const {
      jobId,
      items,
      taxAmount = 0,
      discountAmount = 0,
    } = req.body;

    const numericJobId = Number(jobId);

    if (
      !Number.isInteger(numericJobId) ||
      numericJobId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid service job ID is required.",
      });
    }

    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "At least one bill item is required.",
      });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    const [currentDateTimeRows] =
      await connection.query(`
        SELECT
          DATE_FORMAT(CURDATE(), '%Y-%m-%d') AS formatted_date,
          TIME_FORMAT(CURTIME(), '%H:%i:%s') AS formatted_time
      `);

    const currentDate =
      currentDateTimeRows[0]?.formatted_date;

    const currentTime =
      currentDateTimeRows[0]?.formatted_time;

    // ==================================================
    // CHECK SERVICE JOB
    // ==================================================

    const [jobRows] = await connection.query(
      `
      SELECT
        job_id,
        job_status,
        garage_garage_id,
        service_request_request_id
      FROM service_job
      WHERE job_id = ?
      LIMIT 1
      `,
      [numericJobId]
    );

    if (jobRows.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Service job not found.",
      });
    }

    const job = jobRows[0];

    // ==================================================
    // GET TOW TRUCK CHARGE
    // ==================================================

    let towCharge = 0;

    if (job.service_request_request_id) {
      const [towRows] = await connection.query(
        `
        SELECT
          tow_charge
        FROM tow_dispatch
        WHERE service_request_request_id = ?
          AND tow_charge IS NOT NULL
          AND UPPER(
            TRIM(
              COALESCE(dispatch_status, '')
            )
          ) <> 'REJECTED'
        ORDER BY dispatch_id DESC
        LIMIT 1
        `,
        [job.service_request_request_id]
      );

      if (towRows.length > 0) {
        towCharge = Math.max(
          0,
          Number(towRows[0].tow_charge) || 0
        );
      }
    }

    // ==================================================
    // JOB MUST BE COMPLETED
    // ==================================================

    const jobStatus = String(
      job.job_status || ""
    )
      .trim()
      .toUpperCase();

    if (jobStatus !== "COMPLETED") {
      await connection.rollback();

      return res.status(409).json({
        success: false,
        message:
          "Only completed service jobs can be billed.",
      });
    }

    // ==================================================
    // PREVENT DUPLICATE INVOICE
    // ==================================================

    const [existingInvoiceRows] =
      await connection.query(
        `
        SELECT
          invoice_id
        FROM invoice
        WHERE service_job_job_id = ?
        LIMIT 1
        `,
        [numericJobId]
      );

    if (existingInvoiceRows.length > 0) {
      await connection.rollback();

      return res.status(409).json({
        success: false,
        code: "INVOICE_ALREADY_EXISTS",
        message:
          "An invoice has already been created for this service job.",
        invoiceId:
          existingInvoiceRows[0].invoice_id,
      });
    }

    // ==================================================
    // VALIDATE STOCK ITEMS
    // ==================================================

    const validatedItems = [];

    for (const item of items) {
      const batchId = Number(item.batchId);
      const quantity = Number(item.quantity);

      if (
        !Number.isInteger(batchId) ||
        batchId <= 0
      ) {
        await connection.rollback();

        return res.status(400).json({
          success: false,
          message: "Invalid stock batch ID.",
        });
      }

      if (
        !Number.isInteger(quantity) ||
        quantity <= 0
      ) {
        await connection.rollback();

        return res.status(400).json({
          success: false,
          message:
            "Item quantity must be a whole number greater than zero.",
        });
      }

      const [batchRows] =
        await connection.query(
          `
          SELECT
            sb.batch_id,
            sb.batch_num,
            sb.selling_price,
            sb.available_quantity,

            s.stock_id,
            s.reorder_level,
            s.garage_garage_id,

            si.item_id,
            si.item_name

          FROM stock_batch sb

          INNER JOIN stock s
            ON s.stock_id =
               sb.stock_stock_id

          INNER JOIN stock_item si
            ON si.item_id =
               s.stock_item_item_id

          WHERE sb.batch_id = ?

          LIMIT 1
          FOR UPDATE
          `,
          [batchId]
        );

      if (batchRows.length === 0) {
        await connection.rollback();

        return res.status(404).json({
          success: false,
          message:
            `Stock batch ${batchId} was not found.`,
        });
      }

      const batch = batchRows[0];

      if (
        Number(batch.garage_garage_id) !==
        Number(job.garage_garage_id)
      ) {
        await connection.rollback();

        return res.status(403).json({
          success: false,
          message:
            `${batch.item_name} does not belong to this garage.`,
        });
      }

      const availableQuantity = Number(
        batch.available_quantity || 0
      );

      if (quantity > availableQuantity) {
        await connection.rollback();

        return res.status(409).json({
          success: false,
          message:
            `Only ${availableQuantity} unit(s) of ${batch.item_name} are available.`,
        });
      }

      const unitPrice = Number(
        batch.selling_price || 0
      );

      const lineTotal =
        unitPrice * quantity;

      validatedItems.push({
        batchId: batch.batch_id,
        batchNumber: batch.batch_num,
        stockId: batch.stock_id,
        itemId: batch.item_id,
        itemName: batch.item_name,
        quantity,
        unitPrice,
        lineTotal,
        availableBefore:
          availableQuantity,
        availableAfter:
          availableQuantity - quantity,
        reorderLevel:
          Number(batch.reorder_level || 0),
      });
    }

    // ==================================================
    // CALCULATE TOTAL
    // ==================================================

    const stockItemsTotal =
      validatedItems.reduce(
        (total, item) =>
          total + item.lineTotal,
        0
      );

    const totalAmount =
      stockItemsTotal + towCharge;

    const numericTaxAmount =
      Math.max(
        0,
        Number(taxAmount) || 0
      );

    const numericDiscountAmount =
      Math.max(
        0,
        Number(discountAmount) || 0
      );

    const finalAmount =
      totalAmount +
      numericTaxAmount -
      numericDiscountAmount;

    if (finalAmount < 0) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message:
          "Final invoice amount cannot be negative.",
      });
    }

    // ==================================================
    // CREATE INVOICE
    // NO PAYMENT IS CREATED HERE
    // ==================================================

    const [invoiceResult] =
      await connection.query(
        `
        INSERT INTO invoice (
          invoice_date,
          total_amount,
          tax_amount,
          discount_amount,
          final_amount,
          service_job_job_id
        )
        VALUES (
          CURDATE(),
          ?,
          ?,
          ?,
          ?,
          ?
        )
        `,
        [
          totalAmount,
          numericTaxAmount,
          numericDiscountAmount,
          finalAmount,
          numericJobId,
        ]
      );

    const invoiceId =
      invoiceResult.insertId;

    // ==================================================
    // SAVE ITEMS + REDUCE STOCK
    // ==================================================

    for (const item of validatedItems) {
      await connection.query(
        `
        INSERT INTO invoice_item (
          item_name,
          invoice_invoice_id,
          stock_batch_id,
          quantity,
          unit_price,
          line_total
        )
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          item.itemName,
          invoiceId,
          item.batchId,
          item.quantity,
          item.unitPrice,
          item.lineTotal,
        ]
      );

      await connection.query(
        `
        UPDATE stock_batch
        SET available_quantity =
          available_quantity - ?
        WHERE batch_id = ?
        `,
        [
          item.quantity,
          item.batchId,
        ]
      );

      if (item.availableAfter === 0) {
        await connection.query(
          `
          UPDATE stock_batch
          SET stock_zero_date = CURDATE()
          WHERE batch_id = ?
          `,
          [item.batchId]
        );
      }

      const crossedLowStockThreshold =
        item.availableBefore >
          item.reorderLevel &&
        item.availableAfter <=
          item.reorderLevel;

      if (crossedLowStockThreshold) {
        await connection.query(
          `
          INSERT INTO notification (
            garage_id,
            truck_driver_driver_id,
            customer_customer_id,
            assistance_assistance_id,
            technician_technician_id,
            notification_type,
            title,
            message,
            target_page,
            reference_id,
            priority,
            is_read,
            created_date,
            created_time
          )
          VALUES (
            ?,
            NULL,
            NULL,
            NULL,
            NULL,
            'LOW_STOCK',
            'Low Stock Alert',
            ?,
            'stock-management',
            ?,
            'HIGH',
            0,
            CURDATE(),
            CURTIME()
          )
          `,
          [
            Number(
              job.garage_garage_id
            ),

            `${item.itemName} stock is low. Only ${item.availableAfter} unit(s) remaining. Reorder level is ${item.reorderLevel}.`,

            item.stockId,
          ]
        );
      }
    }

    // ==================================================
    // ADD TOW CHARGE TO INVOICE
    // ==================================================

    if (towCharge > 0) {
      await connection.query(
        `
        INSERT INTO invoice_item (
          item_name,
          invoice_invoice_id,
          stock_batch_id,
          quantity,
          unit_price,
          line_total
        )
        VALUES (
          'Tow Truck Charge',
          ?,
          NULL,
          1,
          ?,
          ?
        )
        `,
        [
          invoiceId,
          towCharge,
          towCharge,
        ]
      );
    }

    await connection.commit();

    const invoiceItems =
      validatedItems.map(
        (item) => ({
          itemId: item.itemId,
          itemName: item.itemName,
          stockId: item.stockId,
          batchId: item.batchId,
          batchNumber:
            item.batchNumber,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          lineTotal: item.lineTotal,
          availableBefore:
            item.availableBefore,
          availableAfter:
            item.availableAfter,
          reorderLevel:
            item.reorderLevel,
          lowStock:
            item.availableAfter <=
            item.reorderLevel,
        })
      );

    if (towCharge > 0) {
      invoiceItems.push({
        itemId: null,
        itemName: "Tow Truck Charge",
        stockId: null,
        batchId: null,
        batchNumber: null,
        quantity: 1,
        unitPrice: towCharge,
        lineTotal: towCharge,
        availableBefore: null,
        availableAfter: null,
        reorderLevel: null,
        lowStock: false,
      });
    }

    return res.status(201).json({
      success: true,

      message:
        "Invoice created successfully. Payment is pending.",

      invoice: {
        invoiceId,
        jobId: numericJobId,
        invoiceDate: currentDate,
        invoiceTime: currentTime,
        totalAmount,
        towCharge,
        taxAmount:
          numericTaxAmount,
        discountAmount:
          numericDiscountAmount,
        finalAmount,

        paymentStatus: "UNPAID",
        amountPaid: 0,

        items: invoiceItems,
      },

      payment: null,
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error(
          "Invoice rollback error:",
          rollbackError
        );
      }
    }

    console.error(
      "CREATE INVOICE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.sqlMessage ||
        "Unable to create invoice.",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// ======================================================
// CONFIRM INVOICE PAYMENT
//
// POST /api/invoices/:invoiceId/confirm-payment
//
// Only this function creates the payment record.
// ======================================================

const confirmInvoicePayment = async (
  req,
  res
) => {
  let connection;

  try {
    const invoiceId = Number(
      req.params.invoiceId
    );

    const paymentMethod = String(
      req.body.paymentMethod || ""
    ).trim();

    const transactionRef = String(
      req.body.transactionRef || ""
    ).trim();

    const cardType = String(
      req.body.cardType || ""
    ).trim();

    if (
      !Number.isInteger(invoiceId) ||
      invoiceId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid invoice ID is required.",
      });
    }

    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        message:
          "Payment method is required.",
      });
    }

    connection =
      await db.getConnection();

    await connection.beginTransaction();

    const [invoiceRows] =
      await connection.query(
        `
        SELECT
          invoice_id,
          invoice_date,
          total_amount,
          tax_amount,
          discount_amount,
          final_amount,
          service_job_job_id
        FROM invoice
        WHERE invoice_id = ?
        LIMIT 1
        FOR UPDATE
        `,
        [invoiceId]
      );

    if (invoiceRows.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Invoice not found.",
      });
    }

    const invoice =
      invoiceRows[0];

    // ==================================================
    // PREVENT DOUBLE PAYMENT
    // ==================================================

    const [existingPaymentRows] =
      await connection.query(
        `
        SELECT
          payment_id,
          payment_date,
          payment_time,
          payment_method,
          amount_paid
        FROM payment
        WHERE invoice_invoice_id = ?
        LIMIT 1
        FOR UPDATE
        `,
        [invoiceId]
      );

    if (
      existingPaymentRows.length > 0
    ) {
      await connection.rollback();

      const existingPayment =
        existingPaymentRows[0];

      return res.status(409).json({
        success: false,
        code:
          "PAYMENT_ALREADY_CONFIRMED",

        message:
          "Payment has already been confirmed for this invoice.",

        payment: {
          paymentId:
            existingPayment.payment_id,

          paymentDate:
            existingPayment.payment_date,

          paymentTime:
            existingPayment.payment_time,

          paymentMethod:
            existingPayment.payment_method,

          amountPaid:
            Number(
              existingPayment.amount_paid ||
                0
            ),
        },
      });
    }

    const finalAmount = Number(
      invoice.final_amount || 0
    );

    // ==================================================
    // CREATE PAYMENT
    // ==================================================

    const [paymentResult] =
      await connection.query(
        `
        INSERT INTO payment (
          payment_date,
          payment_time,
          payment_method,
          amount_paid,
          invoice_invoice_id
        )
        VALUES (
          CURDATE(),
          CURTIME(),
          ?,
          ?,
          ?
        )
        `,
        [
          paymentMethod,
          finalAmount,
          invoiceId,
        ]
      );

    const [dateTimeRows] =
      await connection.query(`
        SELECT
          DATE_FORMAT(
            CURDATE(),
            '%Y-%m-%d'
          ) AS payment_date,

          TIME_FORMAT(
            CURTIME(),
            '%H:%i:%s'
          ) AS payment_time
      `);

    const paymentDate =
      dateTimeRows[0]?.payment_date;

    const paymentTime =
      dateTimeRows[0]?.payment_time;

    await connection.commit();

    return res.status(201).json({
      success: true,

      message:
        "Payment confirmed successfully.",

      invoice: {
        invoiceId:
          invoice.invoice_id,

        jobId:
          invoice.service_job_job_id,

        invoiceDate:
          invoice.invoice_date,

        totalAmount:
          Number(
            invoice.total_amount || 0
          ),

        taxAmount:
          Number(
            invoice.tax_amount || 0
          ),

        discountAmount:
          Number(
            invoice.discount_amount || 0
          ),

        finalAmount,

        paymentStatus: "PAID",
      },

      payment: {
        paymentId:
          paymentResult.insertId,

        invoiceId,

        paymentDate,
        paymentTime,
        paymentMethod,
        amountPaid: finalAmount,

        transactionRef:
          transactionRef || null,

        cardType:
          cardType || null,
      },
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error(
          "Payment rollback error:",
          rollbackError
        );
      }
    }

    console.error(
      "CONFIRM INVOICE PAYMENT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        error.sqlMessage ||
        "Unable to confirm invoice payment.",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};
// ======================================================
// GET GARAGE INVOICE / PAYMENT HISTORY
//
// GET /api/invoices/garage/:garageId/history
// ======================================================

const getGarageInvoiceHistory = async (
  req,
  res
) => {
  try {
    const garageId = Number(
      req.params.garageId
    );

    if (
      !Number.isInteger(garageId) ||
      garageId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid garage ID is required.",
      });
    }

    // ==================================================
    // GET INVOICES
    //
    // LEFT JOIN payment:
    // payment exists     -> PAID
    // payment not exists -> UNPAID
    // ==================================================

    const [rows] = await db.query(
      `
      SELECT
        i.invoice_id,
        i.invoice_date,
        i.total_amount,
        i.tax_amount,
        i.discount_amount,
        i.final_amount,
        i.service_job_job_id,

        p.payment_id,
        p.payment_date,
        p.payment_time,
        p.payment_method,
        p.amount_paid,

        sj.garage_garage_id,

        sr.request_id,
        sr.request_type,

        c.customer_id,
        c.full_name AS customer_name,
        c.contact_number,

        v.vehicle_number,
        v.vehicle_type

      FROM invoice i

      INNER JOIN service_job sj
        ON sj.job_id =
           i.service_job_job_id

      LEFT JOIN service_request sr
        ON sr.request_id =
           sj.service_request_request_id

      LEFT JOIN customer c
        ON c.customer_id =
           sr.customer_customer_id

      LEFT JOIN vehicle v
        ON v.vehicle_id =
           sr.vehicle_vehicle_id

      LEFT JOIN payment p
        ON p.invoice_invoice_id =
           i.invoice_id

      WHERE sj.garage_garage_id = ?

      ORDER BY
        i.invoice_id DESC
      `,
      [garageId]
    );

    // ==================================================
    // GET INVOICE ITEMS
    // ==================================================

    const invoiceIds = rows.map(
      (row) => row.invoice_id
    );

    let itemRows = [];

    if (invoiceIds.length > 0) {
      const placeholders =
        invoiceIds
          .map(() => "?")
          .join(",");

      const [items] = await db.query(
        `
        SELECT
          invoice_item_id,
          item_name,
          invoice_invoice_id,
          stock_batch_id,
          quantity,
          unit_price,
          line_total

        FROM invoice_item

        WHERE invoice_invoice_id
          IN (${placeholders})

        ORDER BY
          invoice_item_id ASC
        `,
        invoiceIds
      );

      itemRows = items;
    }

    // ==================================================
    // MAP ITEMS BY INVOICE
    // ==================================================

    const itemsByInvoice = {};

    for (const item of itemRows) {
      const invoiceId =
        item.invoice_invoice_id;

      if (!itemsByInvoice[invoiceId]) {
        itemsByInvoice[invoiceId] = [];
      }

      itemsByInvoice[invoiceId].push({
        invoiceItemId:
          item.invoice_item_id,

        itemName:
          item.item_name,

        batchId:
          item.stock_batch_id,

        quantity:
          Number(
            item.quantity || 0
          ),

        unitPrice:
          Number(
            item.unit_price || 0
          ),

        lineTotal:
          Number(
            item.line_total || 0
          ),
      });
    }

    // ==================================================
    // FORMAT HISTORY
    // ==================================================

    const history = rows.map(
      (row) => {
        const isPaid =
          Boolean(row.payment_id);

        return {
          invoiceId:
            row.invoice_id,

          invoiceDate:
            row.invoice_date,

          totalAmount:
            Number(
              row.total_amount || 0
            ),

          taxAmount:
            Number(
              row.tax_amount || 0
            ),

          discountAmount:
            Number(
              row.discount_amount || 0
            ),

          finalAmount:
            Number(
              row.final_amount || 0
            ),

          paymentId:
            row.payment_id || null,

          paymentDate:
            row.payment_date || null,

          paymentTime:
            row.payment_time || null,

          paymentMethod:
            row.payment_method || null,

          amountPaid:
            Number(
              row.amount_paid || 0
            ),

          paymentStatus:
            isPaid
              ? "PAID"
              : "UNPAID",

          jobId:
            row.service_job_job_id,

          requestId:
            row.request_id || null,

          requestType:
            row.request_type || null,

          garageId:
            row.garage_garage_id,

          customerId:
            row.customer_id || null,

          customerName:
            row.customer_name ||
            "Customer",

          contactNumber:
            row.contact_number || "",

          vehicleNumber:
            row.vehicle_number || "",

          vehicleType:
            row.vehicle_type || "",

          ticketNumber:
            row.vehicle_number
              ? `${row.vehicle_number}-INV-${row.invoice_id}`
              : `INV-${row.invoice_id}`,

          items:
            itemsByInvoice[
              row.invoice_id
            ] || [],
        };
      }
    );

    return res.status(200).json({
      success: true,
      count: history.length,
      history,
    });
  } catch (error) {
    console.error(
      "GET GARAGE INVOICE HISTORY ERROR:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        error.sqlMessage ||
        "Unable to load invoice history.",
    });
  }
};

// ======================================================
// GET LATEST CUSTOMER INVOICE
//
// GET
// /api/invoices/customer/:contactNumber/:vehicleNumber/latest
//
// paymentId = null -> UNPAID
// paymentId exists -> PAID
// ======================================================

const getLatestCustomerInvoice = async (
  req,
  res
) => {
  try {
    const contactNumber = String(
      req.params.contactNumber || ""
    ).trim();

    const vehicleNumber = String(
      req.params.vehicleNumber || ""
    ).trim();

    if (
      !contactNumber ||
      !vehicleNumber
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Customer contact number and vehicle number are required.",
      });
    }

    // ==================================================
    // GET LATEST CUSTOMER INVOICE
    // ==================================================

    const [invoiceRows] =
      await db.query(
        `
        SELECT
          i.invoice_id,
          i.invoice_date,
          i.total_amount,
          i.tax_amount,
          i.discount_amount,
          i.final_amount,
          i.service_job_job_id,

          p.payment_id,
          p.payment_date,
          p.payment_time,
          p.payment_method,
          p.amount_paid,

          sj.job_id,
          sj.job_status,
          sj.actual_completion_time,
          sj.garage_garage_id,

          sr.request_id,
          sr.request_type,

          c.customer_id,
          c.full_name AS customer_name,
          c.contact_number,

          v.vehicle_id,
          v.vehicle_number,
          v.vehicle_type,
          v.vehicle_model

        FROM invoice i

        INNER JOIN service_job sj
          ON sj.job_id =
             i.service_job_job_id

        INNER JOIN service_request sr
          ON sr.request_id =
             sj.service_request_request_id

        INNER JOIN customer c
          ON c.customer_id =
             sr.customer_customer_id

        INNER JOIN vehicle v
          ON v.vehicle_id =
             sr.vehicle_vehicle_id

        LEFT JOIN payment p
          ON p.invoice_invoice_id =
             i.invoice_id

        WHERE
          TRIM(c.contact_number) =
            TRIM(?)

          AND UPPER(
            REPLACE(
              TRIM(
                v.vehicle_number
              ),
              ' ',
              ''
            )
          ) =
          UPPER(
            REPLACE(
              TRIM(?),
              ' ',
              ''
            )
          )

        ORDER BY
          i.invoice_id DESC

        LIMIT 1
        `,
        [
          contactNumber,
          vehicleNumber,
        ]
      );

    if (
      invoiceRows.length === 0
    ) {
      return res.status(404).json({
        success: false,

        message:
          "Your bill is being prepared. Please refresh shortly.",
      });
    }

    const invoice =
      invoiceRows[0];

    // ==================================================
    // GET INVOICE ITEMS
    // ==================================================

    const [itemRows] =
      await db.query(
        `
        SELECT
          invoice_item_id,
          item_name,
          stock_batch_id,
          quantity,
          unit_price,
          line_total

        FROM invoice_item

        WHERE invoice_invoice_id = ?

        ORDER BY
          invoice_item_id ASC
        `,
        [invoice.invoice_id]
      );

    const items =
      itemRows.map(
        (item) => ({
          invoiceItemId:
            item.invoice_item_id,

          itemName:
            item.item_name,

          batchId:
            item.stock_batch_id,

          quantity:
            Number(
              item.quantity || 0
            ),

          unitPrice:
            Number(
              item.unit_price || 0
            ),

          lineTotal:
            Number(
              item.line_total || 0
            ),
        })
      );

    // ==================================================
    // PAYMENT STATUS
    // ==================================================

    const isPaid =
      Boolean(
        invoice.payment_id
      );

    const paymentStatus =
      isPaid
        ? "PAID"
        : "UNPAID";

    // ==================================================
    // RETURN CUSTOMER INVOICE
    // ==================================================

    return res.status(200).json({
      success: true,

      invoice: {
        invoiceId:
          invoice.invoice_id,

        invoiceDate:
          invoice.invoice_date,

        totalAmount:
          Number(
            invoice.total_amount || 0
          ),

        taxAmount:
          Number(
            invoice.tax_amount || 0
          ),

        discountAmount:
          Number(
            invoice.discount_amount || 0
          ),

        finalAmount:
          Number(
            invoice.final_amount || 0
          ),

        // ==============================================
        // PAYMENT
        // ==============================================

        paymentId:
          invoice.payment_id || null,

        paymentDate:
          invoice.payment_date || null,

        paymentTime:
          invoice.payment_time || null,

        paymentMethod:
          invoice.payment_method || null,

        amountPaid:
          Number(
            invoice.amount_paid || 0
          ),

        paymentStatus,

        // ==============================================
        // JOB
        // ==============================================

        jobId:
          invoice.job_id,

        jobStatus:
          invoice.job_status,

        actualCompletionTime:
          invoice.actual_completion_time,

        garageId:
          invoice.garage_garage_id,

        // ==============================================
        // REQUEST
        // ==============================================

        requestId:
          invoice.request_id,

        requestType:
          invoice.request_type,

        // ==============================================
        // CUSTOMER
        // ==============================================

        customerId:
          invoice.customer_id,

        customerName:
          invoice.customer_name ||
          "Customer",

        contactNumber:
          invoice.contact_number,

        // ==============================================
        // VEHICLE
        // ==============================================

        vehicleId:
          invoice.vehicle_id,

        vehicleNumber:
          invoice.vehicle_number,

        vehicleType:
          invoice.vehicle_type,

        vehicleModel:
          invoice.vehicle_model,

        // ==============================================
        // TICKET
        // ==============================================

        ticketNumber:
          invoice.vehicle_number
            ? `${invoice.vehicle_number}-INV-${invoice.invoice_id}`
            : `INV-${invoice.invoice_id}`,

        // ==============================================
        // ITEMS
        // ==============================================

        items,
      },
    });
  } catch (error) {
    console.error(
      "GET LATEST CUSTOMER INVOICE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        error.sqlMessage ||
        "Unable to load customer invoice.",
    });
  }
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  createInvoiceAndPayment,
  confirmInvoicePayment,
  getGarageInvoiceHistory,
  getLatestCustomerInvoice,
};