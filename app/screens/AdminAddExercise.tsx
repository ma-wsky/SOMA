import { View, TextInput, Button, StyleSheet, Alert } from "react-native";
import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

export default function AdminAddExerciseScreen() {
    const [name, setName] = useState("");
    const [muscleGroup, setMuscleGroup] = useState("");
    const [equipment, setEquipment] = useState("");

    const addExercise = async () => {
        if (!name) {
            Alert.alert("Fehler", "Bitte gib einen Übungsnamen ein.");
            return;
        }

        try {
            await addDoc(collection(db, "exercises"), {
                name,
                muscleGroup,
                equipment,
                isGlobal: true,   // Übung ist für alle sichtbar
                ownerId: null,    // keine user-spezifische Zuordnung
            });
            Alert.alert("Erfolg", `${name} hinzugefügt!`);
            setName("");
            setMuscleGroup("");
            setEquipment("");
        } catch (e) {
            console.error("Fehler beim Hinzufügen:", e);
            Alert.alert("Fehler", "Übung konnte nicht hinzugefügt werden.");
        }
    };

    return (
        <View style={styles.container}>
            <TextInput
                placeholder="Übungsname"
                value={name}
                onChangeText={setName}
                style={styles.input}
            />
            <TextInput
                placeholder="Muskelgruppe (optional)"
                value={muscleGroup}
                onChangeText={setMuscleGroup}
                style={styles.input}
            />
            <TextInput
                placeholder="Equipment (optional)"
                value={equipment}
                onChangeText={setEquipment}
                style={styles.input}
            />
            <Button title="Hinzufügen" onPress={addExercise} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        justifyContent: "center",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 12,
        fontSize: 16,
    },
});
