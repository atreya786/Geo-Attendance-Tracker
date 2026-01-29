import express from "express";
import {
  markAttendance,
  getAttendanceHistory,
} from "../controllers/attendance.controller.js";

const router = express.Router();

router.post("/mark", markAttendance);
router.get("/history/:userId", getAttendanceHistory);

export default router;
