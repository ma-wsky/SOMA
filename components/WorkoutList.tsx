import { useMemo } from "react";
import { FlatList, View, Text } from "react-native";
import WorkoutItem from "@/components/WorkoutItem";
import { Workout, ListItem } from "@/types/workoutTypes";
import { Colors } from "@/styles/theme";

interface Props {
  workouts: Workout[];
  filter?: string;
  onItemPress?: (workout: Workout) => void;
  onDelete?: (workoutId: string) => void;
}


export default function WorkoutList({workouts, filter = "", onItemPress, onDelete}: Props) {
  const listData: ListItem[] = useMemo(() => {
    const filtered = workouts.filter((w) =>
      (w.name || "").toLowerCase().includes(filter.toLowerCase()),
    );
    const data: ListItem[] = [];

    filtered.forEach((w) => data.push({ type: "workout", data: w }));

    return data;
  }, [workouts, filter]);


  return (
    <FlatList
      data={listData}
      keyExtractor={(item) => (item.type === "workout" ? item.data.id as string: "")}
      renderItem={({ item }) => {
        if (item.type === "workout") {
          return (
            <WorkoutItem
              workout={item.data}
              onPress={() => onItemPress && onItemPress(item.data)}
              onDelete={onDelete}
            />
          );
        }
        return null;
      }}
      ListEmptyComponent={() => (
        <View style={{ marginTop: 20 }}>
          <Text style={{ textAlign: "center", color: Colors.darkGray }}>
            Keine Trainings gefunden.
          </Text>
        </View>
      )}
    />
  );
}
