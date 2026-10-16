const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, lowercase: true, trim: true, maxlength: 254 },
    phone: { type: String, trim: true, maxlength: 30, default: "" },
    courseInterest: { type: String, required: true, trim: true, maxlength: 150 },
    message: { type: String, trim: true, maxlength: 2000, default: "" },
    status: { type: String, enum: ["unclaimed", "claimed"], default: "unclaimed", index: true },
    claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", default: null, index: true },
    claimedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lead", leadSchema);
