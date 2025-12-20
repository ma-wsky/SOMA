import { View,TextInput,StyleSheet } from "react-native";
import { router } from "expo-router";
import { useState } from 'react';
import { auth, db } from "../../firebaseConfig";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import LoadingOverlay from "../../components/LoadingOverlay";
import ExerciseList from "../../components/ExerciseList"
import { useLoadExercises } from "../../hooks/useLoadExercises"


type Exercise = {
    id: string;
    name: string;
    muscleGroup?: string;
    equipment?: string;
    ownerId?: string | null;
    isGlobal?: boolean;
    isFavorite: boolean;
};

export default function StatisticScreen() {

    const { exercises, setExercises, loading } = useLoadExercises();
    const [filter, setFilter] = useState("");

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
                createdAt: new Date(),
            });
            exercise.isFavorite = true;
            console.log(exercise.name+": fav");
        }

    }


    return (
        <View style={styles.container}>

            {/* Search Bar */}
            <TextInput placeholder={"Übung suchen..."}
                       placeholderTextColor='white'
                       value={filter}
                       onChangeText={setFilter}
                       style={styles.search}/>

            {/* TODO: Filter with tags */}

            {/* Exercise List with favorites and regular */}
            <ExerciseList
                exercises={exercises}
                filter={filter}
                onItemPress={(exercise) =>
                    router.push({
                        pathname: "/screens/stats/SingleExerciseStatisticScreen",
                        params: { id: exercise.id }
                    })
                }
            />

            {/* Loading Overlay */}
            <LoadingOverlay visible={loading} />

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        marginTop: 20,
    },
    search:{
        padding:10,
        color: 'white',
        fontSize:20,
        backgroundColor:'black',
        margin:20,
        borderRadius: 50,
    },
    divider: {
        marginVertical: 12,
    },
    dividerText: {
        fontWeight: "600",
        color: "#666"
    },
    line: {
        flex: 1,
        borderBottomColor: 'gray',
        borderBottomWidth: 2,
        height: 1,
        backgroundColor: "#ccc",
        marginTop: 4
    },
    listContent: {
        marginHorizontal: 16,
    },
});