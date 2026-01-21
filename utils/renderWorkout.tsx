import React from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
} from "react-native";
import { ScrollView } from 'react-native-gesture-handler';
import Ionicons from "@expo/vector-icons/Ionicons";
import type { ExerciseSet, Workout, OverlayTypes } from "@/types/workoutTypes";
import { workoutStyles as styles } from "@/styles/workoutStyles";
import { NumberStepper, newStyles, minSecToSeconds } from "@/components/NumberStepper";
import { Colors } from "@/styles/theme";
import { groupSetsByExercise } from "@/utils/helper/workoutExerciseHelper";
import { formatTimeShort } from "@/utils/helper/formatTimeHelper";
import { TopBar } from "@/components/TopBar";

//TODO Nutzt wirklich RenderBase??
//TODO RenderOverlay raus holen

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
  // Neue Setter für Overlay-Daten
  onSetTempSetData: (data: { weight: number; reps: number; isDone: boolean }) => void;
  onSetTempBreakTime: (data: { mins: number; secs: number }) => void;
  isFromActiveWorkout?: boolean;
}

export const renderActiveViewMode = (props: ActiveWorkoutRenderProps): React.ReactNode => {
  const groupedSets = groupSetsByExercise(props.workout.exerciseSets);

  return (
    <ScrollView >
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
    </ScrollView>
  );
};

export const renderActiveEditMode = (props: ActiveWorkoutRenderProps): React.ReactNode => {
  const groupedSets = groupSetsByExercise(props.workout.exerciseSets);

  return (
    <ScrollView >
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

      <View style={{alignItems:'center'}}>
        <Pressable
        onPress={props.onAddExercise}
        style={styles.topBarLikeButton }
        >
        <Text style={styles.topBarButtonText}>Übung hinzufügen +</Text>
        </Pressable>
      </View>

    </ScrollView>
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
      <Text style={{ fontSize: 22, fontWeight: "bold", color: "white", marginRight: 8 }}>Pic</Text>

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
      <Text style={styles.setTextHeader}>Gewicht</Text>
      <Text style={styles.setTextHeader}>Wdh.</Text>

      {isEditing ? <View style={{ width: 50 }} />:
            <Text style={styles.setTextHeader}>Erledigt</Text>
        }
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
              style={{ flex: 1 }}
            >
              <Ionicons
                name={set.isDone ? "checkbox" : "checkbox-outline"}
                size={28}
                color={set.isDone ? Colors.primary : Colors.black}
              />
            </Pressable>
          ) : (
            <Text ></Text>
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
  if (props.activeOverlay === "none" || props.activeOverlay === "restTimer") return null;
  const isBreaktime = props.activeOverlay === "breaktime";
  const isEdit = props.activeOverlay === "editSet";
  const isAdd = props.activeOverlay === "addSet";
  const isFromActiveWorkout = props.isFromActiveWorkout !== false; // Default true für ActiveWorkout

  return (
    <Modal visible={true} transparent animationType="fade" onRequestClose={props.onCloseOverlay}>
      <View style={newStyles.overlay}>
        <View style={newStyles.content}>
          {/* TopBar Style Header */}
          <TopBar
                  leftButtonText={ "Zurück"}
                  titleText={isBreaktime ? "Pausenzeit" : isEdit ? "Set bearbeiten" : "Set hinzufügen"}
                  rightButtonText={isAdd ? "Hinzufügen" : "Speichern"}
                  onLeftPress={props.onCloseOverlay}
                  onRightPress={props.onSaveModalChanges}
                />
          

          {isBreaktime ? (
            /* Pausenzeit Overlay */
            <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
              <View style={newStyles.timeInputContainer}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: Colors.black, marginBottom: 8, fontSize: 14 }}>Minuten</Text>
                  <TextInput
                    style={newStyles.timeInput}
                    keyboardType="numeric"
                    value={props.tempBreakTime.mins.toString()}
                    onChangeText={(v) => props.onSetTempBreakTime({ ...props.tempBreakTime, mins: Number(v) || 0 })}
                  />
                </View>
                <Text style={{ fontSize: 24, marginHorizontal: 10, color: Colors.black, marginTop: 20, }}>:</Text>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: Colors.black, marginBottom: 8, fontSize: 14 }}>Sekunden</Text>
                  <TextInput
                    style={newStyles.timeInput}
                    keyboardType="numeric"
                    value={props.tempBreakTime.secs.toString()}
                    onChangeText={(v) => props.onSetTempBreakTime({ ...props.tempBreakTime, secs: Number(v) || 0 })}
                  />
                </View>
              </View>
            </View>
          ) : (
            /* AddSet / EditSet Overlay */
            <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
              {/* Gewicht */}
              <View style={{ marginBottom: 24 }}>
                <Text style={{ color: Colors.black, fontSize: 16, marginBottom: 8 }}>Gewicht (kg)</Text>
                <NumberStepper
                  label=""
                  value={props.tempSetData.weight}
                  onChange={(v) => props.onSetTempSetData({ ...props.tempSetData, weight: v })}
                  step={0.5}
                />
              </View>
              
              {/* Wiederholungen */}
              <View style={{ marginBottom: 24 }}>
                <Text style={{ color: Colors.black, fontSize: 16, marginBottom: 8 }}>Wiederholungen</Text>
                <NumberStepper
                  label=""
                  value={props.tempSetData.reps}
                  onChange={(v) => props.onSetTempSetData({ ...props.tempSetData, reps: v })}
                  step={1}
                />
              </View>

              {/* Erledigt Checkbox - nur wenn von aktivem Workout */}
              {isFromActiveWorkout && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                  <Text style={{ color: Colors.black, fontSize: 16, marginRight: 16 }}>Erledigt</Text>
                  <Pressable
                    onPress={() => props.onSetTempSetData({ ...props.tempSetData, isDone: !props.tempSetData.isDone })}
                  >
                    <Ionicons
                      name={props.tempSetData.isDone ? "checkbox" : "checkbox-outline"}
                      size={28}
                      color={props.tempSetData.isDone ? Colors.primary : Colors.black}
                    />
                  </Pressable>
                </View>
              )}
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
          {formatTimeShort(restTimeRemaining)}
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


