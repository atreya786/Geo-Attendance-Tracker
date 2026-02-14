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
    // Fetch status of attendance
    api
      .get(`/attendance/today/${user.id}`)
      .then((res) => dispatch(setTodayStatus(res.data.isPresent)))
      .catch(() => {});

    // Fetch initial location
    fetchCurrentLocation();
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
      Alert.alert("Location missing", "Please fetch your location first.");
      return;
    }

    // 1. Request Camera Permissions
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission denied",
        "We need camera access to verify your identity.",
      );
      return;
    }

    // 2. Launch Camera to take a Selfie
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1], // Square aspect is better for face recognition
      quality: 0.5, // Reduce quality to speed up upload
    });

    if (result.canceled) return;

    const selfieUri = result.assets[0].uri;

    try {
      setLoading(true);

      // 3. Prepare Multipart Form Data
      const formData = new FormData();
      formData.append("userId", user.id);
      formData.append("latitude", coords.latitude.toString());
      formData.append("longitude", coords.longitude.toString());

      // Append the Image
      formData.append("selfie", {
        uri: selfieUri,
        name: "selfie.jpg",
        type: "image/jpeg",
      });

      // 4. Call API (Must set headers for multipart)
      const res = await api.post("/attendance/mark", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
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
