import { FlatList, View, Text, StyleSheet } from "react-native";
import { useMemo } from "react";
import ExerciseItem from "./ExerciseItem";

interface Props {
  wExercises: WorkoutExercise[];
  filter?: string;
  onItemPress?: (wExercises: WorkoutExercise) => void;
}

type WorkoutExercise = {
  id: string;
  breakTime: number;
  sets: Set[];
};

type Set = {
  reps: number;
  weight: number;
  isDone: boolean;
};

type ListItem = { type: "wExercise"; data: WorkoutExercise };

export default function WExerciseList({
  wExercises,
  filter = "",
  onItemPress,
}: Props) {
  const listData: ListItem[] = useMemo(() => {
    const filtered = wExercises.filter((we) =>
      we.id.toLowerCase().includes(filter.toLowerCase()),
    );
    const data: ListItem[] = [];

    filtered.forEach((we) => data.push({ type: "wExercise", data: we }));

    return data;
  }, [wExercises, filter]);

  console.log(wExercises);

  return (
    <FlatList
      data={listData}
      keyExtractor={(item) => (item.type === "wExercise" ? item.data.id : "")}
      renderItem={({ item }) => {
        if (item.type === "wExercise") {
          return (
            <ExerciseItem
              data={item.data}
              type="workoutExercise"
              onPress={() => onItemPress && onItemPress(item.data)}
            />
          );
        }
        return null;
      }}
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={() => (
        <View style={styles.container}>
          <Text style={{ color: "#888", fontSize: 16, textAlign: "center" }}>
            Keine Übungen gefunden.
          </Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    marginTop: 20,
  },
  divider: {
    marginVertical: 12,
  },
  dividerText: {
    fontWeight: "600",
    color: "#666",
  },
  line: {
    flex: 1,
    borderBottomColor: "gray",
    borderBottomWidth: 2,
    height: 1,
    backgroundColor: "#ccc",
    marginTop: 4,
  },
  listContent: {
    marginHorizontal: 16,
  },
});
