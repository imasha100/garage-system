const db = require("../config/db");

// ======================================================
// EXTERNAL DRIVER LOGIN
// POST /api/external-driver/login
// ======================================================

const externalDriverLogin = async (req, res) => {
  try {
    const driverId = String(
      req.body.driverId ||
      req.body.username ||
      ""
    )
      .trim()
      .toUpperCase();

    const password = String(
      req.body.password || ""
    );

    // ==================================================
    // VALIDATION
    // ==================================================

    if (!driverId || !password) {
      return res.status(400).json({
        success: false,
        message:
          "External Driver ID and password are required.",
      });
    }

    // Example: EXT-DRV-0012
    if (!/^EXT-DRV-\d{4,}$/.test(driverId)) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a valid External Driver ID.",
      });
    }

    // ==================================================
    // CHECK LOGIN ACCOUNT
    // ==================================================

    const [loginRows] = await db.query(
      `
      SELECT
        login_id,
        user_name,
        role
      FROM login
      WHERE BINARY user_name = ?
        AND BINARY password = ?
        AND role = 'external_driver'
      LIMIT 1
      `,
      [
        driverId,
        password,
      ]
    );

    if (loginRows.length === 0) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid External Driver ID or password.",
      });
    }

    const loginAccount =
      loginRows[0];

    // ==================================================
    // GET EXTERNAL DRIVER DETAILS
    // ==================================================

    const [driverRows] = await db.query(
      `
      SELECT
        d.driver_id,
        d.full_name,
        d.nic,
        d.email,
        d.contact_number,
        d.license_number,
        d.license_expire_date,
        d.driver_status,
        d.experience_years,
        d.tow_truck_truck_id,
        d.login_login_id,

        t.truck_id,
        t.truck_number,
        t.truck_type,
        t.capacity_tons,
        t.truck_model,
        t.registration_date,
        t.latitude,
        t.longitude,
        t.truck_status,
        t.assignment_status,
        t.garage_garage_id,

        g.garage_name,
        g.contact_number
          AS garage_contact_number,
        g.address
          AS garage_address,
        g.district
          AS garage_district

      FROM truck_driver d

      INNER JOIN tow_truck t
        ON t.truck_id =
           d.tow_truck_truck_id

      LEFT JOIN garage g
        ON g.garage_id =
           t.garage_garage_id

      WHERE
        d.login_login_id = ?

        AND d.driver_status =
            'External'

        AND t.truck_status =
            'External'

      LIMIT 1
      `,
      [
        loginAccount.login_id,
      ]
    );

    if (driverRows.length === 0) {
      return res.status(403).json({
        success: false,
        message:
          "This login account is not linked to an external driver.",
      });
    }

    const driver =
      driverRows[0];

    // ==================================================
    // CHECK TRUCK STATUS
    // ==================================================

    if (
      driver.assignment_status !==
      "Active"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "This external tow truck is currently inactive. Please contact the garage.",
      });
    }

    // ==================================================
    // SUCCESS
    // ==================================================

    return res.status(200).json({
      success: true,

      message:
        "External driver login successful.",

      user: {
        loginId:
          loginAccount.login_id,

        username:
          loginAccount.user_name,

        externalDriverId:
          loginAccount.user_name,

        role:
          loginAccount.role,

        driverId:
          driver.driver_id,

        fullName:
          driver.full_name,

        nic:
          driver.nic,

        email:
          driver.email,

        contactNumber:
          driver.contact_number,

        licenseNumber:
          driver.license_number,

        licenseExpiryDate:
          driver.license_expire_date,

        experienceYears:
          driver.experience_years,

        driverStatus:
          driver.driver_status,

        truckId:
          driver.truck_id,

        truckNumber:
          driver.truck_number,

        truckType:
          driver.truck_type,

        capacityTons:
          Number(
            driver.capacity_tons
          ),

        truckModel:
          driver.truck_model,

        truckRegistrationDate:
          driver.registration_date,

        latitude:
          Number(
            driver.latitude
          ),

        longitude:
          Number(
            driver.longitude
          ),

        truckStatus:
          driver.truck_status,

        assignmentStatus:
          driver.assignment_status,

        garageId:
          driver.garage_garage_id,

        garageName:
          driver.garage_name || "",

        garageContactNumber:
          driver.garage_contact_number ||
          "",

        garageAddress:
          driver.garage_address || "",

        garageDistrict:
          driver.garage_district || "",
      },

      // Keep this too in case an older frontend
      // still expects data.driver / response.driver.
      driver: {
        loginId:
          loginAccount.login_id,

        externalDriverId:
          loginAccount.user_name,

        role:
          loginAccount.role,

        driverId:
          driver.driver_id,

        fullName:
          driver.full_name,

        nic:
          driver.nic,

        email:
          driver.email,

        contactNumber:
          driver.contact_number,

        licenseNumber:
          driver.license_number,

        licenseExpiryDate:
          driver.license_expire_date,

        experienceYears:
          driver.experience_years,

        driverStatus:
          driver.driver_status,

        truck: {
          truckId:
            driver.truck_id,

          truckNumber:
            driver.truck_number,

          truckType:
            driver.truck_type,

          capacityTons:
            Number(
              driver.capacity_tons
            ),

          truckModel:
            driver.truck_model,

          registrationDate:
            driver.registration_date,

          latitude:
            Number(
              driver.latitude
            ),

          longitude:
            Number(
              driver.longitude
            ),

          truckStatus:
            driver.truck_status,

          assignmentStatus:
            driver.assignment_status,
        },

        garage: {
          garageId:
            driver.garage_garage_id,

          garageName:
            driver.garage_name || "",

          contactNumber:
            driver.garage_contact_number ||
            "",

          address:
            driver.garage_address || "",

          district:
            driver.garage_district || "",
        },
      },
    });
  } catch (error) {
    console.error(
      "========== EXTERNAL DRIVER LOGIN ERROR =========="
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
      "================================================="
    );

    return res.status(500).json({
      success: false,

      message:
        error.sqlMessage ||
        "Server error. Please try again.",
    });
  }
};

