import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  Alert,
  Image,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useState } from "react";
import { api } from "../services/api";
import { Dropdown } from "react-native-element-dropdown";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";

export default function AddEmployeeScreen() {
  const [email, setEmail] = useState("");
  const [number, setNumber] = useState("");
  const [password, setPassword] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState(null);

  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const CLOUD_NAME = "dtq5ul7zb";
  const UPLOAD_PRESET = "geo_tracker_unsigned";

  const roleData = [
    { label: "Employee", value: "Employee" },
    { label: "Worker", value: "Worker" },
    { label: "Contractor", value: "Contractor" },
    { label: "Intern", value: "Intern" },
    { label: "Apprentice", value: "Apprentice" },
    { label: "Admin", value: "Admin" },
  ];

  const [isFocus, setIsFocus] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Camera roll permissions are needed.");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      if (asset.fileSize && asset.fileSize > 102400) {
        Alert.alert(
          "File too large",
          "Please upload an image smaller than 100KB.",
        );
        return;
      }
      setImage(asset.uri);
    }
  };

  // 2. Upload to Cloudinary
  const uploadToCloudinary = async (uri) => {
    if (!uri) return null;

    const formData = new FormData();
    formData.append("file", {
      uri,
      type: "image/jpeg",
      name: "profile.jpg",
    });
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("cloud_name", CLOUD_NAME);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        },
      );
      const data = await res.json();
      return data.secure_url;
    } catch (err) {
      console.log("Cloudinary Upload Error:", err);
      Alert.alert("Error", "Failed to upload image.");
      return null;
    }
  };

  const handleCreateUser = async () => {
    if (password !== verifyPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    if (!role) {
      Alert.alert("Error", "Please select a role");
      return;
    }

    setUploading(true);

    try {
      const userStr = await AsyncStorage.getItem("user");
      const userData = userStr ? JSON.parse(userStr) : null;
      const token = userData?.token || userData?.user?.token;

      if (!token) {
        Alert.alert("Error", "No token found. Please re-login.");
        setUploading(false);
        return;
      }

      let profileImageUrl = "";
      if (image) {
        profileImageUrl = await uploadToCloudinary(image);
        if (!profileImageUrl) {
          setUploading(false);
          return;
        }
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
          profileImage: profileImageUrl,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
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
      setImage(null);
    } catch (error) {
      console.log(error);
      Alert.alert(
        "Failed",
        error?.response?.data?.message || "Something went wrong",
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Image Picker */}
      <View style={{ alignItems: "center", marginBottom: 20 }}>
        <Text style={{ fontSize: 16, fontWeight: "500", marginBottom: 10 }}>
          Upload Profile Image
        </Text>
        <Pressable onPress={pickImage} style={styles.imagePicker}>
          {image ? (
            <Image source={{ uri: image }} style={styles.profileImage} />
          ) : (
            <View style={{ alignItems: "center" }}>
              <Text style={{ color: "#666" }}>+ Photo</Text>
              <Text style={{ fontSize: 10, color: "#aaa" }}>(Max 100KB)</Text>
            </View>
          )}
        </Pressable>
      </View>

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
        disabled={uploading}
        style={{
          backgroundColor: uploading ? "#9ca3af" : "#16a34a",
          padding: 14,
          marginTop: 20,
          borderRadius: 6,
        }}
      >
        {uploading ? (
          <ActivityIndicator color="#fff" />
        ) : (
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
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
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
  imagePicker: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
});
