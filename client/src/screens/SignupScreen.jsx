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

export default function SignupScreen() {
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

  const handleSignup = async () => {
    if (password !== verifyPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      await api.post("/auth/register", {
        email,
        name,
        role,
        password,
      });

      Alert.alert("Success", "Account created successfully. Please login.");
      navigation.navigate("Login");
    } catch (error) {
      Alert.alert(
        "Signup failed",
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
      }}
    >
      <Text style={{ fontSize: 24, textAlign: "center", marginBottom: 20 }}>
        Sign Up
      </Text>

      <Text>Email</Text>
      <TextInput
        placeholder="e.g - xyz@gmail.com"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        style={{
          borderWidth: 1,
          padding: 12,
          marginBottom: 6,
          borderRadius: 6,
        }}
      />

      <Text style={styles.label}>Name</Text>
      <TextInput
        placeholder="e.g - John Doe"
        value={name}
        onChangeText={setName}
        style={{
          borderWidth: 1,
          padding: 12,
          marginBottom: 6,
          borderRadius: 6,
        }}
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

      <Text>Password</Text>
      <TextInput
        placeholder="e.g - User@123"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{
          borderWidth: 1,
          padding: 12,
          marginBottom: 6,
          borderRadius: 6,
        }}
      />

      <Text>Confirm Password</Text>
      <TextInput
        placeholder="e.g - User@123"
        value={verifyPassword}
        onChangeText={setVerifyPassword}
        secureTextEntry
        style={{
          borderWidth: 1,
          padding: 12,
          marginBottom: 6,
          borderRadius: 6,
        }}
      />

      <Pressable
        onPress={handleSignup}
        style={{
          backgroundColor: "#16a34a",
          padding: 14,
          marginTop: 20,
          borderRadius: 6,
        }}
      >
        <Text style={{ color: "#fff", textAlign: "center", fontSize: 16 }}>
          Create Account
        </Text>
      </Pressable>
      <Pressable onPress={() => navigation.navigate("Login")}>
        <Text style={{ textAlign: "center", marginTop: 16 }}>
          Already have an account? Click here to Login
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  dropdown: {
    height: 50,
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 6,
    paddingHorizontal: 8,
  },
  label: { paddingTop: 5, fontSize: 16 },
  placeholderStyle: { fontSize: 16, color: "gray" },
  selectedTextStyle: { fontSize: 16 },
});
