import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./src/routes/auth.routes.js";
import attendanceRoutes from "./src/routes/attendance.routes.js";
import { poolPromise } from "./src/config/db.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/attendance", attendanceRoutes);

poolPromise
  .then(() => console.log("✅ Connected to SQL Server"))
  .catch((err) => console.error("❌ DB Connection Failed", err));

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
