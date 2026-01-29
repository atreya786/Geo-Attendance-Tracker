import { View, Text, FlatList } from "react-native";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { api } from "../services/api";

export default function HistoryScreen() {
  const user = useSelector((state) => state.auth.user);
  const [data, setData] = useState([]);

  useEffect(() => {
    api.get(`/attendance/history/${user.id}`).then((res) => setData(res.data));
  }, []);

  return (
    <FlatList
      data={data}
      keyExtractor={(item, index) => index.toString()}
      renderItem={({ item }) => (
        <Text style={{ padding: 12 }}>{item.date} - Present</Text>
      )}
    />
  );
}
