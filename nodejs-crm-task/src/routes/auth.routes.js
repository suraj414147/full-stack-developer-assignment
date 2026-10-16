const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const Employee = require("../models/Employee");
const asyncHandler = require("../utils/asyncHandler");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

function validationResponse(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: "Validation failed.", errors: errors.array() });
  }
  next();
}

function makeToken(employee) {
  return jwt.sign(
    { sub: employee._id.toString(), email: employee.email, role: employee.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );
}

// POST /api/auth/register
router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required."),
    body("email").isEmail().withMessage("A valid email is required."),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters."),
    body("role").optional().isIn(["employee", "counselor"]).withMessage("Role must be employee or counselor.")
  ],
  validationResponse,
  asyncHandler(async (req, res) => {
    const name = req.body.name.trim();
    const email = req.body.email.toLowerCase().trim();
    const existing = await Employee.findOne({ email });
    if (existing) return res.status(409).json({ success: false, message: "An account with this email already exists." });

    const passwordHash = await bcrypt.hash(req.body.password, 12);
    const employee = await Employee.create({
      name,
      email,
      passwordHash,
      role: req.body.role || "employee"
    });

    const token = makeToken(employee);
    return res.status(201).json({
      success: true,
      message: "Account registered successfully.",
      token,
      employee: { id: employee._id, name: employee.name, email: employee.email, role: employee.role }
    });
  })
);

// POST /api/auth/login
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("A valid email is required."),
    body("password").notEmpty().withMessage("Password is required.")
  ],
  validationResponse,
  asyncHandler(async (req, res) => {
    const employee = await Employee.findOne({ email: req.body.email.toLowerCase().trim() }).select("+passwordHash");
    if (!employee || !(await bcrypt.compare(req.body.password, employee.passwordHash))) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    return res.json({
      success: true,
      message: "Login successful.",
      token: makeToken(employee),
      employee: { id: employee._id, name: employee.name, email: employee.email, role: employee.role }
    });
  })
);

// GET /api/auth/me (protected)
router.get("/me", requireAuth, (req, res) => {
  res.json({ success: true, employee: req.employee });
});

module.exports = router;
