import { View, Text, ActivityIndicator } from "react-native";
import { Calendar } from "react-native-calendars";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { api } from "../services/api";

export default function HistoryScreen() {
  const user = useSelector((state) => state.auth.user);
  const [markedDates, setMarkedDates] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get(`/attendance/history/${user.id}`);
      processAttendanceData(res.data);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setLoading(false);
    }
  };

  const processAttendanceData = (data) => {
    // Create a Set of present dates formatted as YYYY-MM-DD for O(1) lookup
    const presentSet = new Set();

    data.forEach((item) => {
      // Backend returns "DD-MM-YYYY" (Style 105), we need "YYYY-MM-DD"
      const [day, month, year] = item.attendance_date.split("-");
      const isoDate = `${year}-${month}-${day}`;

      if (item.is_present) {
        presentSet.add(isoDate);
      }
    });

    buildCalendarMarks(presentSet);
  };

  const buildCalendarMarks = (presentSet) => {
    const marks = {};
    const today = new Date();

    // Iterate over the last 31 days including today
    for (let i = 0; i < 31; i++) {
      const date = new Date();
      date.setDate(today.getDate() - i);

      const dateStr = date.toISOString().split("T")[0]; // YYYY-MM-DD
      const dayOfWeek = date.getDay(); // 0 = Sunday

      // 1. PRESENT (From API Data)
      if (presentSet.has(dateStr)) {
        marks[dateStr] = getStyle("#16a34a", "Present"); // Green
        continue;
      }

      // 2. TODAY (If not present yet)
      if (i === 0) {
        marks[dateStr] = getStyle("#2563eb", "Today"); // Blue
        continue;
      }

      // 3. SUNDAY (Holiday)
      if (dayOfWeek === 0) {
        marks[dateStr] = getStyle("#e1a218", "Sunday"); // Dark Yellow
        continue;
      }

      // 4. ABSENT (Past date, not Sunday, not Present)
      marks[dateStr] = getStyle("#dc2626", "Absent"); // Red
    }

    setMarkedDates(marks);
  };

  const getStyle = (color, label) => ({
    customStyles: {
      container: {
        borderWidth: 2,
        borderColor: color,
        backgroundColor: "transparent", // Hollow style
        borderRadius: 20,
      },
      text: {
        color: color,
        fontWeight: "bold",
      },
    },
  });

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fff", padding: 10 }}>
      <Calendar
        markingType="custom"
        markedDates={markedDates}
        theme={{
          todayTextColor: "#2563eb",
          arrowColor: "#2563eb",
          monthTextColor: "#000",
          textMonthFontWeight: "bold",
        }}
      />

      <View style={{ marginTop: 20, padding: 10 }}>
        <LegendItem color="#16a34a" label="Present" />
        <LegendItem color="#dc2626" label="Absent" />
        <LegendItem color="#ca8a04" label="Sunday" />
        <LegendItem color="#2563eb" label="Today (Pending)" />
      </View>
    </View>
  );
}

const LegendItem = ({ color, label }) => (
  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
    <View
      style={{
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: color,
        marginRight: 10,
      }}
    />
    <Text style={{ color: "#333" }}>{label}</Text>
  </View>
);
