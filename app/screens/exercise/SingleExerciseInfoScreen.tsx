import { View, Text, StyleSheet, Pressable } from "react-native";
import { router, useLocalSearchParams } from "expo-router"
import {TopBar} from "../../components/TopBar";
import { useState, useEffect } from "react";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import Ionicons from "@expo/vector-icons/Ionicons";
import {Colors} from "../../styles/theme";
import {auth, db} from "../../firebaseConfig";
import LoadingOverlay from "../../components/LoadingOverlay";

type Exercise = {
    id: string;
    name: string;
    muscleGroup?: string;
    equipment?: string;
    instructions?: string;
};

export default function SingleExerciseInfoScreen() {

    const [loading,setLoading] = useState<boolean>(false);
    const { id } = useLocalSearchParams<{ id: string }>();
    const [exercise, setExercise] = useState<Exercise | null>(null);
    const [isFavorite, setFavorite] = useState<boolean|null>(null);

    useEffect(() => {
        if (!id) return;
        setLoading(true);

        const fetchExercise = async () => {
            try{
                const globalRef = doc(db, "exercises", id);
                const globalSnap = await getDoc(globalRef);
                if (globalSnap.exists()) {
                    setExercise({ id: globalSnap.id, ...globalSnap.data() } as Exercise);
                    await checkFavorite();
                    return;
                }

                const user = auth.currentUser;
                if (!user) return;

                const userRef = doc(db, "users", user.uid, "exercises", id);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    setExercise({ id: userSnap.id, ...userSnap.data() } as Exercise);
                    await checkFavorite();
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

    const checkFavorite = async ()=> {
        const user = auth.currentUser;
        if (!user) return;
        const favRef = doc(db, "users", user.uid, "favorites", id);
        const favSnap = await getDoc(favRef);
        if (favSnap.exists()){
            setFavorite(true);
        }else {
            setFavorite(false);
        }
    }

    async function toggleFavorite() {
        const user = auth.currentUser;
        if (!user) return;
        if (!exercise) return;

        const ref = doc(
            db,
            "users",
            user.uid,
            "favorites",
            id,
        );

        // toggle favorite in db
        if (isFavorite) {
            await deleteDoc(ref);
            setFavorite(false);
            console.log(exercise.name+": no fav");
        } else {
            await setDoc(ref, {
                name: exercise.name,
                muscleGroup: exercise.muscleGroup,
                equipment: exercise.equipment,
                instructions: exercise.instructions,
            });
            setFavorite(true);
            console.log(exercise.name+": fav");
        }
    }

    if (!exercise) return;

    if (isFavorite === null){
        return (
            <View>
                {/* Loading Overlay */}
                <LoadingOverlay visible={loading} />
            </View>
        );
    }

    return (
        <View style={styles.container}>


            {/* Top Bar */}
            <TopBar leftButtonText={"Zurück"}
                    titleText={"Übung Info"}
                    onLeftPress={() => router.back()}
            ></TopBar>

            {/* Exercise Picture */}
            <View style={styles.picWrapper}>
                <View style={styles.picture}></View>
            </View>

            {/* Exercise name and fav toggle */}
            <View style={styles.nameFav}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Pressable
                    onPress={toggleFavorite}>
                    <Ionicons
                        name={isFavorite ? "heart" : "heart-outline"}
                        size={32}
                        color="#555"
                        style={styles.icon}
                    />
                </Pressable>

            </View>

            {/* muscle groups */}
            <View style={styles.muscleGroupWrapper}>
                <Text style={styles.muscleGroup}>{exercise.muscleGroup}</Text>
            </View>

            {/* Instructions */}
            <View style={styles.instructionWrapper}>
                <Text style={styles.instructionText}>Instructions</Text>
                <Text style={styles.instructionBody}>{exercise.instructions}</Text>
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
    },
    picture: {
        height: 130,
        width: 130,
        borderRadius: 20,
        backgroundColor: Colors.black,
        alignItems: "center",
        justifyContent: "center",
    },
    picWrapper: {
        marginTop: 40,
        alignItems: "center",
    },
    picText: {
        color: "white",
    },
    nameFav: {
        marginTop: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginLeft: 50,
    },
    icon: {
        marginRight: 50,
    },
    exerciseName: {
        fontSize: 24,
        fontWeight: "bold",
    },
    muscleGroup: {
        fontSize: 18,
        fontWeight: "semibold",
    },
    muscleGroupWrapper: {
        marginTop: 15,
        marginLeft: 50,
    },
    instructionText: {
        fontSize: 18,
    },
    instructionBody: {
        marginLeft: 10,
        marginTop: 5,
        fontSize: 18,
    },
    instructionWrapper: {
        marginTop: 15,
        marginLeft: 50,
    },
})