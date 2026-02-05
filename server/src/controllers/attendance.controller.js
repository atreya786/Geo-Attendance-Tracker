import Attendance from "../models/Attendance.js";
import { getDistanceInMeters } from "../utils/geo.js";
import User from "../models/User.js";

const OFFICE_LAT = 18.7684826;
const OFFICE_LNG = 82.9193406;
const ALLOWED_RADIUS = 100;

export const markAttendance = async (req, res) => {
  const { userId, latitude, longitude } = req.body;

  // 1. Geo-Fence Check
  const distance = getDistanceInMeters(
    latitude,
    longitude,
    OFFICE_LAT,
    OFFICE_LNG,
  );
  if (distance > ALLOWED_RADIUS) {
    return res
      .status(403)
      .json({ message: "You are outside the allowed office area" });
  }

  // 2. Date Setup
  const now = new Date();
  const currentYear = now.getFullYear().toString(); // "2026"
  const currentMonth = (now.getMonth() + 1).toString(); // "2" (or "02")
  const currentDay = now.getDate(); // 5

  const newRecord = {
    day: currentDay,
    time: now.toLocaleTimeString(), // "10:30:00 AM"
    status: "Present",
    latitude,
    longitude,
    timestamp: now,
  };

  try {
    let attendanceDoc = await Attendance.findOne({ userId });

    if (!attendanceDoc) {
      attendanceDoc = new Attendance({ userId, years: {} });
    }

    if (!attendanceDoc.years[currentYear]) {
      attendanceDoc.years[currentYear] = {};
    }
    if (!attendanceDoc.years[currentYear][currentMonth]) {
      attendanceDoc.years[currentYear][currentMonth] = [];
    }

    const monthRecords = attendanceDoc.years[currentYear][currentMonth];
    const alreadyMarked = monthRecords.find((r) => r.day === currentDay);

    if (alreadyMarked) {
      return res
        .status(400)
        .json({ message: "Attendance already marked for today" });
    }
    attendanceDoc.years[currentYear][currentMonth].push(newRecord);

    attendanceDoc.markModified("years");

    await attendanceDoc.save();

    res.json({ message: "Attendance marked successfully" });
  } catch (err) {
    console.error("Attendance Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET HISTORY (Simplified!)
export const getAttendanceHistory = async (req, res) => {
  const { userId } = req.params;

  try {
    const doc = await Attendance.findOne({ userId });

    if (!doc) return res.json({});

    res.json(doc.years);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getTodayAttendanceStatus = async (req, res) => {
  const { userId } = req.params;
  const now = new Date();
  const currentYear = now.getFullYear().toString();
  const currentMonth = (now.getMonth() + 1).toString();
  const currentDay = now.getDate();
  try {
    const doc = await Attendance.findOne({ userId });

    if (!doc) return res.json({ isPresent: false });

    const monthRecords = doc.years?.[currentYear]?.[currentMonth] || [];
    const todayRecord = monthRecords.find((r) => r.day === currentDay);

    res.json({ isPresent: !!todayRecord });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const searchUserByEmail = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email }).select("name _id email");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const doc = await Attendance.findOne({ userId: user._id });

    if (!doc) return res.json({ user });

    res.json({ doc: doc.years, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
