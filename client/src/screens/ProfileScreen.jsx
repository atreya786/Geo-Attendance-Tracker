import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/slices/authSlice";

const ProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  //   console.log("ProfileScreen - User Data:", user);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(false);
    } else {
      const timer = setTimeout(() => setLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => dispatch(logout()),
      },
    ]);
    // console.log("Logout triggered");
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: user?.profileImage }} style={styles.avatar} />
            <View style={styles.statusBadge} />
          </View>
          <Text style={styles.name}>{user?.name || "User Name"}</Text>
          <Text style={styles.role}>
            {user?.role || "N/A"} • {user?.id || "ID-000"}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Details</Text>

          <InfoRow label="Email" value={user?.email || "N/A"} />
          <InfoRow label="Phone" value={user?.number || "N/A"} />
          <InfoRow label="Department" value={user?.department || "General"} />
          <InfoRow label="Role" value={user?.role || "Unknown"} />
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.actionButton} onPress={handleLogout}>
            <Text style={[styles.actionText, { color: "#EF4444" }]}>
              Logout
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.versionText}>v1.0.2 (Build 2026)</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <View style={styles.infoTextContainer}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    paddingVertical: 24,
    backgroundColor: "#fff",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#E0E0E0",
  },
  statusBadge: {
    position: "absolute",
    bottom: 0,
    right: 4,
    width: 20,
    height: 20,
    backgroundColor: "#10B981",
    borderRadius: 10,
    borderWidth: 3,
    borderColor: "#fff",
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  role: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    paddingVertical: 16,
    justifyContent: "space-around",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  statBox: {
    alignItems: "center",
    flex: 1,
  },
  statBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "#E5E7EB",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    textTransform: "uppercase",
    fontWeight: "600",
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
    marginLeft: 4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    color: "#374151",
    fontWeight: "500",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  actionText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
  },
  arrow: {
    fontSize: 18,
    color: "#ccc",
    fontWeight: "bold",
  },
  versionText: {
    textAlign: "center",
    color: "#9CA3AF",
    fontSize: 12,
    marginVertical: 24,
  },
});

export default ProfileScreen;
