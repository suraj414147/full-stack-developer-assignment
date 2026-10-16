const express = require("express");
const { body, validationResult } = require("express-validator");
const Lead = require("../models/Lead");
const asyncHandler = require("../utils/asyncHandler");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: "Validation failed.", errors: errors.array() });
  }
  next();
}

// Public enquiry form: no JWT required.
// POST /api/leads/public
router.post(
  "/public",
  [
    body("name").trim().notEmpty().withMessage("Name is required."),
    body("email").isEmail().withMessage("A valid email is required."),
    body("courseInterest").trim().notEmpty().withMessage("Course interest is required."),
    body("phone").optional().isString(),
    body("message").optional().isString()
  ],
  validate,
  asyncHandler(async (req, res) => {
    const lead = await Lead.create({
      name: req.body.name.trim(),
      email: req.body.email.toLowerCase().trim(),
      phone: req.body.phone || "",
      courseInterest: req.body.courseInterest.trim(),
      message: req.body.message || ""
    });
    res.status(201).json({
      success: true,
      message: "Enquiry submitted successfully.",
      lead: {
        id: lead._id,
        name: lead.name,
        email: lead.email,
        courseInterest: lead.courseInterest,
        status: lead.status,
        createdAt: lead.createdAt
      }
    });
  })
);

// Public enquiries visible to all authenticated employees until claimed.
// GET /api/leads/unclaimed
router.get(
  "/unclaimed",
  requireAuth,
  asyncHandler(async (req, res) => {
    const leads = await Lead.find({ status: "unclaimed" }).sort({ createdAt: -1 });
    res.json({ success: true, count: leads.length, leads });
  })
);

// Claim a public enquiry. Atomic update prevents two employees claiming the same lead.
// POST /api/leads/:id/claim
router.post(
  "/:id/claim",
  requireAuth,
  asyncHandler(async (req, res) => {
    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, status: "unclaimed", claimedBy: null },
      { $set: { status: "claimed", claimedBy: req.employee._id, claimedAt: new Date() } },
      { new: true, runValidators: true }
    ).populate("claimedBy", "name email role");

    if (!lead) {
      const exists = await Lead.exists({ _id: req.params.id });
      if (!exists) return res.status(404).json({ success: false, message: "Lead not found." });
      return res.status(409).json({ success: false, message: "This lead has already been claimed." });
    }
    res.json({ success: true, message: "Lead claimed successfully.", lead });
  })
);

// Claimed leads belonging only to the currently logged-in employee.
// GET /api/leads/mine
router.get(
  "/mine",
  requireAuth,
  asyncHandler(async (req, res) => {
    const leads = await Lead.find({ status: "claimed", claimedBy: req.employee._id }).sort({ claimedAt: -1 });
    res.json({ success: true, count: leads.length, leads });
  })
);

// GET /api/leads/:id (protected, only public/unclaimed or owner can read)
router.get(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const lead = await Lead.findById(req.params.id).populate("claimedBy", "name email role");
    if (!lead) return res.status(404).json({ success: false, message: "Lead not found." });
    if (lead.status === "claimed" && String(lead.claimedBy?._id || lead.claimedBy) !== String(req.employee._id)) {
      return res.status(403).json({ success: false, message: "This lead belongs to another employee." });
    }
    res.json({ success: true, lead });
  })
);

module.exports = router;
