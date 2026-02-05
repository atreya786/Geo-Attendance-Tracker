import {
  View,
  Text,
  Pressable,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useDispatch, useSelector } from "react-redux";
import { api } from "../services/api";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { setTodayStatus } from "../redux/slices/attendanceSlice";
import { logout } from "../redux/slices/authSlice";
import * as Location from "expo-location";

export default function AttendanceScreen() {
  const user = useSelector((state) => state.auth.user);
  const isPresentToday = useSelector(
    (state) => state.attendance.isPresentToday,
  );
  const [fetchingLocation, setFetchingLocation] = useState(false);

  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
  const [coords, setCoords] = useState(null);

  const fetchCurrentLocation = async () => {
    try {
      setFetchingLocation(true);
      setLoading(true);

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Location Required",
          "Please turn on GPS and allow location access",
        );
        setCoords(null);
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setCoords({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (err) {
      Alert.alert("Error", "Unable to fetch location");
    } finally {
      setFetchingLocation(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentLocation();
  }, []);

  // Check today attendance
  useEffect(() => {
    api
      .get(`/attendance/today/${user.id}`)
      .then((res) => dispatch(setTodayStatus(res.data.isPresent)))
      .catch(() => {});
  }, []);

  // Get current location ONCE
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("Location permission denied");
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setCoords({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      setLoading(false);
    })();
  }, []);

  const markAttendance = async () => {
    if (!coords) {
      Alert.alert("Location not available", "Please fetch your location first");
      return;
    }

    try {
      const res = await api.post("/attendance/mark", {
        userId: user.id,
        latitude: coords.latitude,
        longitude: coords.longitude,
      });

      Alert.alert(res.data.message);
      dispatch(setTodayStatus(true));
    } catch (error) {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Attendance failed",
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapBox}>
        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" />
          </View>
        ) : coords ? (
          <MapView
            style={StyleSheet.absoluteFill}
            region={{
              latitude: coords.latitude,
              longitude: coords.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker coordinate={coords} title="Current location" />
          </MapView>
        ) : (
          <View style={styles.noLocation}>
            <Text style={{ color: "#555" }}>Location not available</Text>
          </View>
        )}
      </View>

      <View style={styles.controls}>
        <View style={styles.row}>
          <Pressable
            disabled={isPresentToday}
            onPress={markAttendance}
            style={[
              styles.gridButton,
              { backgroundColor: isPresentToday ? "gray" : "green" },
            ]}
          >
            <Text style={styles.buttonText}>
              {isPresentToday ? "Attendance Marked" : "Mark Attendance"}
            </Text>
          </Pressable>

          <Pressable
            onPress={fetchCurrentLocation}
            style={[styles.gridButton, { backgroundColor: "#3b82f6" }]}
          >
            <Text style={styles.buttonText}>Fetch Location</Text>
          </Pressable>
        </View>

        <View style={styles.row}>
          <Pressable
            onPress={() => navigation.navigate("HistoryScreen")}
            style={[styles.gridButton, { backgroundColor: "#f59e0b" }]}
          >
            <Text style={[styles.buttonText]}>
              View History
            </Text>
          </Pressable>

          <Pressable
            onPress={() => dispatch(logout())}
            style={[styles.gridButton, { backgroundColor: "#e93838" }]}
          >
            <Text style={styles.buttonText}>Logout</Text>
          </Pressable>

          {user?.role === "admin" && (
            <Pressable
              onPress={() => navigation.navigate("AddEmployeeScreen")}
              style={[styles.gridButton, { backgroundColor: "#10b981" }]}
            >
              <Text style={styles.buttonText}>Add New User</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  mapBox: {
    height: "70%",
    marginHorizontal: 12,
    marginTop: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#000000",
    overflow: "hidden",
  },
  loader: { flex: 1, alignItems: "center", justifyContent: "center" },
  controls: {
    height: "30%",
    paddingHorizontal: 12,
    justifyContent: "center",
    gap: 12,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },

  gridButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    color: "#000000",
    fontSize: 15,
    fontWeight: "600",
  },
});
