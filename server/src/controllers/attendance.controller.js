import { db } from "../config/db.js";

export const markAttendance = async (req, res) => {
  const { userId, latitude, longitude } = req.body;

  if (!userId || !latitude || !longitude) {
    return res.status(400).json({ message: "Missing data" });
  }

  try {
    await db.query(
      `INSERT INTO attendance (user_id, attendance_date, latitude, longitude)
   VALUES (?, CURDATE(), ?, ?)`,
      [userId, latitude, longitude],
    );

    res.json({ message: "Attendance marked successfully" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res
        .status(400)
        .json({ message: "Attendance already marked today" });
    }
    res.status(500).json({ message: "Attendance failed" });
  }
};

export const getAttendanceHistory = async (req, res) => {
  const { userId } = req.params;

  const [rows] = await db.query(
    `SELECT attendance_date, marked_at
   FROM attendance
   WHERE user_id = ?
   ORDER BY attendance_date DESC`,
    [userId],
  );

  res.json(rows);
};
