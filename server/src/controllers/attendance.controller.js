import { poolPromise, sql } from "../config/db.js";
import { getDistanceInMeters } from "../utils/geo.js";

// OFFICE LOCATION
const OFFICE_LAT = 18.7684826;
const OFFICE_LNG = 82.9193406;
const ALLOWED_RADIUS = 100; // meters

export const markAttendance = async (req, res) => {
  const { userId, latitude, longitude } = req.body;

  // GEO-FENCE CHECK
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
    const pool = await poolPromise;

    await pool
      .request()
      .input("userId", sql.Int, userId)
      .input("lat", sql.Decimal(10, 8), latitude)
      .input("lng", sql.Decimal(11, 8), longitude).query(`
        INSERT INTO attendance
        (user_id, attendance_date, attendance_time, is_present, latitude, longitude)
        VALUES (
          @userId,
          CAST(GETDATE() AS DATE),
          CAST(GETDATE() AS TIME),
          1,
          @lat,
          @lng
        )
      `);

    res.json({ message: "Attendance marked successfully" });
  } catch (err) {
    if (err.number === 2627) {
      return res.status(400).json({ message: "Attendance already marked" });
    }
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAttendanceHistory = async (req, res) => {
  const { userId } = req.params;

  try {
    const pool = await poolPromise;

    const result = await pool.request().input("userId", sql.Int, userId).query(`
        SELECT 
          CONVERT(char(10), attendance_date, 105) AS attendance_date,
          attendance_time,
          is_present
        FROM attendance
        WHERE user_id = @userId
        ORDER BY attendance_date DESC
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getTodayAttendanceStatus = async (req, res) => {
  const { userId } = req.params;

  try {
    const pool = await poolPromise;

    const result = await pool.request().input("userId", sql.Int, userId).query(`
        SELECT is_present
        FROM attendance
        WHERE user_id = @userId
        AND attendance_date = CAST(GETDATE() AS DATE)
      `);

    res.json({
      isPresent: result.recordset.length > 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
