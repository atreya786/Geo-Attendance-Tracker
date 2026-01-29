import express from "express";
import {
  markAttendance,
  getAttendanceHistory,
  getTodayAttendanceStatus,
} from "../controllers/attendance.controller.js";

const router = express.Router();

router.post("/mark", markAttendance);
router.get("/history/:userId", getAttendanceHistory);
router.get("/today/:userId", getTodayAttendanceStatus);

export default router;
