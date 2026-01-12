import { Text, TextInput, View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import WorkoutList from "../../components/WorkoutList";
import { workoutStyles as styles } from "../../styles/workoutStyles";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLoadWorkouts } from "@/app/hooks/useLoadWorkouts";
import LoadingOverlay from "../../components/LoadingOverlay";

export default function WorkoutScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState("");
  const { workouts, loading } = useLoadWorkouts();

  return (
    <View style={styles.container}>
      {/* EmptyWorkout Button */}
      <View style={{ marginHorizontal: 20 }}>
        <Pressable
          onPress={() => {
            router.push("/screens/workout/ActiveWorkoutScreen");
          }}
          style={({ pressed }) => [
            styles.bigButton,
            { backgroundColor: pressed ? "#333" : "#000" },
          ]}
        >
          <View style={styles.bigButtonTextWrapper}>
            <Text style={styles.buttonText}>Leeres Training starten</Text>
            <Ionicons name={"add-outline"} size={24} color="#fff" />
          </View>
        </Pressable>
      </View>

      {/* Search Bar */}
      <TextInput
        placeholder={"Training suchen..."}
        placeholderTextColor="white"
        value={filter}
        onChangeText={setFilter}
        style={styles.search}
      />

      {/* Saved Workouts List */}
      <WorkoutList
        workouts={workouts}
        filter={filter}
        onItemPress={(workout) =>
          router.push({
            pathname: "/screens/workout/SingleWorkoutInfoScreen",
            params: { id: workout.id },
          })
        }
      />

      {/* create Workout Button */}
      <View style={{ marginHorizontal: 20, marginBottom: 20 }}>
        <Pressable
          onPress={() => {
            router.push("/screens/workout/EditWorkoutScreen");
          }}
          style={({ pressed }) => [
            styles.bigButton,
            { backgroundColor: pressed ? "#333" : "#000" },
          ]}
        >
          <View style={styles.bigButtonTextWrapper}>
            <Text style={styles.buttonText}>Training erstellen</Text>
            <Ionicons name={"add-outline"} size={24} color="#fff" />
          </View>
        </Pressable>
      </View>

      <LoadingOverlay visible={loading} />
    </View>
  );
}
