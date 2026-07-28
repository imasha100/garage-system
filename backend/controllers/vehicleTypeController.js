const db = require("../config/db");

const getVehicleTypes = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        vehicle_type_id,
        vehicle_type_name
      FROM vehicle_type
      ORDER BY vehicle_type_name ASC
    `);

    return res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error(
      "Get vehicle types error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.sqlMessage ||
        "Unable to load vehicle types.",
    });
  }
};

module.exports = {
  getVehicleTypes,
};