// ======================================================
// CHANGE EXTERNAL DRIVER PASSWORD
// PUT /api/external-driver/change-password
// ======================================================

const changeExternalDriverPassword =
  async (req, res) => {
    try {
      const loginId =
        Number(
          req.body.loginId
        );

      const currentPassword =
        String(
          req.body.currentPassword ||
          ""
        );

      const newPassword =
        String(
          req.body.newPassword ||
          ""
        );

      const confirmPassword =
        String(
          req.body.confirmPassword ||
          ""
        );

      // ==================================================
      // VALIDATION
      // ==================================================

      if (
        !Number.isInteger(
          loginId
        ) ||
        loginId <= 0
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "A valid external driver login ID is required.",
          });
      }

      if (
        !currentPassword ||
        !newPassword ||
        !confirmPassword
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Current password, new password and confirm password are required.",
          });
      }

      if (
        newPassword.length < 8
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "New password must contain at least 8 characters.",
          });
      }

      if (
        newPassword.length > 20
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "New password cannot contain more than 20 characters.",
          });
      }

      if (
        newPassword !==
        confirmPassword
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "New password and confirm password do not match.",
          });
      }

      if (
        currentPassword ===
        newPassword
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "New password must be different from the current password.",
          });
      }

      // ==================================================
      // CHECK CURRENT PASSWORD
      // ==================================================

      const [loginRows] =
        await db.query(
          `
          SELECT
            login_id,
            user_name,
            role
          FROM login
          WHERE
            login_id = ?
            AND BINARY password = ?
            AND role =
                'external_driver'
          LIMIT 1
          `,
          [
            loginId,
            currentPassword,
          ]
        );

      if (
        loginRows.length === 0
      ) {
        return res
          .status(401)
          .json({
            success: false,

            message:
              "Current password is incorrect.",
          });
      }

      // ==================================================
      // CONFIRM EXTERNAL DRIVER LINK
      // ==================================================

      const [driverRows] =
        await db.query(
          `
          SELECT
            driver_id
          FROM truck_driver
          WHERE
            login_login_id = ?
            AND driver_status =
                'External'
          LIMIT 1
          `,
          [
            loginId,
          ]
        );

      if (
        driverRows.length === 0
      ) {
        return res
          .status(403)
          .json({
            success: false,

            message:
              "This login account is not linked to an external driver profile.",
          });
      }

      // ==================================================
      // UPDATE PASSWORD
      // ==================================================

      await db.query(
        `
        UPDATE login
        SET password = ?
        WHERE
          login_id = ?
          AND role =
              'external_driver'
        `,
        [
          newPassword,
          loginId,
        ]
      );

      // ==================================================
      // CLEAR TEMP PASSWORD FROM APPROVAL REQUEST
      //
      // Once the driver changes the password, the
      // original temporary password should no longer
      // appear as an active credential.
      // ==================================================

      await db.query(
        `
        UPDATE
          truck_registration_request

        SET
          temporary_password =
            NULL

        WHERE
          approved_login_id = ?

          AND status =
              'Approved'
        `,
        [
          loginId,
        ]
      );

      return res
        .status(200)
        .json({
          success: true,

          message:
            "Password updated successfully.",
        });
    } catch (error) {
      console.error(
        "========== CHANGE EXTERNAL DRIVER PASSWORD ERROR =========="
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
        "==========================================================="
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            error.sqlMessage ||
            "Unable to change password. Please try again.",
        });
    }
  };

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  externalDriverLogin,
  changeExternalDriverPassword,
};