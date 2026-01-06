import { router } from "expo-router";
import { View, TextInput, StyleSheet, Text, Pressable } from "react-native";
import { useState } from "react";
import { TopBar } from "../../components/TopBar"
import { auth, db } from "../../firebaseConfig";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import ExerciseList from "../../components/ExerciseList";
import LoadingOverlay from "../../components/LoadingOverlay";
import {Colors} from "../../styles/theme";
import { useLoadExercises } from "../../hooks/useLoadExercises";


type Exercise = {
    id: string;
    name: string;
    muscleGroup?: string;
    equipment?: string;
    instructions?: string;
    isFavorite: boolean;
};

export default function ExerciseScreen() {

    const [filter, setFilter] = useState("");
    const { exercises, setExercises, loading } = useLoadExercises();

    async function toggleFavorite(exercise: Exercise) {
        const user = auth.currentUser;
        if (!user) return;

        const ref = doc(
            db,
            "users",
            user.uid,
            "favorites",
            exercise.id,
        );

        // new exercise Object in list to reload
        setExercises(prev =>
            prev.map(ex =>
                ex.id === exercise.id
                    ? { ...ex, isFavorite: !ex.isFavorite }
                    : ex
            )
        );

        // toggle favorite in db
        if (exercise.isFavorite) {
            await deleteDoc(ref);
            exercise.isFavorite = false;
            console.log(exercise.name+": no fav");
        } else {
            await setDoc(ref, {
                name: exercise.name,
                muscleGroup: exercise.muscleGroup,
                equipment: exercise.equipment,
                instructions: exercise.instructions,
            });
            exercise.isFavorite = true;
            console.log(exercise.name+": fav");
        }
    }

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
                exercises={exercises}
                filter={filter}
                //onItemPress={toggleFavorite}
                onItemPress={(exercise) => router.push({ pathname: "/screens/workout/SingleExerciseInfoScreen", params: { id: exercise.id }})}
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