const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["employee", "counselor", "admin"], default: "employee" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Employee", employeeSchema);
