const db = require("../config/db");

const login = async (req, res) => {
  try {
    const username = req.body.username?.trim();
    const password = req.body.password;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required.",
      });
    }

    // Check username and password from login table.
    // BINARY makes username and password case-sensitive.
    const [users] = await db.query(
      `
      SELECT
        login_id,
        user_name
      FROM login
      WHERE BINARY user_name = ?
        AND BINARY password = ?
      LIMIT 1
      `,
      [username, password]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password.",
      });
    }

    const user = users[0];

    // Identify staff role and related garage.
    let role = null;
    let garageId = null;
    let staffId = null;

    // =======================================
    // Check Garage Owner
    // =======================================
    const [garageOwners] = await db.query(
      `
      SELECT
        garage_owner_id,
        garage_garage_id
      FROM garage_owner
      WHERE login_login_id = ?
      LIMIT 1
      `,
      [user.login_id]
    );

    if (garageOwners.length > 0) {
      role = "garage_owner";
      staffId = garageOwners[0].garage_owner_id;
      garageId = garageOwners[0].garage_garage_id;
    }

    // =======================================
    // Check Technician
    // =======================================
    if (!role) {
      const [technicians] = await db.query(
        `
        SELECT
          technician_id,
          garage_garage_id
        FROM technician
        WHERE login_login_id = ?
        LIMIT 1
        `,
        [user.login_id]
      );

      if (technicians.length > 0) {
        role = "technician";
        staffId = technicians[0].technician_id;
        garageId = technicians[0].garage_garage_id;
      }
    }

    // =======================================
    // Check Assistance Officer
    // =======================================
    if (!role) {
      const [assistanceUsers] = await db.query(
        `
        SELECT
          assistance_id,
          garage_garage_id
        FROM assistance
        WHERE login_login_id = ?
        LIMIT 1
        `,
        [user.login_id]
      );

      if (assistanceUsers.length > 0) {
        role = "assistance";
        staffId = assistanceUsers[0].assistance_id;
        garageId = assistanceUsers[0].garage_garage_id;
      }
    }

    if (!role) {
      return res.status(403).json({
        success: false,
        message: "This login account is not linked to a staff role.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      user: {
        loginId: user.login_id,
        username: user.user_name,
        role,
        staffId,
        garageId,
      },
    });
  } catch (error) {
    console.error("========== LOGIN ERROR ==========");
    console.error("Code:", error.code);
    console.error("Message:", error.message);
    console.error("SQL Message:", error.sqlMessage);
    console.error("SQL:", error.sql);
    console.error("=================================");

    return res.status(500).json({
      success: false,
      message: error.sqlMessage || "Server error. Please try again.",
    });
  }
};

module.exports = {
  login,
};