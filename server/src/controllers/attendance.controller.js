import Attendance from "../models/Attendance.js";
import { getDistanceInMeters } from "../utils/geo.js";
import User from "../models/User.js";
import axios from "axios";
import FormData from "form-data";

const OFFICE_LAT = 18.7684826;
const OFFICE_LNG = 82.9193406;
const ALLOWED_RADIUS = 100;

const verifyFace = async (selfieBuffer, profileImageUrl) => {
  try {
    const formData = new FormData();
    const response = await axios.get(profileImageUrl, {
      responseType: "stream",
    });

    formData.append("source_image", response.data, "profile.jpg");
    formData.append("target_image", selfieBuffer, "selfie.jpg");

    const pythonRes = await axios.post(
      process.env.PYTHON_SERVICE_URL || "http://127.0.0.1:8000/verify",
      formData,
      {
        headers: { ...formData.getHeaders() },
      },
    );

    return pythonRes.data;
  } catch (error) {
    console.error("Python Service Error:", error.message);
    throw new Error("Face verification service is offline");
  }
};

export const markAttendance = async (req, res) => {
  // 1. Get selfie from multer (assuming you use upload.single('selfie'))
  // and other data from req.body
  const { userId, latitude, longitude } = req.body;
  const selfieFile = req.file;

  if (!selfieFile) {
    return res
      .status(400)
      .json({ message: "Selfie is required for verification" });
  }

  try {
    // 2. Geo-Fence Check
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

    // 3. Get User for Profile Image
    const user = await User.findById(userId);
    if (!user || !user.profileImage) {
      return res.status(400).json({ message: "User profile image not found" });
    }

    // 4. FACE VERIFICATION (The Python Call)
    const faceResult = await verifyFace(selfieFile.buffer, user.profileImage);

    if (!faceResult.match) {
      return res.status(401).json({
        message: "Face verification failed. Please try again.",
      });
    }

    // 5. Date & Record Setup (If verified)
    const now = new Date();
    const currentYear = now.getFullYear().toString();
    const currentMonth = (now.getMonth() + 1).toString();
    const currentDay = now.getDate();

    const newRecord = {
      day: currentDay,
      time: now.toLocaleTimeString(),
      status: "Present",
      latitude,
      longitude,
      timestamp: now,
      similarity: faceResult.similarity_score, // Optional: save how accurate the match was
    };

    // 6. Database Update
    let attendanceDoc = await Attendance.findOne({ userId });
    if (!attendanceDoc) {
      attendanceDoc = new Attendance({ userId, years: {} });
    }

    // Ensure nesting exists
    if (!attendanceDoc.years[currentYear])
      attendanceDoc.years[currentYear] = {};
    if (!attendanceDoc.years[currentYear][currentMonth]) {
      attendanceDoc.years[currentYear][currentMonth] = [];
    }

    const monthRecords = attendanceDoc.years[currentYear][currentMonth];
    if (monthRecords.find((r) => r.day === currentDay)) {
      return res
        .status(400)
        .json({ message: "Attendance already marked for today" });
    }

    attendanceDoc.years[currentYear][currentMonth].push(newRecord);
    attendanceDoc.markModified("years");
    await attendanceDoc.save();

    res.json({ message: "Face verified! Attendance marked successfully." });
  } catch (err) {
    console.error("Attendance Error:", err.message);
    res.status(500).json({ message: err.message || "Server error" });
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
