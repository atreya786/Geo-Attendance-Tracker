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
  const [number, setNumber] = useState("");
  const [password, setPassword] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState(null);

  const roleData = [
    { label: "Employee", value: "Employee" },
    { label: "Worker", value: "Worker" },
    { label: "Contractor", value: "Contractor" },
    { label: "Intern", value: "Intern" },
    { label: "Apprentice", value: "Apprentice" },
    { label: "Admin", value: "Admin" },
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
          number,
          name,
          department,
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
      setNumber("");
      setName("");
      setPassword("");
      setVerifyPassword("");
      setRole(null);
      setDepartment("");
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
      <Text style={styles.label}>Email</Text>
      <TextInput
        placeholder="e.g - xyz@gmail.com"
        placeholderTextColor="#444"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        style={styles.input}
      />

      <Text style={styles.label}>Phone Number</Text>
      <TextInput
        placeholder="e.g - 1234567890"
        placeholderTextColor="#444"
        value={number}
        onChangeText={setNumber}
        keyboardType="phone-pad"
        style={styles.input}
      />

      <Text style={styles.label}>Name</Text>
      <TextInput
        placeholder="e.g - John Doe"
        placeholderTextColor="#444"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      <Text style={styles.label}>Department</Text>
      <TextInput
        placeholder="e.g - Sales"
        placeholderTextColor="#444"
        value={department}
        onChangeText={setDepartment}
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
        placeholderTextColor="#444"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <Text style={styles.label}>Confirm Password</Text>
      <TextInput
        placeholder="e.g - User@123"
        placeholderTextColor="#444"
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
  placeholderStyle: { fontSize: 16, color: "#555" },
  selectedTextStyle: { fontSize: 16 },
});
