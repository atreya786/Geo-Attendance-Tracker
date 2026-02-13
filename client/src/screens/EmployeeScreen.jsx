import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState } from "react";
import { api } from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function EmployeeScreen() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const userStr = await AsyncStorage.getItem("user");
        const userData = userStr ? JSON.parse(userStr) : null;
        const token = userData?.token || userData?.user?.token;

        if (!token) {
          Alert.alert("Error", "No token found. Please re-login.");
          return;
        }
        const response = await api.get("/users/employees", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setEmployees(response.data);
      } catch (error) {
        console.log("Error fetching employees:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);
  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <View style={[styles.cell, { flex: 1, alignItems: "center" }]}>
        {item.profileImage ? (
          <Image source={{ uri: item.profileImage }} style={styles.avatar} />
        ) : (
          <View style={styles.placeholderAvatar}>
            <Text style={styles.placeholderText}>
              {item.name?.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
      </View>

      <View style={[styles.cell, { flex: 2 }]}>
        <Text style={styles.nameText}>{item.name}</Text>
        <Text style={styles.roleText}>{item.role}</Text>
      </View>

      <View style={[styles.cell, { flex: 1.5 }]}>
        <Text style={styles.cellText}>{item.department}</Text>
      </View>

      <View style={[styles.cell, { flex: 2 }]}>
        <Text style={styles.smallText}>{item.email}</Text>
        <Text style={styles.smallText}>{item.number}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Table Header */}
      <View style={styles.headerRow}>
        <Text style={[styles.headerText, { flex: 0.8, textAlign: "center" }]}>
          Img
        </Text>
        <Text style={[styles.headerText, { flex: 2 }]}>Name & Role</Text>
        <Text style={[styles.headerText, { flex: 1.5 }]}>Dept</Text>
        <Text style={[styles.headerText, { flex: 2 }]}>Contact</Text>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#0000ff"
          style={{ marginTop: 20 }}
        />
      ) : (
        <FlatList
          data={employees}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", marginTop: 20, color: "#666" }}>
              No employees found.
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#333",
  },
  headerRow: {
    flexDirection: "row",
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 5,
    borderRadius: 8,
    marginBottom: 5,
  },
  headerText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  row: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "center",
  },
  cell: {
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  nameText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  roleText: {
    fontSize: 12,
    color: "#007bff",
    fontWeight: "500",
  },
  cellText: {
    fontSize: 13,
    color: "#444",
  },
  smallText: {
    fontSize: 11,
    color: "#666",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e1e4e8",
  },
  placeholderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#6c757d",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
