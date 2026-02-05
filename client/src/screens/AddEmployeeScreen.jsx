import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  Alert,
} from "react-native";
import { useState } from "react";
import { api } from "../services/api";
import { useNavigation } from "@react-navigation/native";
import { Dropdown } from "react-native-element-dropdown";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import this

export default function AddEmployeeScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState(null);

  const roleData = [
    { label: "Employee", value: "employee" },
    { label: "Worker", value: "worker" },
    { label: "Contractor", value: "contractor" },
    { label: "Intern", value: "intern" },
    { label: "Apprentice", value: "apprentice" },
  ];

  const [isFocus, setIsFocus] = useState(false);
  const navigation = useNavigation();

  const handleCreateUser = async () => {
    if (password !== verifyPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    if (!role) {
      Alert.alert("Error", "Please select a role");
      return;
    }

    try {
      const userStr = await AsyncStorage.getItem("user");
      const userData = userStr ? JSON.parse(userStr) : null;

      const token = userData?.token || userData?.user?.token;

      if (!token) {
        Alert.alert("Error", "No token found. Please re-login.");
        return;
      }

      await api.post(
        "/auth/register",
        {
          email,
          name,
          role,
          password,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      Alert.alert("Success", "New employee account created successfully!");
      setEmail("");
      setName("");
      setPassword("");
      setVerifyPassword("");
      setRole(null);
    } catch (error) {
      console.log(error);
      Alert.alert(
        "Failed",
        error?.response?.data?.message || "Something went wrong",
      );
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        padding: 20,
        backgroundColor: "#fff",
      }}
    >
      <Text
        style={{
          fontSize: 24,
          textAlign: "center",
          marginBottom: 20,
          fontWeight: "bold",
        }}
      >
        Add New Employee
      </Text>

      <Text style={styles.label}>Email</Text>
      <TextInput
        placeholder="e.g - xyz@gmail.com"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        style={styles.input}
      />

      <Text style={styles.label}>Name</Text>
      <TextInput
        placeholder="e.g - John Doe"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      <Text style={styles.label}>Role</Text>
      <Dropdown
        style={[styles.dropdown, isFocus && { borderColor: "blue" }]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        data={roleData}
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder={!isFocus ? "Select role" : "..."}
        value={role}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={(item) => {
          setRole(item.value);
          setIsFocus(false);
        }}
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        placeholder="e.g - User@123"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <Text style={styles.label}>Confirm Password</Text>
      <TextInput
        placeholder="e.g - User@123"
        value={verifyPassword}
        onChangeText={setVerifyPassword}
        secureTextEntry
        style={styles.input}
      />

      <Pressable
        onPress={handleCreateUser}
        style={{
          backgroundColor: "#16a34a",
          padding: 14,
          marginTop: 20,
          borderRadius: 6,
        }}
      >
        <Text
          style={{
            color: "#fff",
            textAlign: "center",
            fontSize: 16,
            fontWeight: "600",
          }}
        >
          Create Account
        </Text>
      </Pressable>

      {/* Removed the "Already have an account" link since user is already logged in */}
    </View>
  );
}

const styles = StyleSheet.create({
  dropdown: {
    height: 50,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 6,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "gray",
    padding: 12,
    marginBottom: 12,
    borderRadius: 6,
  },
  placeholderStyle: { fontSize: 16, color: "gray" },
  selectedTextStyle: { fontSize: 16 },
});
