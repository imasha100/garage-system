const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./config/db");

// ==============================
// Route Imports
// ==============================

// Login
const loginRoutes = require(
  "./routes/loginRoutes"
);

// Technician
const technicianRoutes = require(
  "./routes/technicianRoutes"
);

// Assistance
const assistanceRoutes = require(
  "./routes/assistanceRoutes"
);

// Garage
const garageRoutes = require(
  "./routes/garageRoutes"
);

// Garage Owner
const ownerRoutes = require(
  "./routes/ownerRoutes"
);

// Internal Tow Truck
const truckRoutes = require(
  "./routes/truckRoutes"
);

// External Tow Truck Registration Requests
const externalTruckRequestRoutes = require(
  "./routes/externalTruckRequestRoutes"
);

// Customer Service Requests
const serviceRequestRoutes = require(
  "./routes/serviceRequestRoutes"
);

// Service Jobs / Technician Assignment
const serviceJobRoutes = require(
  "./routes/serviceJobRoutes"
);

// Tow Dispatch
const towDispatchRoutes = require(
  "./routes/towDispatchRoutes"
);

// Vehicle Types
const vehicleTypeRoutes = require(
  "./routes/vehicleTypeRoutes"
);

// ==============================
// Chat Routes
// ==============================

const chatRoutes = require(
  "./routes/chatRoutes"
);

// ==============================
// Feedback Routes
// ==============================

const feedbackRoutes = require(
  "./routes/feedbackRoutes"
);

// ==============================
// Time Extension Routes
// ==============================

const timeExtensionRoutes = require(
  "./routes/timeExtensionRoutes"
);

// ==============================
// Express App
// ==============================

const app = express();

// ==============================
// Database Connection
// ==============================

(async () => {
  try {
    const connection =
      await db.getConnection();

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
app.use(
  "/api",
  loginRoutes
);

// Technician
app.use(
  "/api",
  technicianRoutes
);

// Assistance
app.use(
  "/api",
  assistanceRoutes
);

// Internal Tow Truck
app.use(
  "/api",
  truckRoutes
);

// External Tow Truck Registration Requests
app.use(
  "/api",
  externalTruckRequestRoutes
);

// Customer Service Requests
app.use(
  "/api",
  serviceRequestRoutes
);

// ==============================
// Service Jobs / Technician Assignment
// ==============================

app.use(
  "/api",
  serviceJobRoutes
);

// ==============================
// Time Extension
// ==============================

app.use(
  "/api",
  timeExtensionRoutes
);

// Tow Dispatch
app.use(
  "/api",
  towDispatchRoutes
);

// Vehicle Types
app.use(
  "/api",
  vehicleTypeRoutes
);

// Garage
app.use(
  "/api/garages",
  garageRoutes
);

// Garage Owner
app.use(
  "/api/owners",
  ownerRoutes
);

// ==============================
// Customer ↔ Assistance Chat
// ==============================

app.use(
  "/api",
  chatRoutes
);

// ==============================
// Customer Feedback
// ==============================

app.use(
  "/api",
  feedbackRoutes
);

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
    message:
      "API route not found.",
  });
});

// ==============================
// Server
// ==============================

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});