import { Text, View, TextInput, Pressable, Alert } from "react-native";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../redux/slices/authSlice";
import { api } from "../services/api";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";

export default function LoginScreen() {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();

  const handleLogin = async () => {
    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      dispatch(loginSuccess(res.data.user));
    } catch (error) {
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

      <Text>Email</Text>
      <TextInput
        placeholder="e.g - xyz@gmail.com"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        style={{
          borderWidth: 1,
          padding: 10,
          marginBottom: 12,
          borderRadius: 6,
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
          padding: 10,
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
      <Pressable onPress={() => navigation.navigate("Signup")}>
        <Text style={{ textAlign: "center", marginTop: 16 }}>
          Don&apos;t have an account? Click here to Sign up
        </Text>
      </Pressable>
    </View>
  );
}
