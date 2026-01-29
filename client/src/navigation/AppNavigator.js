import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AttendanceScreen from "../screens/AttendanceScreen";
import HistoryScreen from "../screens/HistoryScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Attendance"
        component={AttendanceScreen}
        options={{ title: "Geo Attendance" }}
      />
      <Stack.Screen
        name="HistoryScreen"
        component={HistoryScreen}
        options={{ title: "Attendance History" }}
      />
    </Stack.Navigator>
  );
}
