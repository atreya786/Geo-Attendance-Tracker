import {
  View,
  Text,
  Pressable,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import OSMMap from "../components/OSMMap";
import { useDispatch, useSelector } from "react-redux";
import { api } from "../services/api";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { setTodayStatus } from "../redux/slices/attendanceSlice";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";

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

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Go to Settings > Apps > GeoTracker > Permissions and allow Location access.",
        );
        setCoords(null);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 15000,
        maximumAge: 10000,
      });

      setCoords({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (err) {
      console.log(err);
      Alert.alert("GPS Error", "Could not fetch location. Ensure GPS is On.");
    } finally {
      setFetchingLocation(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentLocation();

    api
      .get(`/attendance/today/${user.id}`)
      .then((res) => dispatch(setTodayStatus(res.data.isPresent)))
      .catch(() => {});
  }, []);

  const markAttendance = async () => {
    if (!coords) {
      Alert.alert("Location missing", "Please fetch your location first.");
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission denied", "We need camera access.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (result.canceled) return;

    const selfieUri = result.assets[0].uri;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("userId", user.id);
      formData.append("latitude", coords.latitude.toString());
      formData.append("longitude", coords.longitude.toString());
      formData.append("selfie", {
        uri: selfieUri,
        name: "selfie.jpg",
        type: "image/jpeg",
      });

      const res = await api.post("/attendance/mark", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Alert.alert("Success", res.data.message);
      dispatch(setTodayStatus(true));
    } catch (error) {
      console.error(error);
      Alert.alert(
        "Verification Failed",
        error?.response?.data?.message || "Check your internet and try again",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapBox}>
        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={{ marginTop: 10 }}>Locating...</Text>
          </View>
        ) : coords ? (
          <OSMMap latitude={coords.latitude} longitude={coords.longitude} />
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
            <Text style={styles.buttonText}>
              {fetchingLocation ? "Fetching..." : "Refresh Location"}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  mapBox: {
    height: "70%",
    margin: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    overflow: "hidden",
    backgroundColor: "#f9f9f9",
  },
  loader: { flex: 1, alignItems: "center", justifyContent: "center" },
  noLocation: { flex: 1, alignItems: "center", justifyContent: "center" },
  controls: {
    height: "30%",
    paddingHorizontal: 12,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  gridButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "bold",
  },
});
