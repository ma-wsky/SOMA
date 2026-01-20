// Render functions for workout UI components
// Separated for better organization and reusability

import React from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Modal,
} from "react-native";
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import Ionicons from "@expo/vector-icons/Ionicons";
import type { ExerciseSet, Workout, OverlayTypes } from "@/types/workoutTypes";
import { workoutStyles as styles } from "@/styles/workoutStyles";
import { NumberStepper, newStyles, minSecToSeconds } from "@/components/NumberStepper";
import { Colors } from "@/styles/theme";
import { groupSetsByExercise } from "@/utils/workoutExerciseHelper";

// ==================== ACTIVEWORKOUTSCREEN RENDERS ====================

interface ActiveWorkoutRenderProps {
  workout: Workout;
  isEditMode: boolean;
  activeOverlay: OverlayTypes;
  restTimeRemaining: number;
  tempBreakTime: { mins: number; secs: number };
  tempSetData: { weight: number; reps: number; isDone: boolean };
  onOpenBreakTime: (exerciseId: string, currentSeconds: number) => void;
  onOpenEditSet: (index: number, set: ExerciseSet) => void;
  onOpenAddSet: (exerciseId: string, exerciseName: string) => void;
  onSetCheck: (setIndex: number, breaktime: number) => void;
  onRemoveSet: (index: number) => void;
  onEditModeToggle: (enabled: boolean) => void;
  onAddExercise: () => void;
  onSaveModalChanges: () => void;
  onCloseOverlay: () => void;
  onRestTimerClose: () => void;
  onWorkoutNameChange: (name: string) => void;
}

export const renderActiveViewMode = (props: ActiveWorkoutRenderProps): React.ReactNode => {
  const groupedSets = groupSetsByExercise(props.workout.exerciseSets);

  return (
    <BottomSheetScrollView contentContainerStyle={{ paddingBottom: 120, padding: 16 }} style={{flex: 1}}>
      <Text 
        style={{ color: Colors.black, marginBottom: 10, fontSize: 24, textAlign: 'center' }}
        numberOfLines={2}
        ellipsizeMode="tail"
      >
        {props.workout.name}
      </Text>

      {Object.entries(groupedSets).map(([exerciseId, sets]) =>
        renderActiveExerciseCard(exerciseId, sets, false, props)
      )}

      <View style={{ alignItems: "center" }}>
        <Pressable
          onPress={() => props.onEditModeToggle(true)}
          style={styles.topBarLikeButton}
        >
          <Text style={styles.topBarButtonText}>Bearbeiten</Text>
        </Pressable>
      </View>
    </BottomSheetScrollView>
  );
};

export const renderActiveEditMode = (props: ActiveWorkoutRenderProps): React.ReactNode => {
  const groupedSets = groupSetsByExercise(props.workout.exerciseSets);

  return (
    <BottomSheetScrollView contentContainerStyle={{ paddingBottom: 120, padding: 16 }} style={{flex: 1}}>
      <View style={{ padding: 16 }}>
        <Text style={{ color: Colors.black, width: 800, marginBottom: 4, fontSize: 24 }}>
          Trainingsname:
        </Text>
        <TextInput
          value={props.workout.name || ""}
          onChangeText={props.onWorkoutNameChange}
          style={{
            backgroundColor: Colors.background,
            color: Colors.black,
            padding: 10,
            borderRadius: 8,
            borderColor: Colors.black,
            borderWidth: 1,
          }}
        />
      </View>
      {Object.entries(groupedSets).map(([exerciseId, sets]) =>
        renderActiveExerciseCard(exerciseId, sets, true, props)
      )}

      <Pressable
        onPress={props.onAddExercise}
        style={styles.addExerciseButton}
      >
        <Text style={styles.addExerciseButtonText}>Übung hinzufügen +</Text>
      </Pressable>
    </BottomSheetScrollView>
  );
};

