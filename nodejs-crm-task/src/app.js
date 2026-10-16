const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const leadRoutes = require("./routes/leads.routes");

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",").map((item) => item.trim()) : true
}));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({
    name: "CRM Lead Management API",
    status: "running",
    endpoints: {
      register: "POST /api/auth/register",
      login: "POST /api/auth/login",
      currentEmployee: "GET /api/auth/me",
      publicEnquiry: "POST /api/leads/public",
      unclaimedLeads: "GET /api/leads/unclaimed",
      claimLead: "POST /api/leads/:id/claim",
      myClaimedLeads: "GET /api/leads/mine"
    }
  });
});

app.get("/health", (req, res) => res.json({ success: true, status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);

app.use((req, res) => res.status(404).json({ success: false, message: "Route not found." }));

app.use((error, req, res, next) => {
  if (error && error.code === 11000) {
    return res.status(409).json({ success: false, message: "A record with this unique value already exists." });
  }
  if (error && error.name === "CastError") {
    return res.status(400).json({ success: false, message: "Invalid ID format." });
  }
  console.error(error);
  res.status(500).json({ success: false, message: "Internal server error." });
});

module.exports = app;
