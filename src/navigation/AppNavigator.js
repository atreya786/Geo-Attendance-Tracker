import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AttendanceScreen from "../screens/AttendanceScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Attendance"
        component={AttendanceScreen}
        options={{ title: "Geo Attendance" }}
      />
    </Stack.Navigator>
  );
}