const renderActiveExerciseCard = (
  exerciseId: string,
  sets: ExerciseSet[],
  isEditing: boolean,
  props: ActiveWorkoutRenderProps
): React.ReactNode => (
  <View key={exerciseId} style={styles.exerciseCard}>
    <View style={styles.exerciseCardHeader}>
      <Text style={{ fontSize: 22, fontWeight: "bold", color: "white", marginRight: 8 }}>
        Pic
      </Text>

      <Text style={styles.exerciseTitle}>{sets[0].exerciseName}</Text>

      <Pressable onPress={() => props.onOpenBreakTime(exerciseId, sets[0].breaktime || 30)}>
        <View style={{ flexDirection: "row", alignItems: "center", padding: 8 }}>
          <Ionicons name="alarm-outline" size={20} color={Colors.primary} />
          <Text style={{ color: Colors.primary, marginLeft: 4, fontSize: 12 }}>
            {sets[0].breaktime || 30}s
          </Text>
        </View>
      </Pressable>
    </View>

    <View style={styles.setRowHeader}>
      <Text style={styles.setTextHeader}>Satz</Text>
      <Text style={styles.setTextHeader}>Gewicht (kg)</Text>
      <Text style={styles.setTextHeader}>Wdh.</Text>
      <Text style={styles.setTextHeader}>Erledigt</Text>

      {isEditing && <View style={{ width: 50 }} />}
    </View>

    {sets.map((set) => {
      const globalIndex = props.workout.exerciseSets.indexOf(set);
      return (
        <View key={globalIndex} style={isEditing ? styles.setEditRow : styles.setRow}>
          <Text style={styles.setText}>{sets.indexOf(set) + 1}</Text>
          <Text style={styles.setText}>{set.weight}</Text>
          <Text style={styles.setText}>{set.reps}</Text>

          {!isEditing ? (
            <Pressable
              onPress={() => props.onSetCheck(globalIndex, set.breaktime || 30)}
              style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
            >
              <Ionicons
                name={set.isDone ? "checkbox" : "checkbox-outline"}
                size={28}
                color={set.isDone ? Colors.primary : Colors.black}
              />
            </Pressable>
          ) : (
            <Text style={styles.setText}>-</Text>
          )}

          {isEditing && (
            <View style={{ flexDirection: "row", gap: 15, flexGrow: 0 }}>
              <Pressable onPress={() => props.onOpenEditSet(globalIndex, set)}>
                <Ionicons name="pencil" size={22} color={Colors.black} />
              </Pressable>
              <Pressable onPress={() => props.onRemoveSet(globalIndex)}>
                <Ionicons name="trash" size={22} color={Colors.black} />
              </Pressable>
            </View>
          )}
        </View>
      );
    })}

    {isEditing && (
      <Pressable
        onPress={() => props.onOpenAddSet(exerciseId, sets[0].exerciseName)}
        style={styles.addSetButton}
      >
        <Text style={styles.addSetButtonText}>Satz hinzufügen +</Text>
      </Pressable>
    )}
  </View>
);

