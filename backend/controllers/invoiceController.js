const db = require("../config/db");

// ======================================================
// CREATE INVOICE + INVOICE ITEMS + PAYMENT
// AND REDUCE STOCK
//
// POST /api/invoices/checkout
// ======================================================

const createInvoiceAndPayment = async (req, res) => {
  let connection;

  try {
    // ==================================================
    // REQUEST DATA
    // ==================================================

    const {
      jobId,
      items,
      paymentMethod,
      taxAmount = 0,
      discountAmount = 0,
    } = req.body;

    const numericJobId = Number(jobId);

    // ==================================================
    // VALIDATE JOB ID
    // ==================================================

    if (
      !Number.isInteger(numericJobId) ||
      numericJobId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid service job ID is required.",
      });
    }

    // ==================================================
    // VALIDATE BILL ITEMS
    // ==================================================

    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "At least one bill item is required.",
      });
    }

    // ==================================================
    // VALIDATE PAYMENT METHOD
    // ==================================================

    const normalizedPaymentMethod = String(
      paymentMethod || ""
    ).trim();

    if (!normalizedPaymentMethod) {
      return res.status(400).json({
        success: false,
        message:
          "Payment method is required.",
      });
    }

    // ==================================================
    // START DATABASE TRANSACTION
    // ==================================================

    connection = await db.getConnection();

    await connection.beginTransaction();

    // ==================================================
    // GET MYSQL CURRENT DATE / TIME
    // AVOIDS JAVASCRIPT UTC DATE SHIFT
    // ==================================================

    const [currentDateTimeRows] =
      await connection.query(
        `
        SELECT
          DATE_FORMAT(
            CURDATE(),
            '%Y-%m-%d'
          ) AS formatted_date,

          TIME_FORMAT(
            CURTIME(),
            '%H:%i:%s'
          ) AS formatted_time
        `
      );

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
        message:
          "Service job not found.",
      });
    }

    const job = jobRows[0];

    // ==================================================
    // GET TOW TRUCK CHARGE (NON-DRIVEABLE ONLY)
    //
    // Driveable requests do not have a tow dispatch, so
    // towCharge remains 0.
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
              COALESCE(
                dispatch_status,
                ''
              )
            )
          ) <> 'REJECTED'
        ORDER BY
          dispatch_id DESC
        LIMIT 1
        `,
        [
          job.service_request_request_id,
        ]
      );

      if (towRows.length > 0) {
        towCharge = Math.max(
          0,
          Number(
            towRows[0].tow_charge
          ) || 0
        );
      }
    }

    // ==================================================
    // ONLY COMPLETED JOBS CAN BE BILLED
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
        message:
          "An invoice has already been created for this service job.",
      });
    }

    // ==================================================
    // VALIDATE STOCK ITEMS
    // ==================================================

    const validatedItems = [];

    for (const item of items) {
      const batchId = Number(
        item.batchId
      );

      const quantity = Number(
        item.quantity
      );

      if (
        !Number.isInteger(batchId) ||
        batchId <= 0
      ) {
        await connection.rollback();

        return res.status(400).json({
          success: false,
          message:
            "Invalid stock batch ID.",
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

      // ================================================
      // GET ACTUAL DATABASE STOCK + SELLING PRICE
      // ================================================

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

      // ================================================
      // ENSURE STOCK BELONGS TO SAME GARAGE
      // ================================================

      if (
        Number(
          batch.garage_garage_id
        ) !==
        Number(
          job.garage_garage_id
        )
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

      // ================================================
      // CHECK AVAILABLE STOCK
      // ================================================

      if (
        quantity >
        availableQuantity
      ) {
        await connection.rollback();

        return res.status(409).json({
          success: false,
          message:
            `Only ${availableQuantity} unit(s) of ${batch.item_name} are available.`,
        });
      }

      // ================================================
      // ALWAYS USE DATABASE SELLING PRICE
      // ================================================

      const unitPrice = Number(
        batch.selling_price || 0
      );

      const lineTotal =
        unitPrice * quantity;

      validatedItems.push({
        batchId:
          batch.batch_id,

        batchNumber:
          batch.batch_num,

        stockId:
          batch.stock_id,

        itemId:
          batch.item_id,

        itemName:
          batch.item_name,

        quantity,

        unitPrice,

        lineTotal,

        availableBefore:
          availableQuantity,

        availableAfter:
          availableQuantity -
          quantity,

        reorderLevel:
          Number(
            batch.reorder_level || 0
          ),
      });
    }

    // ==================================================
    // CALCULATE TOTALS
    // ==================================================

    const stockItemsTotal =
      validatedItems.reduce(
        (total, item) =>
          total +
          item.lineTotal,
        0
      );

    const totalAmount =
      stockItemsTotal +
      towCharge;

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
    // SAVE INVOICE ITEMS
    // AND REDUCE STOCK
    // ==================================================

    for (const item of validatedItems) {
      // ================================================
      // INSERT INVOICE ITEM
      // ================================================

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
          ?,
          ?,
          ?,
          ?,
          ?,
          ?
        )
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

      // ================================================
      // REDUCE AVAILABLE STOCK
      // ================================================

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

      // ================================================
      // IF STOCK REACHES ZERO,
      // SAVE STOCK ZERO DATE
      // ================================================

      if (
        item.availableAfter === 0
      ) {
        await connection.query(
          `
          UPDATE stock_batch
          SET stock_zero_date =
            CURDATE()
          WHERE batch_id = ?
          `,
          [item.batchId]
        );
      }
    }

    // ==================================================
    // ADD TOW TRUCK CHARGE AS A NON-STOCK INVOICE ITEM
    //
    // stock_batch_id is NULL because towing is a service
    // charge, not a stock item.
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
          normalizedPaymentMethod,
          finalAmount,
          invoiceId,
        ]
      );

    const paymentId =
      paymentResult.insertId;

    // ==================================================
    // COMMIT TRANSACTION
    // ==================================================

    await connection.commit();

    // ==================================================
    // FORMAT LOW STOCK RESULT
    // ==================================================

    const invoiceItems =
      validatedItems.map(
        (item) => ({
          itemId:
            item.itemId,

          itemName:
            item.itemName,

          stockId:
            item.stockId,

          batchId:
            item.batchId,

          batchNumber:
            item.batchNumber,

          quantity:
            item.quantity,

          unitPrice:
            item.unitPrice,

          lineTotal:
            item.lineTotal,

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
        itemName:
          "Tow Truck Charge",
        stockId: null,
        batchId: null,
        batchNumber: null,
        quantity: 1,
        unitPrice:
          towCharge,
        lineTotal:
          towCharge,
        availableBefore: null,
        availableAfter: null,
        reorderLevel: null,
        lowStock: false,
      });
    }

    // ==================================================
    // SUCCESS RESPONSE
    // ==================================================

    return res.status(201).json({
      success: true,

      message:
        "Invoice and payment completed successfully.",

      invoice: {
        invoiceId,

        jobId:
          numericJobId,

        invoiceDate:
          currentDate,

        totalAmount,

        towCharge,

        taxAmount:
          numericTaxAmount,

        discountAmount:
          numericDiscountAmount,

        finalAmount,

        items:
          invoiceItems,
      },

      payment: {
        paymentId,

        invoiceId,

        paymentDate:
          currentDate,

        paymentTime:
          currentTime,

        paymentMethod:
          normalizedPaymentMethod,

        amountPaid:
          finalAmount,
      },
    });
  } catch (error) {
    // ==================================================
    // ROLLBACK IF ANYTHING FAILS
    // ==================================================

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
      "========== CREATE INVOICE ERROR =========="
    );

    console.error(
      "Code:",
      error.code
    );

    console.error(
      "Message:",
      error.message
    );

    console.error(
      "SQL Message:",
      error.sqlMessage
    );

    console.error(
      "SQL:",
      error.sql
    );

    console.error(
      "=========================================="
    );

    return res.status(500).json({
      success: false,

      message:
        error.sqlMessage ||
        "Unable to complete invoice and payment.",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// ======================================================
// GET GARAGE INVOICE / PAYMENT HISTORY
// GET /api/invoices/garage/:garageId/history
// ======================================================

const getGarageInvoiceHistory = async (req, res) => {
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

    const [rows] = await db.query(
      `
      SELECT
        i.invoice_id,

        DATE_FORMAT(
          i.invoice_date,
          '%Y-%m-%d'
        ) AS invoice_date,

        i.total_amount,
        i.tax_amount,
        i.discount_amount,
        i.final_amount,

        p.payment_id,

        DATE_FORMAT(
          p.payment_date,
          '%Y-%m-%d'
        ) AS payment_date,

        TIME_FORMAT(
          p.payment_time,
          '%H:%i:%s'
        ) AS payment_time,

        p.payment_method,
        p.amount_paid,

        sj.job_id,
        sj.job_status,

        sr.request_id,
        sr.ticket_number,
        sr.customer_name,
        sr.contact_number,
        sr.vehicle_number,
        sr.vehicle_type

      FROM invoice i

      INNER JOIN service_job sj
        ON sj.job_id =
           i.service_job_job_id

      INNER JOIN service_request sr
        ON sr.request_id =
           sj.service_request_request_id

      LEFT JOIN payment p
        ON p.invoice_invoice_id =
           i.invoice_id

      WHERE
        sj.garage_garage_id = ?

      ORDER BY
        i.invoice_date DESC,
        p.payment_time DESC,
        i.invoice_id DESC
      `,
      [garageId]
    );

    const history = [];

    for (const row of rows) {
      const [itemRows] = await db.query(
        `
        SELECT
          invoice_item_id,
          item_name,
          stock_batch_id,
          quantity,
          unit_price,
          line_total

        FROM invoice_item

        WHERE
          invoice_invoice_id = ?

        ORDER BY
          invoice_item_id ASC
        `,
        [row.invoice_id]
      );

      history.push({
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
          row.payment_method || "",

        amountPaid:
          Number(
            row.amount_paid || 0
          ),

        jobId:
          row.job_id,

        jobStatus:
          row.job_status || "",

        requestId:
          row.request_id,

        ticketNumber:
          row.ticket_number ||
          `JOB-${row.job_id}`,

        customerName:
          row.customer_name ||
          "Customer",

        contactNumber:
          row.contact_number || "",

        vehicleNumber:
          row.vehicle_number || "",

        vehicleType:
          row.vehicle_type || "",

        items:
          itemRows.map(
            (item) => ({
              invoiceItemId:
                item.invoice_item_id,

              itemName:
                item.item_name,

              stockBatchId:
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
          ),
      });
    }

    return res.status(200).json({
      success: true,
      garageId,
      count: history.length,
      history,
    });
  } catch (error) {
    console.error(
      "========== GET GARAGE INVOICE HISTORY ERROR =========="
    );

    console.error(
      "Code:",
      error.code
    );

    console.error(
      "Message:",
      error.message
    );

    console.error(
      "SQL Message:",
      error.sqlMessage
    );

    console.error(
      "SQL:",
      error.sql
    );

    console.error(
      "======================================================"
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
// GET /api/invoices/customer/:contactNumber/:vehicleNumber/latest
// ======================================================

const getLatestCustomerInvoice = async (req, res) => {
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
          "Contact number and vehicle number are required.",
      });
    }

    const [rows] = await db.query(
      `
      SELECT
        i.invoice_id,

        DATE_FORMAT(
          i.invoice_date,
          '%Y-%m-%d'
        ) AS invoice_date,

        i.total_amount,
        i.tax_amount,
        i.discount_amount,
        i.final_amount,

        p.payment_id,

        DATE_FORMAT(
          p.payment_date,
          '%Y-%m-%d'
        ) AS payment_date,

        TIME_FORMAT(
          p.payment_time,
          '%H:%i:%s'
        ) AS payment_time,

        p.payment_method,
        p.amount_paid,

        sj.job_id,

        sr.request_id,
        sr.ticket_number,
        sr.customer_name,
        sr.contact_number,
        sr.vehicle_number,
        sr.vehicle_type

      FROM invoice i

      INNER JOIN service_job sj
        ON sj.job_id =
           i.service_job_job_id

      INNER JOIN service_request sr
        ON sr.request_id =
           sj.service_request_request_id

      LEFT JOIN payment p
        ON p.invoice_invoice_id =
           i.invoice_id

      WHERE
        sr.contact_number = ?

        AND UPPER(
          REPLACE(
            COALESCE(
              sr.vehicle_number,
              ''
            ),
            ' ',
            ''
          )
        ) =
        UPPER(
          REPLACE(
            ?,
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

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "No invoice found for this customer and vehicle.",
      });
    }

    const invoice = rows[0];

    const [itemRows] = await db.query(
      `
      SELECT
        invoice_item_id,
        item_name,
        stock_batch_id,
        quantity,
        unit_price,
        line_total

      FROM invoice_item

      WHERE
        invoice_invoice_id = ?

      ORDER BY
        invoice_item_id ASC
      `,
      [invoice.invoice_id]
    );

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

        paymentId:
          invoice.payment_id || null,

        paymentDate:
          invoice.payment_date || null,

        paymentTime:
          invoice.payment_time || null,

        paymentMethod:
          invoice.payment_method || "",

        amountPaid:
          Number(
            invoice.amount_paid || 0
          ),

        jobId:
          invoice.job_id,

        requestId:
          invoice.request_id,

        ticketNumber:
          invoice.ticket_number ||
          `JOB-${invoice.job_id}`,

        customerName:
          invoice.customer_name ||
          "Customer",

        contactNumber:
          invoice.contact_number || "",

        vehicleNumber:
          invoice.vehicle_number || "",

        vehicleType:
          invoice.vehicle_type || "",

        items:
          itemRows.map(
            (item) => ({
              invoiceItemId:
                item.invoice_item_id,

              itemName:
                item.item_name,

              stockBatchId:
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
          ),
      },
    });
  } catch (error) {
    console.error(
      "========== GET LATEST CUSTOMER INVOICE ERROR =========="
    );

    console.error(
      "Code:",
      error.code
    );

    console.error(
      "Message:",
      error.message
    );

    console.error(
      "SQL Message:",
      error.sqlMessage
    );

    console.error(
      "SQL:",
      error.sql
    );

    console.error(
      "======================================================="
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
  getGarageInvoiceHistory,
  getLatestCustomerInvoice,
};