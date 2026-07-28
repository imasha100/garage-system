const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./config/db");

// ==============================
// Route Imports
// ==============================
const loginRoutes = require("./routes/loginRoutes");

const technicianRoutes = require(
  "./routes/technicianRoutes"
);

const assistanceRoutes = require(
  "./routes/assistanceRoutes"
);

const garageRoutes = require(
  "./routes/garageRoutes"
);

const ownerRoutes = require(
  "./routes/ownerRoutes"
);

const truckRoutes = require(
  "./routes/truckRoutes"
);

const externalTruckRequestRoutes = require(
  "./routes/externalTruckRequestRoutes"
);

const serviceRequestRoutes = require(
  "./routes/serviceRequestRoutes"
);

const vehicleTypeRoutes = require(
  "./routes/vehicleTypeRoutes"
);

const app = express();

// ==============================
// Database Connection
// ==============================
(async () => {
  try {
    const connection = await db.getConnection();

    console.log(
      "MySQL database connected successfully"
    );

    connection.release();
  } catch (error) {
    console.error(
      "Database connection failed:",
      error.message
    );
  }
})();

// ==============================
// Middleware
// ==============================
app.use(cors());
app.use(express.json());

// ==============================
// API Routes
// ==============================

// Login
app.use("/api", loginRoutes);

// Technician
app.use("/api", technicianRoutes);

// Assistance
app.use("/api", assistanceRoutes);

// Internal Tow Truck
app.use("/api", truckRoutes);

// External Tow Truck Registration Requests
app.use("/api", externalTruckRequestRoutes);

// Customer Service Requests
app.use("/api", serviceRequestRoutes);

// Vehicle Types
app.use("/api", vehicleTypeRoutes);

// Garage
app.use("/api/garages", garageRoutes);

// Garage Owner
app.use("/api/owners", ownerRoutes);

// ==============================
// Test Route
// ==============================
app.get("/", (req, res) => {
  res.send(
    "Garage System Backend is Running..."
  );
});

// ==============================
// 404 Route
// ==============================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found.",
  });
});

// ==============================
// Server
// ==============================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});