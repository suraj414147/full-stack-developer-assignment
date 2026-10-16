import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import crypto from "node:crypto";

dotenv.config();
const app = express();
const PORT = Number(process.env.PORT || 4000);
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));

const restaurants = [
  { id: "1", name: "Olive & Thyme", cuisine: "Mediterranean", rating: 4.8, deliveryTime: "20–30 min", priceRange: "₹₹", category: "Healthy", description: "Fresh bowls, grilled plates and seasonal ingredients.", emoji: "🥗" },
  { id: "2", name: "The Curry House", cuisine: "Indian", rating: 4.7, deliveryTime: "25–35 min", priceRange: "₹₹", category: "Popular", description: "Comforting curries, fragrant rice and warm naan.", emoji: "🍛" },
  { id: "3", name: "Pasta District", cuisine: "Italian", rating: 4.6, deliveryTime: "20–30 min", priceRange: "₹₹₹", category: "Popular", description: "Hand-tossed pasta, rich sauces and wood-fired flavours.", emoji: "🍝" },
  { id: "4", name: "Little Bao Club", cuisine: "Asian", rating: 4.5, deliveryTime: "30–40 min", priceRange: "₹₹", category: "New", description: "Steamed buns, noodles and vibrant Asian street food.", emoji: "🥡" },
  { id: "5", name: "Green Fork", cuisine: "Healthy", rating: 4.7, deliveryTime: "15–25 min", priceRange: "₹₹", category: "Healthy", description: "Plant-forward meals made for everyday cravings.", emoji: "🥑" },
  { id: "6", name: "Sweet Moment", cuisine: "Desserts", rating: 4.9, deliveryTime: "15–25 min", priceRange: "₹", category: "Desserts", description: "Small-batch desserts, cakes and little treats.", emoji: "🍰" }
];
// Demo-only in-memory stores. Use a database and a real OTP provider in production.
const pendingOtps = new Map();
const sessions = new Map();

app.get("/api/health", (_req, res) => res.json({ success: true, message: "Savour API is running" }));

app.get("/api/restaurants", (req, res) => {
  const search = String(req.query.search || "").trim().toLowerCase();
  const category = String(req.query.category || "").trim().toLowerCase();
  const results = restaurants.filter((restaurant) => {
    const searchable = `${restaurant.name} ${restaurant.cuisine} ${restaurant.description}`.toLowerCase();
    const matchesSearch = !search || searchable.includes(search);
    const matchesCategory = !category || category === "all" ||
      restaurant.cuisine.toLowerCase() === category ||
      restaurant.category.toLowerCase() === category;
    return matchesSearch && matchesCategory;
  });
  return res.json({ success: true, count: results.length, data: results });
});

app.get("/api/restaurants/:id", (req, res) => {
  const restaurant = restaurants.find((item) => item.id === req.params.id);
  if (!restaurant) return res.status(404).json({ success: false, message: "Restaurant not found" });
  return res.json({ success: true, data: restaurant });
});

app.post("/api/auth/register", (req, res) => {
  const name = String(req.body?.name || "").trim();
  const email = String(req.body?.email || "").trim().toLowerCase();
  if (name.length < 2) return res.status(400).json({ success: false, message: "Please provide a valid name." });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: "Please provide a valid email address." });
  }
  const otp = "123456"; // Fixed demo OTP; never use in production.
  pendingOtps.set(email, { otp, name, expiresAt: Date.now() + 5 * 60 * 1000 });
  return res.status(200).json({
    success: true,
    message: "Demo OTP requested. Use 123456 locally; no email was sent.",
    demoOtp: otp
  });
});

app.post("/api/auth/login", (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const otp = String(req.body?.otp || "").trim();
  const pending = pendingOtps.get(email);
  if (!pending || pending.expiresAt < Date.now()) {
    pendingOtps.delete(email);
    return res.status(400).json({ success: false, message: "OTP not found or expired. Request a new OTP." });
  }
  if (otp !== pending.otp) return res.status(401).json({ success: false, message: "Invalid OTP." });
  pendingOtps.delete(email);
  const token = crypto.randomBytes(24).toString("hex");
  const user = { name: pending.name, email };
  sessions.set(token, { user, createdAt: Date.now() });
  return res.json({ success: true, message: "Login successful.", token, user });
});

app.use((req, res) => res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.path}` }));
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ success: false, message: "Internal server error." });
});

app.listen(PORT, () => console.log(`Savour API listening at http://localhost:${PORT}`));
