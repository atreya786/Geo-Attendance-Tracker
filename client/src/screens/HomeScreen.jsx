import { useNavigation } from "@react-navigation/native";
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

const HomeScreen = () => {
  const todayDate = new Date().toDateString();
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigation();

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.greetingContainer}>
          <Text style={styles.greeting}>Good Morning,</Text>
          <Text style={styles.username}>{user?.name || "User"} 👋</Text>
        </View>

        {/* Main Action Card */}
        <View style={styles.actionCard}>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Ready to work?</Text>
            <Text style={styles.cardSubtitle}>{todayDate}</Text>
            <TouchableOpacity
              style={styles.checkInButton}
              onPress={() => navigate.navigate("Attendance")}
            >
              <Text style={styles.btnText}>Check In Now</Text>
            </TouchableOpacity>
          </View>
          {/* Decorative Circle */}
          <View style={styles.decorativeCircle} />
        </View>

        {/* Quick Stats Grid */}
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.grid}>
          <View style={[styles.gridItem, { backgroundColor: "#E0F2FE" }]}>
            <Text style={[styles.gridLabel, { color: "#0284C7" }]}>
              Attendance
            </Text>
            <Text style={styles.gridValue}>92%</Text>
          </View>
          <View style={[styles.gridItem, { backgroundColor: "#F0FDF4" }]}>
            <Text style={[styles.gridLabel, { color: "#16A34A" }]}>
              On Time
            </Text>
            <Text style={styles.gridValue}>22 Days</Text>
          </View>
        </View>

        {/* Recent Activity List */}
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityList}>
          <ActivityItem
            status="Check In"
            time="09:02 AM"
            date="Today"
            color="#10B981"
          />
          <ActivityItem
            status="Check Out"
            time="06:15 PM"
            date="Yesterday"
            color="#EF4444"
          />
          <ActivityItem
            status="Check In"
            time="08:58 AM"
            date="Yesterday"
            color="#10B981"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const ActivityItem = ({ status, time, date, color }) => (
  <View style={styles.activityItem}>
    <View style={[styles.indicator, { backgroundColor: color }]} />
    <View style={styles.activityInfo}>
      <Text style={styles.activityStatus}>{status}</Text>
      <Text style={styles.activityDate}>{date}</Text>
    </View>
    <Text style={styles.activityTime}>{time}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 20,
  },
  greetingContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  greeting: { fontSize: 16, color: "#6B7280" },
  username: { fontSize: 26, fontWeight: "bold", color: "#1F2937" },

  actionCard: {
    backgroundColor: "#4F46E5",
    borderRadius: 24,
    padding: 24,
    marginBottom: 30,
    position: "relative",
    overflow: "hidden",
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  cardSubtitle: { fontSize: 14, color: "#E0E7FF", marginBottom: 20 },
  checkInButton: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  btnText: { color: "#4F46E5", fontWeight: "bold", fontSize: 16 },
  decorativeCircle: {
    position: "absolute",
    top: -20,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    marginBottom: 15,
  },
  grid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  gridItem: {
    width: "48%",
    padding: 20,
    borderRadius: 16,
    justifyContent: "center",
  },
  gridLabel: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  gridValue: { fontSize: 24, fontWeight: "bold", color: "#1F2937" },
  activityList: { backgroundColor: "#fff", borderRadius: 16, padding: 10 },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  indicator: { width: 10, height: 10, borderRadius: 5, marginRight: 15 },
  activityInfo: { flex: 1 },
  activityStatus: { fontSize: 16, fontWeight: "600", color: "#374151" },
  activityDate: { fontSize: 12, color: "#9CA3AF" },
  activityTime: { fontSize: 14, fontWeight: "600", color: "#6B7280" },
});

export default HomeScreen;
