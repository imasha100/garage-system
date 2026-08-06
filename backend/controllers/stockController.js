const db = require("../config/db");

// ======================================================
// ADD STOCK
// POST /api/stock
// ======================================================

const addStock = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const garageId = Number(req.body.garageId);

    const itemName = String(
      req.body.itemName || ""
    ).trim();

    const categoryName = String(
      req.body.categoryName || ""
    ).trim();

    const batchNumber = String(
      req.body.batchNumber || ""
    ).trim();

    const purchasePrice = Number(
      req.body.purchasePrice
    );

    const sellingPrice = Number(
      req.body.sellingPrice
    );

    const receivedQuantity = Number(
      req.body.receivedQuantity
    );

    const reorderLevel = Number(
      req.body.reorderLevel
    );

    const purchaseDate =
      req.body.purchaseDate || null;

    const expiryDate =
      req.body.expiryDate || null;

    // ==================================================
    // VALIDATION
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

    if (!itemName) {
      return res.status(400).json({
        success: false,
        message:
          "Item name is required.",
      });
    }

    if (!categoryName) {
      return res.status(400).json({
        success: false,
        message:
          "Category name is required.",
      });
    }

    if (!batchNumber) {
      return res.status(400).json({
        success: false,
        message:
          "Batch number is required.",
      });
    }

    if (
      !Number.isFinite(purchasePrice) ||
      purchasePrice < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid purchase price is required.",
      });
    }

    if (
      !Number.isFinite(sellingPrice) ||
      sellingPrice < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid selling price is required.",
      });
    }

    if (
      !Number.isInteger(receivedQuantity) ||
      receivedQuantity <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Received quantity must be greater than 0.",
      });
    }

    if (
      !Number.isInteger(reorderLevel) ||
      reorderLevel < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid reorder level is required.",
      });
    }

    // ==================================================
    // CHECK GARAGE
    // ==================================================

    const [garageRows] =
      await connection.query(
        `
        SELECT garage_id
        FROM garage
        WHERE garage_id = ?
        LIMIT 1
        `,
        [garageId]
      );

    if (garageRows.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message:
          "Garage not found.",
      });
    }

    // ==================================================
    // FIND / CREATE CATEGORY
    // ==================================================

    let categoryId;

    const [categoryRows] =
      await connection.query(
        `
        SELECT category_id
        FROM category
        WHERE LOWER(name) = LOWER(?)
        LIMIT 1
        `,
        [categoryName]
      );

    if (categoryRows.length > 0) {
      categoryId =
        categoryRows[0].category_id;
    } else {
      const [categoryInsert] =
        await connection.query(
          `
          INSERT INTO category (name)
          VALUES (?)
          `,
          [categoryName]
        );

      categoryId =
        categoryInsert.insertId;
    }

    // ==================================================
    // FIND / CREATE STOCK ITEM
    // ==================================================

    let itemId;

    const [itemRows] =
      await connection.query(
        `
        SELECT item_id
        FROM stock_item
        WHERE LOWER(item_name) = LOWER(?)
          AND category_category_id = ?
        LIMIT 1
        `,
        [
          itemName,
          categoryId,
        ]
      );

    if (itemRows.length > 0) {
      itemId =
        itemRows[0].item_id;
    } else {
      const [itemInsert] =
        await connection.query(
          `
          INSERT INTO stock_item (
            item_name,
            category_category_id,
            item_status
          )
          VALUES (?, ?, ?)
          `,
          [
            itemName,
            categoryId,
            "Active",
          ]
        );

      itemId =
        itemInsert.insertId;
    }

    // ==================================================
    // FIND / CREATE STOCK RECORD
    // ==================================================

    let stockId;

    const [stockRows] =
      await connection.query(
        `
        SELECT stock_id
        FROM stock
        WHERE garage_garage_id = ?
          AND stock_item_item_id = ?
        LIMIT 1
        `,
        [
          garageId,
          itemId,
        ]
      );

    if (stockRows.length > 0) {
      stockId =
        stockRows[0].stock_id;

      await connection.query(
        `
        UPDATE stock
        SET
          reorder_level = ?,
          last_updated_date = CURDATE(),
          last_updated_time = CURTIME()
        WHERE stock_id = ?
        `,
        [
          reorderLevel,
          stockId,
        ]
      );
    } else {
      const [stockInsert] =
        await connection.query(
          `
          INSERT INTO stock (
            garage_garage_id,
            stock_item_item_id,
            last_updated_time,
            last_updated_date,
            reorder_level
          )
          VALUES (
            ?,
            ?,
            CURTIME(),
            CURDATE(),
            ?
          )
          `,
          [
            garageId,
            itemId,
            reorderLevel,
          ]
        );

      stockId =
        stockInsert.insertId;
    }

    // ==================================================
    // CHECK DUPLICATE BATCH
    // ==================================================

    const [batchRows] =
      await connection.query(
        `
        SELECT batch_id
        FROM stock_batch
        WHERE batch_num = ?
          AND stock_stock_id = ?
        LIMIT 1
        `,
        [
          batchNumber,
          stockId,
        ]
      );

    if (batchRows.length > 0) {
      await connection.rollback();

      return res.status(409).json({
        success: false,
        message:
          "This batch number already exists for the selected stock item.",
      });
    }

    // ==================================================
    // INSERT STOCK BATCH
    // ==================================================

    const [batchInsert] =
      await connection.query(
        `
        INSERT INTO stock_batch (
          stock_stock_id,
          batch_num,
          purchase_date,
          purchase_price,
          selling_price,
          received_quantity,
          available_quantity,
          expiry_date,
          stock_zero_date
        )
        VALUES (
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          NULL
        )
        `,
        [
          stockId,
          batchNumber,
          purchaseDate,
          purchasePrice,
          sellingPrice,
          receivedQuantity,
          receivedQuantity,
          expiryDate,
        ]
      );

    await connection.commit();

    return res.status(201).json({
      success: true,
      message:
        "Stock added successfully.",

      stock: {
        stockId,
        batchId:
          batchInsert.insertId,
        itemId,
        categoryId,
        garageId,
        itemName,
        categoryName,
        batchNumber,
        purchasePrice,
        sellingPrice,
        receivedQuantity,
        availableQuantity:
          receivedQuantity,
        reorderLevel,
        purchaseDate,
        expiryDate,
      },
    });
  } catch (error) {
    await connection.rollback();

    console.error(
      "========== ADD STOCK ERROR =========="
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
      "====================================="
    );

    return res.status(500).json({
      success: false,
      message:
        error.sqlMessage ||
        "Unable to add stock.",
    });
  } finally {
    connection.release();
  }
};

