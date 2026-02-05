import {
  View,
  Text,
  ActivityIndicator,
  TextInput,
  Pressable,
  Alert,
  StyleSheet,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { useFocusEffect } from "@react-navigation/native";
import { api } from "../services/api";

export default function HistoryScreen() {
  const user = useSelector((state) => state.auth.user);
  const isPresentToday = useSelector(
    (state) => state.attendance.isPresentToday,
  );

  const [searchEmail, setSearchEmail] = useState("");
  const [searchMonth, setSearchMonth] = useState(new Date().getMonth() + 1);
  const [searchYear, setSearchYear] = useState(new Date().getFullYear());

  const [markedDates, setMarkedDates] = useState({});
  const [loading, setLoading] = useState(false);
  const [displayTitle, setDisplayTitle] = useState("My Attendance");

  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        fetchHistory(user.id, searchMonth, searchYear);
      }
    }, [user?.id, searchMonth, searchYear, isPresentToday]),
  );

  const handleAdminSearch = async () => {
    if (!searchEmail) {
      Alert.alert("Error", "Please enter an email to search");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/attendance/users/search", {
        email: searchEmail,
      });

      const { doc, user: foundUser } = res.data;

      if (!foundUser || !foundUser._id) {
        Alert.alert("Not Found", "User not found");
        setLoading(false);
        return;
      }

      setDisplayTitle(`${foundUser.name}'s History`);

      const attendanceData = doc || {};
      processAttendanceData(attendanceData, searchMonth, searchYear);
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Could not fetch history");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (userId, month, year) => {
    setLoading(true);
    try {
      const res = await api.get(`/attendance/history/${userId}`);
      processAttendanceData(res.data, month, year);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const processAttendanceData = (data, targetMonth, targetYear) => {
    const presentSet = new Set();

    const yearsData = data.years || data || {};

    const yearRecords = yearsData[String(targetYear)];

    if (yearRecords) {
      const monthKeySimple = String(targetMonth);
      const monthKeyPadded = String(targetMonth).padStart(2, "0");
      const monthRecords =
        yearRecords[monthKeySimple] || yearRecords[monthKeyPadded] || [];

      monthRecords.forEach((record) => {
        if (record.status === "Present") {
          const dayStr = String(record.day).padStart(2, "0");
          const monthStr = String(targetMonth).padStart(2, "0");
          const isoDate = `${targetYear}-${monthStr}-${dayStr}`;
          presentSet.add(isoDate);
        }
      });
    }

    buildCalendarMarks(presentSet, targetMonth, targetYear);
  };

  const buildCalendarMarks = (presentSet, month, year) => {
    const marks = {};
    const daysInMonth = new Date(year, month, 0).getDate();
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const todayDateObj = new Date();
    todayDateObj.setHours(0, 0, 0, 0);

    for (let d = 1; d <= daysInMonth; d++) {
      const dayStr = String(d).padStart(2, "0");
      const monthStr = String(month).padStart(2, "0");
      const dateStr = `${year}-${monthStr}-${dayStr}`;

      const currentDate = new Date(year, month - 1, d);
      const dayOfWeek = currentDate.getDay();

      if (dateStr === todayStr) {
        if (isPresentToday || presentSet.has(dateStr)) {
          marks[dateStr] = getStyle("#16a34a", "Present");
        } else {
          marks[dateStr] = getStyle("#2563eb", "Today");
        }
        continue;
      }

      if (presentSet.has(dateStr)) {
        marks[dateStr] = getStyle("#16a34a", "Present");
        continue;
      }

      if (dayOfWeek === 0) {
        marks[dateStr] = getStyle("#e1a218", "Sunday");
        continue;
      }

      if (currentDate < todayDateObj) {
        marks[dateStr] = getStyle("#dc2626", "Absent");
      }
    }
    setMarkedDates(marks);
  };

  const getStyle = (color, label) => ({
    customStyles: {
      container: {
        borderWidth: 2,
        borderColor: color,
        borderRadius: 20,
        backgroundColor: "transparent",
      },
      text: { color: color, fontWeight: "bold" },
    },
  });

  return (
    <View style={styles.container}>
      {user?.role === "admin" && (
        <View style={styles.searchContainer}>
          <Text style={styles.header}>Search Employee</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter User Email"
            value={searchEmail}
            onChangeText={setSearchEmail}
            autoCapitalize="none"
          />
          <View style={styles.row}>
            <TextInput
              style={[styles.input, { flex: 1, marginRight: 5 }]}
              placeholder="Month (1-12)"
              keyboardType="numeric"
              value={String(searchMonth)}
              onChangeText={(t) => setSearchMonth(Number(t))}
            />
            <TextInput
              style={[styles.input, { flex: 1, marginLeft: 5 }]}
              placeholder="Year (YYYY)"
              keyboardType="numeric"
              value={String(searchYear)}
              onChangeText={(t) => setSearchYear(Number(t))}
            />
          </View>
          <Pressable style={styles.searchButton} onPress={handleAdminSearch}>
            <Text style={{ color: "#fff", fontWeight: "bold" }}>
              Fetch History
            </Text>
          </Pressable>
        </View>
      )}

      <Text style={styles.title}>{displayTitle}</Text>
      <Text style={styles.subtitle}>
        Viewing: {searchMonth}/{searchYear}
      </Text>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#2563eb"
          style={{ marginTop: 20 }}
        />
      ) : (
        <View style={{ flex: 1 }}>
          <Calendar
            current={`${searchYear}-${String(searchMonth).padStart(2, "0")}-01`}
            key={`${searchYear}-${searchMonth}`}
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
            <LegendItem color="#2563eb" label="Today" />
          </View>
        </View>
      )}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 15 },
  searchContainer: {
    backgroundColor: "#f3f4f6",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  header: { fontWeight: "bold", marginBottom: 10 },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  searchButton: {
    backgroundColor: "#2563eb",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: "gray",
    textAlign: "center",
    marginBottom: 10,
  },
});
