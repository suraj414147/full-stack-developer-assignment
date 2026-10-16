const jwt = require("jsonwebtoken");
const Employee = require("../models/Employee");

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");
    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ success: false, message: "Authorization token required." });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const employee = await Employee.findById(payload.sub).select("name email role");
    if (!employee) {
      return res.status(401).json({ success: false, message: "Account no longer exists." });
    }
    req.employee = employee;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
}

module.exports = { requireAuth };
