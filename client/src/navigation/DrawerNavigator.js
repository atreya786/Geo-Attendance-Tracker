import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { MaterialIcons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";

import HomeScreen from "../screens/HomeScreen";
import AttendanceScreen from "../screens/AttendanceScreen";
import HistoryScreen from "../screens/HistoryScreen";
import ProfileScreen from "../screens/ProfileScreen";
import AddEmployeeScreen from "../screens/AddEmployeeScreen";
import { useSelector } from "react-redux";

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  const user = useSelector((state) => state.auth.user);

  return (
    <Drawer.Navigator
      screenOptions={({ navigation }) => ({
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.toggleDrawer()}
            style={{ marginLeft: 16 }}
          >
            <MaterialIcons name="menu" size={28} color="#333" />
          </TouchableOpacity>
        ),
        headerStyle: {
          backgroundColor: "#fff",
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: { fontWeight: "bold", color: "#333" },
        drawerActiveBackgroundColor: "#4F46E5",
        drawerActiveTintColor: "#fff",
        drawerInactiveTintColor: "#333",
      })}
    >
      <Drawer.Screen
        name="Home"
        component={HomeScreen}
        options={{
          drawerIcon: ({ color }) => (
            <MaterialIcons name="home" size={40} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Attendance"
        component={AttendanceScreen}
        options={{
          drawerIcon: ({ color }) => (
            <MaterialIcons name="location-on" size={40} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="History"
        component={HistoryScreen}
        options={{
          drawerIcon: ({ color }) => (
            <MaterialIcons name="history" size={40} color={color} />
          ),
        }}
      />
      {user?.role === "admin" && (
        <Drawer.Screen
          name="Add Employee"
          component={AddEmployeeScreen}
          options={{
            drawerIcon: ({ color }) => (
              <MaterialIcons name="person-add" size={40} color={color} />
            ),
          }}
        />
      )}
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          drawerIcon: ({ color }) => (
            <MaterialIcons name="person" size={40} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
