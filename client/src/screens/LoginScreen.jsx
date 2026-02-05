import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  Alert,
} from "react-native";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../redux/slices/authSlice";
import { api } from "../services/api";
import { useState } from "react";
import { setUser } from "../redux/slices/userSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

export default function LoginScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      const { token, user } = res.data;

      await AsyncStorage.setItem("user", JSON.stringify(res.data));

      dispatch(loginSuccess(user));
      dispatch(setUser(user));

      Alert.alert("Success", "Logged in successfully!");
    } catch (error) {
      console.log(error);
      Alert.alert(
        "Login failed",
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
        Login
      </Text>

      <Text style={styles.label}>Email</Text>
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

      <Text style={styles.label}>Password</Text>
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

      <Pressable
        onPress={handleLogin}
        style={{
          backgroundColor: "#2563eb",
          padding: 14,
          marginTop: 20,
          borderRadius: 6,
        }}
      >
        <Text style={{ color: "#fff", textAlign: "center", fontSize: 16 }}>
          Login
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