// ======================================================
// GET GARAGE STOCK
// GET /api/stock/garage/:garageId
// ======================================================

const getGarageStock = async (
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

    const [rows] = await db.query(
      `
      SELECT
        s.stock_id,
        s.reorder_level,
        s.last_updated_date,
        s.last_updated_time,

        si.item_id,
        si.item_name,
        si.item_status,

        c.category_id,
        c.name AS category_name,

        sb.batch_id,
        sb.batch_num,
        sb.purchase_date,
        sb.purchase_price,
        sb.selling_price,
        sb.received_quantity,
        sb.available_quantity,
        sb.expiry_date,
        sb.stock_zero_date

      FROM stock s

      INNER JOIN stock_item si
        ON si.item_id =
           s.stock_item_item_id

      LEFT JOIN category c
        ON c.category_id =
           si.category_category_id

      INNER JOIN stock_batch sb
        ON sb.stock_stock_id =
           s.stock_id

      WHERE
        s.garage_garage_id = ?

      ORDER BY
        si.item_name ASC,
        sb.batch_id DESC
      `,
      [garageId]
    );

    const items = rows.map(
      (row) => ({
        stockId:
          row.stock_id,

        itemId:
          row.item_id,

        itemName:
          row.item_name,

        itemStatus:
          row.item_status,

        categoryId:
          row.category_id,

        categoryName:
          row.category_name ||
          "Uncategorized",

        batchId:
          row.batch_id,

        batchNumber:
          row.batch_num,

        purchaseDate:
          row.purchase_date,

        purchasePrice:
          Number(
            row.purchase_price
          ) || 0,

        sellingPrice:
          Number(
            row.selling_price
          ) || 0,

        receivedQuantity:
          Number(
            row.received_quantity
          ) || 0,

        availableQuantity:
          Number(
            row.available_quantity
          ) || 0,

        reorderLevel:
          Number(
            row.reorder_level
          ) || 0,

        expiryDate:
          row.expiry_date,

        stockZeroDate:
          row.stock_zero_date,

        lastUpdatedDate:
          row.last_updated_date,

        lastUpdatedTime:
          row.last_updated_time,

        lowStock:
          Number(
            row.available_quantity
          ) <=
          Number(
            row.reorder_level
          ),
      })
    );

    return res.status(200).json({
      success: true,
      garageId,
      items,
    });
  } catch (error) {
    console.error(
      "========== GET GARAGE STOCK ERROR =========="
    );

    console.error(
      "Message:",
      error.message
    );

    console.error(
      "SQL Message:",
      error.sqlMessage
    );

    return res.status(500).json({
      success: false,
      message:
        error.sqlMessage ||
        "Unable to load garage stock.",
    });
  }
};

// ======================================================
// GET AVAILABLE STOCK FOR BILLING
// GET /api/stock/garage/:garageId/bill-items
// ======================================================

const getGarageBillItems = async (
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

    const [rows] = await db.query(
      `
      SELECT
        sb.batch_id,
        sb.batch_num,
        sb.selling_price,
        sb.available_quantity,

        si.item_id,
        si.item_name,

        c.name AS category_name

      FROM stock_batch sb

      INNER JOIN stock s
        ON s.stock_id =
           sb.stock_stock_id

      INNER JOIN stock_item si
        ON si.item_id =
           s.stock_item_item_id

      LEFT JOIN category c
        ON c.category_id =
           si.category_category_id

      WHERE
        s.garage_garage_id = ?
        AND sb.available_quantity > 0
        AND (
          sb.expiry_date IS NULL
          OR sb.expiry_date >= CURDATE()
        )

      ORDER BY
        si.item_name ASC,
        sb.purchase_date ASC,
        sb.batch_id ASC
      `,
      [garageId]
    );

    return res.status(200).json({
      success: true,

      items: rows.map(
        (row) => ({
          batchId:
            row.batch_id,

          batchNumber:
            row.batch_num,

          itemId:
            row.item_id,

          itemName:
            row.item_name,

          categoryName:
            row.category_name ||
            "Uncategorized",

          sellingPrice:
            Number(
              row.selling_price
            ) || 0,

          availableQuantity:
            Number(
              row.available_quantity
            ) || 0,
        })
      ),
    });
  } catch (error) {
    console.error(
      "========== GET BILL ITEMS ERROR =========="
    );

    console.error(
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.sqlMessage ||
        "Unable to load billing stock items.",
    });
  }
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  addStock,
  getGarageStock,
  getGarageBillItems,
};