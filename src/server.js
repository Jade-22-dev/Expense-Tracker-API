import "dotenv/config";
import app from "./app.js";
import pool from "./configs/db.js";

const PORT = process.env.PORT || 3000;
if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is not set in .env");
  process.exit(1);
}

try {
  await pool.query("SELECT 1");
  console.log("Database connected");
} catch (error) {
  console.error("Database connection failed");
  console.error("code:", error.code);
  console.error("message:", error.message || "(no message)");

  if (error.errors) {
    for (const err of error.errors) {
      console.error(`  tried ${err.address}:${err.port} -> ${err.code}`);
    }
  }

  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});