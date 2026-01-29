import { View, Text, Pressable, Alert } from "react-native";
import * as Location from "expo-location";
import { useSelector } from "react-redux";
import { api } from "../services/api";

export default function AttendanceScreen() {
  const user = useSelector((state) => state.auth.user);

  const markAttendance = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission denied");
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;

    try {
      const res = await api.post("/attendance/mark", {
        userId: user.id,
        latitude,
        longitude,
      });

      Alert.alert(res.data.message);
    } catch (error) {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Attendance failed",
      );
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>Mark Attendance</Text>

      <Pressable
        onPress={markAttendance}
        style={{
          backgroundColor: "green",
          padding: 16,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: "#fff", fontSize: 16 }}>Mark Attendance</Text>
      </Pressable>
    </View>
  );
}
