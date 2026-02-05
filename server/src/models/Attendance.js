import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    years: {
      type: Object,
      default: {},
    },
  },
  { minimize: false },
);

export default mongoose.model("Attendance", attendanceSchema);
