import { View, Text, Pressable, Alert } from "react-native";
import * as Location from "expo-location";
import { useDispatch, useSelector } from "react-redux";
import { api } from "../services/api";
import { useNavigation } from "@react-navigation/native";
import { logout } from "../redux/slices/authSlice";
import { useEffect, useState } from "react";

export default function AttendanceScreen() {
  const user = useSelector((state) => state.auth.user);
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [isPresentToday, setIsPresentToday] = useState(false);

  useEffect(() => {
    api.get(`/attendance/today/${user.id}`).then((res) => {
      setIsPresentToday(res.data.isPresent);
    });
  }, []);

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
      setIsPresentToday(true);
    } catch (error) {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Attendance failed",
      );
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Pressable
        disabled={isPresentToday}
        onPress={markAttendance}
        style={{
          backgroundColor: isPresentToday ? "gray" : "green",
          padding: 16,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: "#fff", fontSize: 16 }}>
          {isPresentToday ? "Attendance Marked" : "Mark Attendance"}
        </Text>
      </Pressable>

      <Pressable
        onPress={() => navigation.navigate("HistoryScreen")}
        style={{
          marginTop: 20,
          backgroundColor: "lightblue",
          padding: 16,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: "#000", fontSize: 16 }}>View History</Text>
      </Pressable>

      <Pressable
        onPress={() => dispatch(logout())}
        style={{
          marginTop: 20,
          backgroundColor: "#e93838",
          padding: 16,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: "#000", fontSize: 16 }}>Logout</Text>
      </Pressable>
    </View>
  );
}
