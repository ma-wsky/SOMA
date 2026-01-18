import { Text, TextInput, View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import WorkoutList from "@/components/WorkoutList";
import { workoutStyles as styles } from "@/styles/workoutStyles";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLoadWorkouts } from "@/hooks/useLoadWorkouts";
import LoadingOverlay from "@/components/LoadingOverlay";
import { doc, deleteDoc, collection } from "firebase/firestore";
import { auth, db } from "@/firebaseConfig";
import { showAlert } from "@/utils/alertHelper";

export default function WorkoutScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState("");
  const [hasActiveWorkout, setHasActiveWorkout] = useState(false);
  const [loading, setLoading] = useState(false);
  const { workouts, loading: workoutsLoading, refetch } = useLoadWorkouts();

  // When this tab is focused, open the ActiveWorkoutScreen if there is an active workout stored
  useFocusEffect(
    useCallback(() => {
      try {
        const active = require("@/utils/activeWorkoutStore").getActiveWorkout();
        if (active?.id) {
          router.push({ pathname: '/screens/workout/ActiveWorkoutScreen', params: { id: active.id } });
        }
      } catch (e) {
        console.warn('Error checking active workout on focus', e);
      }
    }, [])
  );

  const handleDeleteWorkout = async (workoutId: string) => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        showAlert("Fehler", "Sie müssen angemeldet sein");
        return;
      }

      const workoutRef = doc(db, "users", user.uid, "workouts", workoutId);
      await deleteDoc(workoutRef);

      showAlert("Erfolg", "Training gelöscht");
      // Refresh the list
      refetch?.();
    } catch (e) {
      console.error("Fehler beim Löschen:", e);
      showAlert("Fehler", "Training konnte nicht gelöscht werden");
    } finally {
      setLoading(false);
    }
  };

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
        onDelete={handleDeleteWorkout}
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

      <LoadingOverlay visible={loading || workoutsLoading} />
    </View>
  );
}
