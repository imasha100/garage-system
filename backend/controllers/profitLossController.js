const db = require("../config/db");

// ======================================================
// GET GARAGE PROFIT & LOSS
// GET /api/profit-loss/garage/:garageId
// ======================================================

const getGarageProfitLoss = async (req, res) => {
  try {
    const garageId = Number(
      req.params.garageId
    );

    // ==================================================
    // VALIDATE GARAGE ID
    // ==================================================

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
    // CHECK GARAGE EXISTS
    // ==================================================

    const [garageRows] =
      await db.query(
        `
        SELECT
          garage_id,
          garage_name

        FROM garage

        WHERE garage_id = ?

        LIMIT 1
        `,
        [garageId]
      );

    if (
      garageRows.length === 0
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Garage not found.",
      });
    }

    const garage =
      garageRows[0];

    // ==================================================
    // REVENUE RECORDS
    //
    // PAYMENT -> INVOICE -> SERVICE JOB -> GARAGE
    //
    // IMPORTANT:
    // DATE_FORMAT prevents MySQL DATE values from being
    // converted into JavaScript UTC dates.
    // ==================================================

    const [revenueRows] =
      await db.query(
        `
        SELECT
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

          i.invoice_id,

          DATE_FORMAT(
            i.invoice_date,
            '%Y-%m-%d'
          ) AS invoice_date,

          sj.job_id,

          sr.ticket_number,

          sr.vehicle_number,

          sr.customer_name

        FROM payment p

        INNER JOIN invoice i
          ON i.invoice_id =
             p.invoice_invoice_id

        INNER JOIN service_job sj
          ON sj.job_id =
             i.service_job_job_id

        INNER JOIN service_request sr
          ON sr.request_id =
             sj.service_request_request_id

        WHERE
          sj.garage_garage_id = ?

        ORDER BY
          p.payment_date DESC,
          p.payment_time DESC,
          p.payment_id DESC
        `,
        [garageId]
      );

    // ==================================================
    // EXPENSE RECORDS
    //
    // STOCK PURCHASE PRICE × RECEIVED QUANTITY
    //
    // DATE_FORMAT prevents timezone date shifting.
    // ==================================================

    const [expenseRows] =
      await db.query(
        `
        SELECT
          sb.batch_id,

          sb.batch_num,

          DATE_FORMAT(
            sb.purchase_date,
            '%Y-%m-%d'
          ) AS purchase_date,

          sb.purchase_price,

          sb.received_quantity,

          si.item_name

        FROM stock_batch sb

        INNER JOIN stock s
          ON s.stock_id =
             sb.stock_stock_id

        INNER JOIN stock_item si
          ON si.item_id =
             s.stock_item_item_id

        WHERE
          s.garage_garage_id = ?

        ORDER BY
          sb.purchase_date DESC,
          sb.batch_id DESC
        `,
        [garageId]
      );

    // ==================================================
    // FORMAT REVENUE RECORDS
    // ==================================================

    const revenueRecords =
      revenueRows.map(
        (row) => {
          const amount =
            Number(
              row.amount_paid || 0
            );

          return {
            id:
              `REV-${row.payment_id}`,

            recordId:
              row.payment_id,

            // Already YYYY-MM-DD string
            date:
              row.payment_date,

            time:
              row.payment_time,

            type:
              "Revenue",

            source:
              `Completed Repair Job - ${
                row.vehicle_number ||
                row.ticket_number ||
                `JOB-${row.job_id}`
              }`,

            amount,

            paymentMethod:
              row.payment_method ||
              "",

            invoiceId:
              row.invoice_id,

            invoiceDate:
              row.invoice_date,

            jobId:
              row.job_id,

            ticketNumber:
              row.ticket_number ||
              "",

            vehicleNumber:
              row.vehicle_number ||
              "",

            customerName:
              row.customer_name ||
              "Customer",
          };
        }
      );

    // ==================================================
    // FORMAT EXPENSE RECORDS
    // ==================================================

    const expenseRecords =
      expenseRows.map(
        (row) => {
          const purchasePrice =
            Number(
              row.purchase_price || 0
            );

          const receivedQuantity =
            Number(
              row.received_quantity || 0
            );

          const expenseAmount =
            purchasePrice *
            receivedQuantity;

          return {
            id:
              `EXP-${row.batch_id}`,

            recordId:
              row.batch_id,

            // Already YYYY-MM-DD string
            date:
              row.purchase_date,

            time:
              null,

            type:
              "Expense",

            source:
              `Stock Purchase - ${
                row.item_name ||
                row.batch_num ||
                `Batch ${row.batch_id}`
              }`,

            // Expense is negative in cash-flow records
            amount:
              -expenseAmount,

            batchId:
              row.batch_id,

            batchNumber:
              row.batch_num ||
              "",

            itemName:
              row.item_name ||
              "Stock Item",

            purchasePrice,

            receivedQuantity,
          };
        }
      );

    // ==================================================
    // MERGE ALL RECORDS
    // ==================================================

    const records = [
      ...revenueRecords,
      ...expenseRecords,
    ];

    // ==================================================
    // SORT RECORDS
    // NEWEST DATE FIRST
    //
    // Dates are YYYY-MM-DD strings.
    // String comparison is safe for this format and
    // avoids unnecessary timezone conversion.
    // ==================================================

    records.sort(
      (a, b) => {
        const dateA =
          String(
            a.date || ""
          );

        const dateB =
          String(
            b.date || ""
          );

        if (
          dateA !== dateB
        ) {
          return dateB.localeCompare(
            dateA
          );
        }

        const timeA =
          String(
            a.time || ""
          );

        const timeB =
          String(
            b.time || ""
          );

        return timeB.localeCompare(
          timeA
        );
      }
    );

    // ==================================================
    // TOTAL REVENUE
    // ==================================================

    const totalRevenue =
      revenueRecords.reduce(
        (
          total,
          record
        ) =>
          total +
          Number(
            record.amount || 0
          ),
        0
      );

    // ==================================================
    // TOTAL EXPENSES
    // ==================================================

    const totalExpenses =
      expenseRecords.reduce(
        (
          total,
          record
        ) =>
          total +
          Math.abs(
            Number(
              record.amount || 0
            )
          ),
        0
      );

    // ==================================================
    // NET PROFIT
    // ==================================================

    const netProfit =
      totalRevenue -
      totalExpenses;

    // ==================================================
    // SUCCESS RESPONSE
    // ==================================================

    return res.status(200).json({
      success: true,

      garage: {
        garageId:
          garage.garage_id,

        garageName:
          garage.garage_name ||
          "",
      },

      summary: {
        totalRevenue,

        totalExpenses,

        netProfit,

        totalRevenueRecords:
          revenueRecords.length,

        totalExpenseRecords:
          expenseRecords.length,

        totalRecords:
          records.length,
      },

      records,
    });
  } catch (error) {
    // ==================================================
    // ERROR LOG
    // ==================================================

    console.error(
      "========== GET PROFIT LOSS ERROR =========="
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
      "==========================================="
    );

    return res.status(500).json({
      success: false,

      message:
        error.sqlMessage ||
        "Unable to load garage profit and loss data.",
    });
  }
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  getGarageProfitLoss,
};