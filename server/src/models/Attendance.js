import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  date: {
    type: Date,
    required: true,
    set: (d) => {
      const date = new Date(d);
      date.setHours(0, 0, 0, 0);
      return date;
    },
  },

  timestamp: { type: Date, default: Date.now },
  isPresent: { type: Boolean, default: true },
  latitude: { type: Number },
  longitude: { type: Number },
});

attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model("Attendance", attendanceSchema);
