import { Text, TextInput, View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import WorkoutList from "../../components/WorkoutList";
import { workoutStyles as styles } from "../../styles/workoutStyles";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLoadWorkouts } from "@/app/hooks/useLoadWorkouts";
import LoadingOverlay from "../../components/LoadingOverlay";

export default function WorkoutScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState("");
  const [hasActiveWorkout, setHasActiveWorkout] = useState(false);
  const { workouts, loading } = useLoadWorkouts();

  // When this tab is focused, open the ActiveWorkoutScreen if there is an active workout stored
  useFocusEffect(
    useCallback(() => {
      try {
        const active = require("@/app/utils/activeWorkoutStore").getActiveWorkout();
        if (active?.id) {
          router.push({ pathname: '/screens/workout/ActiveWorkoutScreen', params: { id: active.id } });
        }
      } catch (e) {
        console.warn('Error checking active workout on focus', e);
      }
    }, [])
  );

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
            <Text style={styles.itemTitle}>Leeres Training starten</Text>
            <Ionicons name={"add-outline"} size={styles.itemTitle.fontSize} color={styles.itemTitle.color} />
          </View>
        </Pressable>
      </View>

      {/* Search Bar */}
      <TextInput
        placeholder={"Training suchen..."}
        placeholderTextColor="white"
        value={filter}
        onChangeText={setFilter}
        style={styles.searchbar}
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
            router.push({
              pathname: "/screens/workout/SingleWorkoutInfoScreen",
              params: { workoutEditId: `temp_${Date.now()}` },
            });
          }}
          style={({ pressed }) => [
            styles.bigButton,
            { backgroundColor: pressed ? "#333" : "#000" },
          ]}
        >
          <View style={styles.bigButtonTextWrapper}>
            <Text style={styles.itemTitle}>Training erstellen</Text>
            <Ionicons name={"add-outline"} size={styles.itemTitle.fontSize} color={styles.itemTitle.color} />
          </View>
        </Pressable>
      </View>

      <LoadingOverlay visible={loading} />
    </View>
  );
}
