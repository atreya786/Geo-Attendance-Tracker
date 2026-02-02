import Attendance from "../models/Attendance.js"; // Import the model
import { getDistanceInMeters } from "../utils/geo.js";

// OFFICE LOCATION
const OFFICE_LAT = 18.7684826;
const OFFICE_LNG = 82.9193406;
const ALLOWED_RADIUS = 100; // meters

// Helper: Get today's date at midnight (00:00:00) to mimic SQL 'DATE' type
const getTodayNormalized = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export const markAttendance = async (req, res) => {
  const { userId, latitude, longitude } = req.body;

  // 1. GEO-FENCE CHECK (Logic remains identical)
  const distance = getDistanceInMeters(
    latitude,
    longitude,
    OFFICE_LAT,
    OFFICE_LNG,
  );

  if (distance > ALLOWED_RADIUS) {
    return res.status(403).json({
      message: "You are outside the allowed office area",
    });
  }

  try {
    await Attendance.create({
      userId,
      latitude,
      longitude,
      isPresent: true,
      date: getTodayNormalized(),
      timestamp: new Date(),
    });

    res.json({ message: "Attendance marked successfully" });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Attendance already marked" });
    }
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAttendanceHistory = async (req, res) => {
  const { userId } = req.params;

  try {
    const history = await Attendance.find({ userId }).sort({ date: -1 }).lean();

    const formattedHistory = history.map((record) => {
      const dateObj = new Date(record.timestamp);

      return {
        attendance_date: dateObj
          .toLocaleDateString("en-GB")
          .replace(/\//g, "-"),
        attendance_time: dateObj.toLocaleTimeString("en-GB"),
        is_present: record.isPresent,
      };
    });

    res.json(formattedHistory);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getTodayAttendanceStatus = async (req, res) => {
  const { userId } = req.params;

  try {
    const record = await Attendance.findOne({
      userId,
      date: getTodayNormalized(),
    });

    res.json({
      isPresent: !!record,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
