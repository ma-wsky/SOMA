import { router, useLocalSearchParams } from "expo-router";
import { View, TextInput, StyleSheet, Text, Pressable } from "react-native";
import { useState, useEffect } from "react";
import { TopBar } from "../../components/TopBar"
import { auth, db } from "../../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { getDocs, where, query, collection } from "firebase/firestore";
import ExerciseList from "../../components/ExerciseList";
import LoadingOverlay from "../../components/LoadingOverlay";
import {Colors} from "../../styles/theme";

type Exercise = {
    id: string;
    name: string;
    muscleGroup?: string;
    equipment?: string;
};

export default function SingleExerciseStatisticScreen() {

    const [loading,setLoading] = useState<boolean>(false);
    const { id } = useLocalSearchParams<{ id: string }>();
    const [exercise, setExercise] = useState<Exercise | null>(null);

    useEffect(() => {
        if (!id) return;
        setLoading(true);

        const fetchExercise = async () => {
            try{
                const globalRef = doc(db, "exercises", id);
                const globalSnap = await getDoc(globalRef);
                if (globalSnap.exists()) {
                    setExercise({ id: globalSnap.id, ...globalSnap.data() } as Exercise);
                    return;
                }

                const user = auth.currentUser;
                if (!user) return;

                const userRef = doc(db, "users", user.uid, "exercises", id);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    setExercise({ id: userSnap.id, ...userSnap.data() } as Exercise);
                    return;
                }

                setExercise(null);
            } catch (e) {
                console.error("Fehler beim Laden der Übung:", e);
                setExercise(null);
            } finally {
                setLoading(false);
            }

        };

        fetchExercise();
    }, [id]);

    if (!exercise) return;

    return (
        <View style={styles.container}>

            {/* Top Bar */}
            <TopBar leftButtonText={"Zurück"}
                    titleText={"Übung Statistik"}
                    rightButtonText={"Download"}
                    onLeftPress={() => router.back()}
                    onRightPress={() => console.log("download")}
            ></TopBar>

            <View>
                <Text>{exercise.name}</Text>
            </View>

            {/* Loading Overlay */}
            <LoadingOverlay visible={loading} />

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
    },
})