import { useCallback } from "react";
import { writeBatch, doc, collection } from "firebase/firestore";
import { router } from "expo-router";
import { db, auth } from "@/firebaseConfig";
import { clearActiveWorkout } from "@/utils/store/activeWorkoutStore";
import { showAlert, showConfirm, showChoice } from "@/utils/helper/alertHelper";
import type { Workout } from "@/types/workoutTypes";
import Toast from 'react-native-toast-message';
import { playSound } from "@/utils/helper/soundHelper";
import { useBaseWorkoutData } from "@/hooks/useBaseWorkoutData";

export const useActiveWorkoutData = (initialWorkout?: Workout | null) => {
  const baseData = useBaseWorkoutData(initialWorkout);
  const { 
    workout, 
    //setWorkout,
    //isEditMode,
    setIsEditMode,
    setLoading,
    updateWorkoutState 
  } = baseData;

  const editIdRef = { current: null as string | null };
  const setEditIdRefWrapped = useCallback((id: string) => {
    editIdRef.current = id;
    baseData.setEditIdRef(id);
  }, [baseData]);

  const handleSetCheck = useCallback(
    (setIndex: number) => {
      if (!workout) return;
      const sets = [...workout.exerciseSets];
      sets[setIndex] = { ...sets[setIndex], isDone: !sets[setIndex].isDone };
      updateWorkoutState({ ...workout, exerciseSets: sets });
    },
    [workout, updateWorkoutState]
  );

  const handleDiscardWorkout = useCallback(() => {
    showConfirm(
      "Training verwerfen",
      "Möchten Sie dieses Training wirklich verwerfen?",
      () => {
        clearActiveWorkout();
        if (editIdRef.current) require("@/utils/store/workoutEditingStore").clearEditingWorkout(editIdRef.current);
        router.dismissAll();
        router.replace("/(tabs)/WorkoutScreenProxy");
      },
      { confirmText: "Verwerfen", cancelText: "Abbrechen" }
    );
  }, []);

  const handleFinishWorkout = useCallback(() => {
    if (!workout || !workout.name || workout.exerciseSets.length === 0) {
      showAlert(
        "Fehler",
        "Bitte geben Sie einen Trainingsnamen ein und fügen Sie mindestens einen Satz hinzu."
      );
      return;
    }

    showChoice(
      "Fertigstellen",
      "Möchtest du das Training fertigstellen?",
      [
        {
            text: "Abbrechen",
            onPress: () => {},
            style: "cancel"
        },
        {
            text: "Ja",
            style: "default",
            onPress: () => {
                showChoice(
                    "Vorlage",
                    "Möchtest du zusätzlich eine neue Vorlage erstellen?",
                    [
                        {
                            text: "Nein",
                            onPress: () => saveWorkoutToDatabase("history")
                        },
                        {
                            text: "Ja",
                            onPress: () => saveWorkoutToDatabase("template")
                        }
                    ]
                )
            }
        },
      ]
    );
  }, [workout]);

  const saveWorkoutToDatabase = useCallback(
    async (type: "template" | "history") => {
      setLoading(true);
      try {
        const user = auth.currentUser;
        if (!user || !workout) return;

        const batch = writeBatch(db);
        const duration = workout.startTime ? Math.floor((Date.now() - workout.startTime)/1000) : 0;

        const historyId = `workout_${Date.now()}_his`;
        const historyRef = doc(db, "users", user.uid, "workouts", historyId);
        
        batch.set(historyRef, {
          date: workout.date,
          name: workout.name,
          duration: duration,
          type: "history",
        });

        const setsRef = collection(historyRef, "exerciseSets");
        workout.exerciseSets.forEach((set, index) => {
            const setDocName = `set_${index.toString().padStart(3, "0")}`;
            batch.set(doc(setsRef, setDocName), {
              exerciseId: set.exerciseId,
              exerciseName: set.exerciseName || null,
              name: set.name || null,
              breaktime: set.breaktime ?? 30,
              weight: set.weight,
              reps: set.reps,
              isDone: set.isDone || false,
            });
        });

        if (type === "template") {
            const templateId = `workout_${Date.now()}_tpl`;
            const templateRef = doc(db, "users", user.uid, "workouts", templateId);
            
            batch.set(templateRef, {
              date: new Date().toISOString(), 
              name: workout.name, 
              type: "template",
            });

            const tplSetsRef = collection(templateRef, "exerciseSets");
              workout.exerciseSets.forEach((set, index) => {
                const setDocName = `set_${index.toString().padStart(3, "0")}`;
                batch.set(doc(tplSetsRef, setDocName), {
                  exerciseId: set.exerciseId,
                  exerciseName: set.exerciseName || null,
                  name: set.name || null,
                  breaktime: set.breaktime ?? 30,
                  weight: set.weight,
                  reps: set.reps,
                  isDone: false,
                });
            });
        }

        await batch.commit();

        try {
           playSound(require('@/assets/sounds/success.mp3'));
        } catch (e) {}

        Toast.show({
          type: 'success',
          text1: 'Herzlichen Glückwunsch! 🎉',
          text2: 'Training erfolgreich gespeichert.'
        });

        clearActiveWorkout();
        require("@/utils/store/workoutTimerStore").clearWorkoutTimer();
        require("@/utils/store/restTimerStore").clearRestTimer();
        if (editIdRef.current) require("@/utils/store/workoutEditingStore").clearEditingWorkout(editIdRef.current);

        router.dismissAll();
        router.navigate("/(tabs)/WorkoutScreenProxy");
      } catch (e) {
        console.error("Fehler beim Speichern:", e);
        showAlert("Fehler", "Training konnte nicht gespeichert werden.");
      } finally {
        setLoading(false);
      }
    },
    [workout, setLoading]
  );

  const handleSaveChanges = useCallback(
    async (elapsedTime: number) => {
      if (!workout) return;
      setIsEditMode(false);
      showAlert("Info", "Änderungen für aktuelles Training übernommen.");
    },
    [workout, setIsEditMode]
  );

  return {
    ...baseData,
    setEditIdRef: setEditIdRefWrapped,
    handleSetCheck,
    handleDiscardWorkout,
    handleFinishWorkout,
    saveWorkoutToDatabase,
    handleSaveChanges,
  };
};
