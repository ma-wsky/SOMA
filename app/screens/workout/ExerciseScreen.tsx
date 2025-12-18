import { router } from "expo-router";
import { View, TextInput, StyleSheet, Text, Pressable } from "react-native";
import { useState, useEffect } from "react";
import { TopBar } from "../../components/TopBar"
import { auth, db } from "../../firebaseConfig";
import { getDocs, where, query, collection } from "firebase/firestore";
import ExerciseList from "../../components/ExerciseList";
import LoadingOverlay from "../../components/LoadingOverlay";
import {Colors} from "../../styles/theme";
//import {workoutStyles as styles} from "../../styles/workoutStyles";


type Exercise = {
    id: string;
    name: string;
    muscleGroup?: string;
    equipment?: string;
    ownerId?: string | null;
    isGlobal?: boolean;
};

export default function ExerciseScreen() {

    const [filter, setFilter] = useState("");
    const [loading, setLoading] = useState(false);
    const [exercises, setExercises] = useState<Exercise[]>([]);

    const filteredExercises = exercises.filter(ex => {
        // @ts-ignore
        return ex.name.toLowerCase().includes(filter.toLowerCase());
    });

    useEffect(() => {
        const loadExercises = async () => {
            setLoading(true);
            const user = auth.currentUser;
            if (!user) {
                console.error("Kein User angemeldet.");
                setLoading(false);
                return;
            }

            try {
                const qGlobal =
                    query(collection(db, "exercises"),
                    where("isGlobal", "==", true),
                );

                const qUser =
                    query(collection(db, "exercises"),
                    where("ownerId", "==", user.uid)
                );

                const snapshotG = await getDocs(qGlobal);
                const snapshotU = await getDocs(qUser);

                const globalExercises = snapshotG.docs.map(doc => ({
                    id: doc.id,
                    name: doc.data().name || "unnamed",
                    ...doc.data()
                }));

                const userExercises = snapshotU.docs.map(doc => ({
                    id: doc.id,
                    name: doc.data().name || "unnamed",
                    ...doc.data()
                }));

                const allExercises = [...globalExercises, ...userExercises];
                setExercises(allExercises);
            } catch (e) {
                console.error("Fehler beim Laden:", e);
            }finally {
                setLoading(false);
            }
        };

        loadExercises();
    }, []);

    console.log(filteredExercises);

    return (
        <View style={styles.container}>

            {/* Top Bar */}
            <TopBar leftButtonText={"Zurück"}
                    titleText={"Übungen"}
                    rightButtonText={"Erstellen"}
                    onLeftPress={() => router.push("../..//(tabs)/HomeScreenProxy")}
                    onRightPress={() => router.push("./CreateExerciseScreen")}
            ></TopBar>

            {/* Search Bar */}
            <TextInput placeholder={"Übung suchen..."}
                       placeholderTextColor='white'
                       value={filter}
                       onChangeText={setFilter}
                       style={styles.search}/>

            <ExerciseList
                exercises={filteredExercises}
                onItemPress={(exercise) => console.log("Gewählt:", exercise.name)}
            />

            <Pressable
                style={{marginBottom:40, backgroundColor: Colors.primary, alignItems: "center"}}
                onPress={async () => router.push("../AdminAddExercise")}

            >
                <Text >Dev add exercise</Text>
            </Pressable>

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
    search:{
        padding:10,
        color: 'white',
        fontSize:20,
        backgroundColor:'black',
        margin:20,
        borderRadius: 50,

    },
})