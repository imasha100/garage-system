const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./config/db");

const loginRoutes = require("./routes/loginRoutes");
const technicianRoutes = require("./routes/technicianRoutes");
const assistanceRoutes = require("./routes/assistanceRoutes");
const garageRoutes = require("./routes/garageRoutes");
const ownerRoutes = require("./routes/ownerRoutes");
const truckRoutes = require("./routes/truckRoutes");

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
app.use("/api", loginRoutes);
app.use("/api", technicianRoutes);
app.use("/api", assistanceRoutes);
app.use("/api", truckRoutes);

// Garage Routes
app.use("/api/garages", garageRoutes);

// Owner Routes
app.use("/api/owners", ownerRoutes);

// ==============================
// Test Route
// ==============================
app.get("/", (req, res) => {
  res.send("Garage System Backend is Running...");
});

// ==============================
// Server
// ==============================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});