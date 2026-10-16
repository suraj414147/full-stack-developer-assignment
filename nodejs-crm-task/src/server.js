require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");

const port = Number(process.env.PORT) || 5000;

async function start() {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing. Copy .env.example to .env and set a secret.");
  }
  await connectDB();
  app.listen(port, () => console.log(`CRM API listening on http://localhost:${port}`));
}

start().catch((error) => {
  console.error("Failed to start API:", error.message);
  process.exit(1);
});