export const renderActiveOverlays = (props: ActiveWorkoutRenderProps): React.ReactNode => {
  if (props.activeOverlay === "none") return null;
  const isBreaktime = props.activeOverlay === "breaktime";
  const isEdit = props.activeOverlay === "editSet";
  const isAdd = props.activeOverlay === "addSet";

  return (
    <Modal visible={true} transparent animationType="fade" onRequestClose={props.onCloseOverlay}>
      <View style={newStyles.overlay}>
        <View style={newStyles.content}>
          <View style={newStyles.header}>
            <Pressable onPress={props.onCloseOverlay}>
              <Text style={{ color: "#ff4444" }}>Abbrechen</Text>
            </Pressable>
            <Text style={newStyles.headerTitle}>
              {isBreaktime ? "Pausenzeit" : isEdit ? "Satz bearbeiten" : "Satz hinzufügen"}
            </Text>
            <Pressable style={newStyles.saveButton} onPress={props.onSaveModalChanges}>
              <Text style={newStyles.saveText}>{isAdd ? "Hinzufügen" : "Speichern"}</Text>
            </Pressable>
          </View>

          {isBreaktime ? (
            <View style={newStyles.timeInputContainer}>
              <TextInput
                style={newStyles.timeInput}
                keyboardType="numeric"
                value={props.tempBreakTime.mins.toString()}
                onChangeText={(v) => {
                  // This will be handled by the parent component's state
                }}
              />
              <Text style={newStyles.label}>Min</Text>
              <TextInput
                style={newStyles.timeInput}
                keyboardType="numeric"
                value={props.tempBreakTime.secs.toString()}
                onChangeText={(v) => {
                  // This will be handled by the parent component's state
                }}
              />
              <Text style={newStyles.label}>Sek</Text>
            </View>
          ) : (
            <View>
              <NumberStepper
                label="Gewicht (kg)"
                value={props.tempSetData.weight}
                onChange={(v) => {
                  // This will be handled by the parent component's state
                }}
                step={0.5}
              />
              <NumberStepper
                label="Wiederholungen"
                value={props.tempSetData.reps}
                onChange={(v) => {
                  // This will be handled by the parent component's state
                }}
                step={1}
              />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export const renderActiveRestTimerBar = (
  restTimeRemaining: number,
  onClose: () => void
): React.ReactNode => {
  if (restTimeRemaining <= 0) return null;

  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: Colors.primary,
        padding: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        zIndex: 10,
      }}
    >
      <View>
        <Text style={{ color: Colors.white, fontSize: 12, fontWeight: "600" }}>
          Pausenzeit
        </Text>
        <Text style={{ color: Colors.white, fontSize: 24, fontWeight: "bold", marginTop: 4 }}>
          {Math.floor(restTimeRemaining / 60)}:{(restTimeRemaining % 60).toString().padStart(2, "0")}
        </Text>
      </View>
      <Pressable
        style={{ paddingHorizontal: 16, paddingVertical: 8, backgroundColor: Colors.black, borderRadius: 6 }}
        onPress={onClose}
      >
        <Text style={{ color: Colors.white, fontSize: 14, fontWeight: "600" }}>Fertig</Text>
      </Pressable>
    </View>
  );
};

// ==================== SINGLEWORKOUTINFOSCREEN RENDERS ====================

interface SingleWorkoutRenderProps {
  workout: Workout;
  isEditMode: boolean;
  activeOverlay: OverlayTypes;
  tempBreakTime: { mins: number; secs: number };
  tempSetData: { weight: number; reps: number };
  onOpenBreakTime: (exerciseId: string, currentSeconds: number) => void;
  onOpenEditSet: (index: number, set: ExerciseSet) => void;
  onOpenAddSet: (exerciseId: string, exerciseName: string) => void;
  onRemoveSet: (index: number) => void;
  onSaveModalChanges: () => void;
  onCloseOverlay: () => void;
}

export const renderSingleCard = (
  exerciseId: string,
  sets: ExerciseSet[],
  isEditMode: boolean,
  props: SingleWorkoutRenderProps
): React.ReactNode => (
  <View key={exerciseId} style={styles.exerciseCard}>
    <View style={styles.exerciseCardHeader}>
      <Text style={{ fontSize: 22, fontWeight: "bold", color: "white", marginRight: 8 }}>
        Pic
      </Text>

      <Text style={styles.exerciseTitle}>{sets[0].exerciseName}</Text>

      <Pressable onPress={() => props.onOpenBreakTime(exerciseId, sets[0].breaktime || 30)}>
        <View style={{ flexDirection: "row", alignItems: "center", padding: 8 }}>
          <Ionicons name="alarm-outline" size={20} color={Colors.primary} />
          <Text style={{ color: Colors.primary, marginLeft: 4, fontSize: 12 }}>
            {sets[0].breaktime || 30}s
          </Text>
        </View>
      </Pressable>
    </View>

    <View style={styles.setRowHeader}>
      <Text style={styles.setTextHeader}>Satz</Text>
      <Text style={styles.setTextHeader}>Gewicht (kg)</Text>
      <Text style={styles.setTextHeader}>Wdh.</Text>
      {isEditMode && <View style={{ width: 50 }} />}
    </View>

    {sets.map((set) => {
      const idx = props.workout.exerciseSets.indexOf(set);

      return (
        <View key={idx} style={isEditMode ? styles.setEditRow : styles.setRow}>
          <Text style={styles.setText}>{sets.indexOf(set) + 1}</Text>
          <Text style={styles.setText}>{set.weight}</Text>
          <Text style={styles.setText}>{set.reps}</Text>

          {isEditMode && (
            <View style={{ flexDirection: "row", gap: 15, flexGrow: 0 }}>
              <Pressable onPress={() => props.onOpenEditSet(idx, set)}>
                <Ionicons name="pencil" size={22} color={Colors.black} />
              </Pressable>
              <Pressable onPress={() => props.onRemoveSet(idx)}>
                <Ionicons name="trash" size={22} color={Colors.black} />
              </Pressable>
            </View>
          )}
        </View>
      );
    })}

    {isEditMode && (
      <Pressable
        onPress={() => props.onOpenAddSet(exerciseId, sets[0].exerciseName || "")}
        style={styles.addSetButton}
      >
        <Text style={styles.addSetButtonText}>Satz hinzufügen +</Text>
      </Pressable>
    )}
  </View>
);

// ==================== WORKOUT HISTORY RENDER ====================

export const renderHistoryCard = (
  exerciseId: string,
  sets: ExerciseSet[]
): React.ReactNode => (
  <View key={exerciseId} style={styles.exerciseCard}>
    <View style={styles.exerciseCardHeader}>
      <Text style={{ fontSize: 22, fontWeight: "bold", color: "white", marginRight: 8 }}>
        Pic
      </Text>

      <Text style={styles.exerciseTitle}>{sets[0].exerciseName}</Text>

      {/* Breaktime displayed but not interactive */}
      <View style={{ flexDirection: "row", alignItems: "center", padding: 8 }}>
        <Ionicons name="alarm-outline" size={20} color={Colors.primary} />
        <Text style={{ color: Colors.primary, marginLeft: 4, fontSize: 12 }}>
          {sets[0].breaktime || 30}s
        </Text>
      </View>
    </View>

    <View style={styles.setRowHeader}>
      <Text style={styles.setTextHeader}>Satz</Text>
      <Text style={styles.setTextHeader}>Gewicht (kg)</Text>
      <Text style={styles.setTextHeader}>Wdh.</Text>
      <Text style={styles.setTextHeader}>Status</Text>
    </View>

    {sets.map((set, index) => {
      return (
        <View key={index} style={styles.setRow}>
          <Text style={styles.setText}>{index + 1}</Text>
          <Text style={styles.setText}>{set.weight}</Text>
          <Text style={styles.setText}>{set.reps}</Text>
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Ionicons
              name={set.isDone ? "checkmark-circle" : "ellipse-outline"}
              size={24}
              color={set.isDone ? Colors.primary : "#999"}
            />
          </View>
        </View>
      );
    })}
  </View>
);

export const renderSingleOverlays = (props: SingleWorkoutRenderProps): React.ReactNode => {
  if (props.activeOverlay === "none") return null;
  const isBreaktime = props.activeOverlay === "breaktime";
  const isEdit = props.activeOverlay === "editSet";
  const isAdd = props.activeOverlay === "addSet";

  return (
    <Modal visible={true} transparent animationType="fade" onRequestClose={props.onCloseOverlay}>
      <View style={newStyles.overlay}>
        <View style={newStyles.content}>
          <View style={newStyles.header}>
            <Pressable onPress={props.onCloseOverlay}>
              <Text style={{ color: "#ff4444" }}>Abbrechen</Text>
            </Pressable>
            <Text style={newStyles.headerTitle}>
              {isBreaktime ? "Pausenzeit" : isEdit ? "Satz bearbeiten" : "Satz hinzufügen"}
            </Text>
            <Pressable style={newStyles.saveButton} onPress={props.onSaveModalChanges}>
              <Text style={newStyles.saveText}>{isAdd ? "Hinzufügen" : "Speichern"}</Text>
            </Pressable>
          </View>

          {isBreaktime ? (
            <View style={newStyles.timeInputContainer}>
              <TextInput
                style={newStyles.timeInput}
                keyboardType="numeric"
                value={props.tempBreakTime.mins.toString()}
                onChangeText={(v) => {
                  // This will be handled by the parent component's state
                }}
              />
              <Text style={newStyles.label}>Min</Text>
              <TextInput
                style={newStyles.timeInput}
                keyboardType="numeric"
                value={props.tempBreakTime.secs.toString()}
                onChangeText={(v) => {
                  // This will be handled by the parent component's state
                }}
              />
              <Text style={newStyles.label}>Sek</Text>
            </View>
          ) : (
            <View>
              <NumberStepper
                label="Gewicht (kg)"
                value={props.tempSetData.weight}
                onChange={(v) => {
                  // This will be handled by the parent component's state
                }}
                step={0.5}
              />
              <NumberStepper
                label="Wiederholungen"
                value={props.tempSetData.reps}
                onChange={(v) => {
                  // This will be handled by the parent component's state
                }}
                step={1}
              />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};
