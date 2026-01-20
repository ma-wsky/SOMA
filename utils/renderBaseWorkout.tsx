import React from "react";
import {
    View,
    Text,
    TextInput,
    Pressable,
    Modal,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { ExerciseSet, OverlayTypes } from "@/types/workoutTypes";
import { workoutStyles as styles } from "@/styles/workoutStyles";
import { NumberStepper, newStyles } from "@/components/NumberStepper";
import { Colors } from "@/styles/theme";
import { formatTimeShort } from "@/utils/helper/formatTimeHelper";


export interface BaseOverlayProps {
    activeOverlay: OverlayTypes;
    tempBreakTime: { mins: number; secs: number };
    tempSetData: { weight: number; reps: number; isDone?: boolean };
    onSaveModalChanges: () => void;
    onCloseOverlay: () => void;
    onBreakTimeChange?: (mins: number, secs: number) => void;
    onSetDataChange?: (weight: number, reps: number) => void;
}

export interface BaseExerciseCardHeaderProps {
    exerciseName: string;
    breaktime: number;
    onOpenBreakTime: (exerciseId: string, currentSeconds: number) => void;
    exerciseId: string;
}

export interface BaseSetRowProps {
    set: ExerciseSet;
    displayIndex: number;
    globalIndex: number;
    isEditing: boolean;
    onEdit?: (index: number, set: ExerciseSet) => void;
    onRemove?: (index: number) => void;
    showCheckbox?: boolean;
    onSetCheck?: (index: number, breaktime: number) => void;
}


export const renderBaseOverlay = (props: BaseOverlayProps): React.ReactNode => {
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
                    if (props.onBreakTimeChange) {
                        const mins = parseInt(v) || 0;
                        props.onBreakTimeChange(mins, props.tempBreakTime.secs);
                    }
                }}
                />
                <Text style={newStyles.label}>Min</Text>
                <TextInput
                    style={newStyles.timeInput}
                    keyboardType="numeric"
                    value={props.tempBreakTime.secs.toString()}
                    onChangeText={(v) => {
                    if (props.onBreakTimeChange) {
                        const secs = parseInt(v) || 0;
                        props.onBreakTimeChange(props.tempBreakTime.mins, secs);
                    }
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
                    if (props.onSetDataChange) {
                        props.onSetDataChange(v, props.tempSetData.reps);
                    }
                    }}
                    step={0.5}
                />
                <NumberStepper
                    label="Wiederholungen"
                    value={props.tempSetData.reps}
                    onChange={(v) => {
                    if (props.onSetDataChange) {
                        props.onSetDataChange(props.tempSetData.weight, v);
                    }
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



export const renderExerciseCardHeader = (props: BaseExerciseCardHeaderProps): React.ReactNode => (
    <View style={styles.exerciseCardHeader}>
    <Text style={{ fontSize: 22, fontWeight: "bold", color: "white", marginRight: 8 }}>Pic</Text>

    <Text style={styles.exerciseTitle}>{props.exerciseName}</Text>

    <Pressable onPress={() => props.onOpenBreakTime(props.exerciseId, props.breaktime)}>
        <View style={{ flexDirection: "row", alignItems: "center", padding: 8 }}>
        <Ionicons name="alarm-outline" size={20} color={Colors.primary} />
        <Text style={{ color: Colors.primary, marginLeft: 4, fontSize: 12 }}>{props.breaktime}s</Text>
        </View>
    </Pressable>
    </View>
);


export const renderSetRowHeader = (
    showDoneColumn: boolean,
    showEditColumn: boolean
    ): React.ReactNode => (
    <View style={styles.setRowHeader}>
        <Text style={styles.setTextHeader}>Satz</Text>
        <Text style={styles.setTextHeader}>Gewicht (kg)</Text>
        <Text style={styles.setTextHeader}>Wdh.</Text>
        {showDoneColumn && <Text style={styles.setTextHeader}>Erledigt</Text>}
        {showEditColumn && <View style={{ width: 50 }} />}
    </View>
);


export const renderBaseSetRow = (props: BaseSetRowProps): React.ReactNode => {
    const { set, displayIndex, globalIndex, isEditing, onEdit, onRemove, showCheckbox, onSetCheck } = props;

    return (
        <View style={isEditing ? styles.setEditRow : styles.setRow}>
        <Text style={styles.setText}>{displayIndex}</Text>
        <Text style={styles.setText}>{set.weight}</Text>
        <Text style={styles.setText}>{set.reps}</Text>

        {showCheckbox && !isEditing && onSetCheck && (
            <Pressable
            onPress={() => onSetCheck(globalIndex, set.breaktime || 30)}
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
            >
            <Ionicons
                name={set.isDone ? "checkbox" : "checkbox-outline"}
                size={28}
                color={set.isDone ? Colors.primary : Colors.black}
            />
            </Pressable>
        )}

        {showCheckbox && isEditing && (
            <Text style={styles.setText}>-</Text>
        )}

        {isEditing && onEdit && onRemove && (
        <View style={{ flexDirection: "row", gap: 15, flexGrow: 0 }}>
            <Pressable onPress={() => onEdit(globalIndex, set)}>
                <Ionicons name="pencil" size={22} color={Colors.black} />
            </Pressable>
            <Pressable onPress={() => onRemove(globalIndex)}>
                <Ionicons name="trash" size={22} color={Colors.black} />
            </Pressable>
        </View>
        )}
    </View>
    );
};



export const renderAddSetButton = (
    exerciseId: string,
    exerciseName: string,
    onPress: (exerciseId: string, exerciseName: string) => void
    ): React.ReactNode => (
    <Pressable
    onPress={() => onPress(exerciseId, exerciseName)}
    style={styles.addSetButton}
    >
    <Text style={styles.addSetButtonText}>Satz hinzufügen +</Text>
</Pressable>
);



export const renderRestTimerBar = (
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
        <Text style={{ color: Colors.white, fontSize: 12, fontWeight: "600" }}>Pausenzeit</Text>
        <Text style={{ color: Colors.white, fontSize: 24, fontWeight: "bold", marginTop: 4 }}>{formatTimeShort(restTimeRemaining)}</Text>
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
