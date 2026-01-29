import { db } from "../config/db.js";
import { getDistanceInMeters } from "../utils/geo.js";

// OFFICE LOCATION (FIXED)
const OFFICE_LAT = 18.7684826;
const OFFICE_LNG = 82.9193406;
const ALLOWED_RADIUS = 100; // meters

export const markAttendance = async (req, res) => {
  const { userId, latitude, longitude } = req.body;

  const distance = getDistanceInMeters(
    latitude,
    longitude,
    OFFICE_LAT,
    OFFICE_LNG,
  );

  if (distance > ALLOWED_RADIUS) {
    return res.status(403).json({
      message: "You are outside office location",
    });
  }

  try {
    await db.query(
      `INSERT INTO attendance (user_id, attendance_date, is_present, latitude, longitude)
       VALUES (?, CURDATE(),1, ?, ?)`,
      [userId, latitude, longitude],
    );

    res.json({ message: "Attendance marked successfully" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        message: "Attendance already marked today",
      });
    }
    res.status(500).json({ message: "Attendance failed" });
  }
};

export const getAttendanceHistory = async (req, res) => {
  const { userId } = req.params;

  const [rows] = await db.query(
    `SELECT attendance_date, is_present
     FROM attendance
     WHERE user_id = ?
     ORDER BY attendance_date DESC`,
    [userId],
  );

  res.json(rows);
};

export const getTodayAttendanceStatus = async (req, res) => {
  const { userId } = req.params;

  const [rows] = await db.query(
    `SELECT is_present
     FROM attendance
     WHERE user_id = ? AND attendance_date = CURDATE()`,
    [userId],
  );

  if (rows.length === 0) {
    return res.json({ isPresent: false });
  }

  res.json({ isPresent: !!rows[0].is_present });
};
