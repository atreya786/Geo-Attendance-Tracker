import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isPresentToday: false,
  history: [], // [{ attendance_date, attendance_time, is_present }]
  loading: false,
  error: null,
};

const attendanceSlice = createSlice({
  name: "attendance",
  initialState,
  reducers: {
    // Today status
    setTodayStatus: (state, action) => {
      state.isPresentToday = action.payload;
    },

    // History
    setAttendanceHistory: (state, action) => {
      state.history = action.payload;
    },

    // Loading & error
    setAttendanceLoading: (state, action) => {
      state.loading = action.payload;
    },

    setAttendanceError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setTodayStatus,
  setAttendanceHistory,
  setAttendanceLoading,
  setAttendanceError,
} = attendanceSlice.actions;

export default attendanceSlice.reducer;
