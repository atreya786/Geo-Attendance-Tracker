import { View } from "react-native";
import { Calendar } from "react-native-calendars";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { api } from "../services/api";

export default function HistoryScreen() {
  const user = useSelector((state) => state.auth.user);
  const [markedDates, setMarkedDates] = useState({});

  useEffect(() => {
    api.get(`/attendance/history/${user.id}`).then((res) => {
      const presentDates = res.data.map((item) => ({
        date: item.attendance_date,
        isPresent: item.is_present,
      }));

      alert(JSON.stringify(presentDates));

      buildCalendarMarks(presentDates);
    });
  }, []);

  const buildCalendarMarks = (presentDates) => {
    const today = new Date();
    const marks = {};

    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(today.getDate() - i);

      const dateStr = date.toISOString().split("T")[0];
      const day = date.getDay(); // 0 = Sunday

      // 🟢 PRESENT (highest priority)
      if (presentDates.map((d) => d.date === dateStr && d.isPresent === 1)) {
        marks[dateStr] = hollowStyle("#16a34a");
        continue;
      }

      // 🔵 TODAY (if not present)
      if (dateStr === today.toISOString().split("T")[0]) {
        marks[dateStr] = hollowStyle("#2563eb");
        continue;
      }

      // 🟡 SUNDAY
      if (day === 0) {
        marks[dateStr] = hollowStyle("#facc15");
        continue;
      }

      // 🔴 ABSENT (past days)
      marks[dateStr] = hollowStyle("#dc2626");
    }

    setMarkedDates(marks);
  };

  // 🔵 Helper for hollow circle style
  const hollowStyle = (color) => ({
    customStyles: {
      container: {
        borderWidth: 2,
        borderColor: color,
        borderRadius: 20,
      },
      text: {
        color: color,
        fontWeight: "bold",
      },
    },
  });

  return (
    <View style={{ flex: 1 }}>
      <Calendar
        markingType="custom"
        markedDates={markedDates}
        theme={{
          todayTextColor: "#2563eb",
          arrowColor: "#2563eb",
        }}
      />
    </View>
  );
}
