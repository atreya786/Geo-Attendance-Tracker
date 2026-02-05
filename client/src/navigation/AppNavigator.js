import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AttendanceScreen from "../screens/AttendanceScreen";
import HistoryScreen from "../screens/HistoryScreen";
import { useSelector } from "react-redux";
import AddEmployeeScreen from "../screens/AddEmployeeScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const user = useSelector((state) => state.auth.user);
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Attendance"
        component={AttendanceScreen}
        options={{ title: `Welcome, ${user?.name || "User"}` }}
      />
      <Stack.Screen
        name="HistoryScreen"
        component={HistoryScreen}
        options={{ title: "Attendance History" }}
      />
      <Stack.Screen
        name="AddEmployeeScreen"
        component={AddEmployeeScreen}
        options={{ title: "Add New Employee" }}
      />
    </Stack.Navigator>
  );
}