interface SingleWorkoutRenderProps {
  workout: Workout;
  isEditMode: boolean;
  activeOverlay: OverlayTypes;
  tempBreakTime: { mins: number; secs: number };
  tempSetData: { weight: number; reps: number; isDone?: boolean };
  onOpenBreakTime: (exerciseId: string, currentSeconds: number) => void;
  onOpenEditSet: (index: number, set: ExerciseSet) => void;
  onOpenAddSet: (exerciseId: string, exerciseName: string) => void;
  onRemoveSet: (index: number) => void;
  onSaveModalChanges: () => void;
  onCloseOverlay: () => void;
  onSetTempSetData: (data: { weight: number; reps: number; isDone?: boolean }) => void;
  onSetTempBreakTime: (data: { mins: number; secs: number }) => void;
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

      <Pressable onPress={() => props.onOpenBreakTime(exerciseId, sets[0].breaktime || 30)}
                 disabled={!isEditMode}>
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
      <Text style={styles.setTextHeader}>Gewicht</Text>
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

export const renderSingleOverlays = (props: SingleWorkoutRenderProps): React.ReactNode => {
  if (props.activeOverlay === "none") return null;
  const isBreaktime = props.activeOverlay === "breaktime";
  const isEdit = props.activeOverlay === "editSet";
  const isAdd = props.activeOverlay === "addSet";

  return (
    <Modal visible={true} transparent animationType="fade" onRequestClose={props.onCloseOverlay}>
      <View style={newStyles.overlay}>
        <View style={newStyles.content}>
          {/* TopBar Style Header */}
          <TopBar
                  leftButtonText={ "Zurück"}
                  titleText={isBreaktime ? "Pausenzeit" : isEdit ? "Set bearbeiten" : "Set hinzufügen"}
                  rightButtonText={isAdd ? "Hinzufügen" : "Speichern"}
                  onLeftPress={props.onCloseOverlay}
                  onRightPress={props.onSaveModalChanges}
                />

          {isBreaktime ? (
            /* Pausenzeit Overlay */
            <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
              <View style={newStyles.timeInputContainer}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: Colors.black, marginBottom: 8, fontSize: 14 }}>Minuten</Text>
                  <TextInput
                    style={newStyles.timeInput}
                    keyboardType="numeric"
                    value={props.tempBreakTime.mins.toString()}
                    onChangeText={(v) => props.onSetTempBreakTime({ ...props.tempBreakTime, mins: Number(v) || 0 })}
                  />
                </View>
                <Text style={{ fontSize: 24, marginHorizontal: 10, color: Colors.black, marginTop: 20, }}>:</Text>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: Colors.black, marginBottom: 8, fontSize: 14 }}>Sekunden</Text>
                  <TextInput
                    style={newStyles.timeInput}
                    keyboardType="numeric"
                    value={props.tempBreakTime.secs.toString()}
                    onChangeText={(v) => props.onSetTempBreakTime({ ...props.tempBreakTime, secs: Number(v) || 0 })}
                  />
                </View>
              </View>
            </View>
          ) : (
            /* AddSet / EditSet Overlay - ohne Erledigt Checkbox für SingleWorkout */
            <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
              {/* Gewicht */}
              <View style={{ marginBottom: 24 }}>
                <Text style={{ color: Colors.black, fontSize: 16, marginBottom: 8 }}>Gewicht (kg)</Text>
                <NumberStepper
                  label=""
                  value={props.tempSetData.weight}
                  onChange={(v) => props.onSetTempSetData({ ...props.tempSetData, weight: v })}
                  step={0.5}
                />
              </View>
              
              {/* Wiederholungen */}
              <View style={{ marginBottom: 24 }}>
                <Text style={{ color: Colors.black, fontSize: 16, marginBottom: 8 }}>Wiederholungen</Text>
                <NumberStepper
                  label=""
                  value={props.tempSetData.reps}
                  onChange={(v) => props.onSetTempSetData({ ...props.tempSetData, reps: v })}
                  step={1}
                />
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};


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

      <View style={{ flexDirection: "row", alignItems: "center", padding: 8 }}>
        <Ionicons name="alarm-outline" size={20} color={Colors.primary} />
        <Text style={{ color: Colors.primary, marginLeft: 4, fontSize: 12 }}>
          {sets[0].breaktime || 30}s
        </Text>
      </View>
    </View>

    <View style={styles.setRowHeader}>
      <Text style={styles.setTextHeader}>Satz</Text>
      <Text style={styles.setTextHeader}>Gewicht</Text>
      <Text style={styles.setTextHeader}>Wdh.</Text>
      <Text style={styles.setTextHeader}>Erledigt</Text>
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
