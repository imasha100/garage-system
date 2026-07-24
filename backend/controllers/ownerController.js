const db = require("../config/db");

// =======================================
// Get Logged-in Garage Owner Profile
// GET /api/owners/profile/:loginId
// =======================================
const getOwnerProfile = async (req, res) => {
  try {
    const loginId = Number(req.params.loginId);

    if (!Number.isInteger(loginId) || loginId <= 0) {
      return res.status(400).json({
        success: false,
        message: "A valid login ID is required.",
      });
    }

    const [owners] = await db.query(
      `
      SELECT
        go.garage_owner_id,
        go.full_name,
        go.email,
        go.contact_number,
        go.joined_date,
        go.nic,
        go.login_login_id,
        go.garage_garage_id,

        g.garage_id,
        g.garage_code,
        g.garage_name,
        g.contact_number AS garage_contact_number,
        g.address AS garage_address,
        g.latitude,
        g.longitude,
        g.capacity,
        g.opening_time,
        g.closing_time,
        g.shift_type,
        g.district,
        g.working_days

      FROM garage_owner AS go

      INNER JOIN garage AS g
        ON g.garage_id = go.garage_garage_id

      WHERE go.login_login_id = ?

      LIMIT 1
      `,
      [loginId]
    );

    if (owners.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Garage owner profile was not found.",
      });
    }

    const owner = owners[0];

    return res.status(200).json({
      success: true,
      message: "Garage owner profile loaded successfully.",
      data: {
        owner: {
          garageOwnerId: owner.garage_owner_id,
          fullName: owner.full_name,
          email: owner.email,
          contactNumber: owner.contact_number,
          joinedDate: owner.joined_date,
          nic: owner.nic,
          loginId: owner.login_login_id,
        },

        garage: {
          garageId: owner.garage_id,
          garageCode: owner.garage_code,
          garageName: owner.garage_name,
          contactNumber: owner.garage_contact_number,
          address: owner.garage_address,
          latitude: Number(owner.latitude),
          longitude: Number(owner.longitude),
          capacity: Number(owner.capacity),
          openingTime: owner.opening_time,
          closingTime: owner.closing_time,
          shiftType: owner.shift_type,
          district: owner.district,
          workingDays: owner.working_days,
        },
      },
    });
  } catch (error) {
    console.error("========== OWNER PROFILE ERROR ==========");
    console.error("Code:", error.code);
    console.error("Message:", error.message);
    console.error("SQL Message:", error.sqlMessage);
    console.error("SQL:", error.sql);
    console.error("=========================================");

    if (error.code === "ER_BAD_FIELD_ERROR") {
      return res.status(500).json({
        success: false,
        message:
          "A database column name does not match the owner controller query.",
        error: error.sqlMessage || error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message:
        error.sqlMessage ||
        error.message ||
        "Unable to load the garage owner profile.",
    });
  }
};

module.exports = {
  getOwnerProfile,
};