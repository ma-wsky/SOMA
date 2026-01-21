import { View, Text, Pressable, Image, Alert, ScrollView } from "react-native";
import { router, useLocalSearchParams } from "expo-router"
import {TopBar} from "@/components/TopBar";
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import Ionicons from "@expo/vector-icons/Ionicons";
import {auth, db} from "@/firebaseConfig";
import { Exercise } from "@/types/Exercise"
import LoadingOverlay from "@/components/LoadingOverlay";
import { exerciseStyles } from "@/styles/exerciseStyles"
import { ExerciseService } from "@/services/exerciseService"


export default function SingleExerciseInfoScreen() {

    const [loading, setLoading] = useState<boolean>(false);
    const { id } = useLocalSearchParams<{ id: string }>();
    const [exercise, setExercise] = useState<Exercise | null>(null);

    const ADMIN_DEFAULT = require("@/assets/default-exercise-picture/admin.png");
    const USER_DEFAULT = require("@/assets/default-exercise-picture/users.png");

    useEffect(() => {
        if (!id) return;

        const fetchExercise = async () => {
            setLoading(true);

            try {
                const user = auth.currentUser;
                let tempExercise: Exercise | null = null;
                let isGlobal = false;
                let isOwn = false;

                const globalRef = doc(db, "exercises", id);
                const globalSnap = await getDoc(globalRef);
                if (globalSnap.exists()) {
                    isGlobal = true;
                    tempExercise = ({ id: globalSnap.id, ...globalSnap.data() } as Exercise);

                }else if (user){
                    const userRef = doc(db, "users", user.uid, "exercises", id);
                    const userSnap = await getDoc(userRef);

                    if (userSnap.exists()) {
                        isOwn = true;
                        tempExercise = ({ id: userSnap.id, ...userSnap.data() } as Exercise);
                    }
                }

                if (tempExercise && user) {
                    const favRef = doc(db, "users", user.uid, "favorites", id);
                    const favSnap = await getDoc(favRef);

                    setExercise({
                        ...tempExercise,
                        isGlobal: isGlobal,
                        isOwn: isOwn,
                        isFavorite: favSnap.exists(),
                    });
                } else {
                    setExercise(null);
                }

            } catch (e) {
                console.error("Fehler beim Laden der Übung:", e);
                Alert.alert("Fehler", "Übung konnte nicht geladen werden.");

            } finally {
                setLoading(false);
            }

        };
        fetchExercise();
    }, [id]);

    async function handleToggleFavorite() {
        if (!exercise || !auth.currentUser) return;

        try {
            const isNowFavorite = await ExerciseService.toggleFavorite(exercise, auth.currentUser.uid);
            setExercise({ ...exercise, isFavorite: isNowFavorite});
        } catch (e) {
            Alert.alert("Fehler", "Favorit konnte nicht gespeichert werden.");
        }
    }

    if (loading) return <LoadingOverlay visible={true} />;
    if (!exercise) {
        return (
            <View style={exerciseStyles.container}>
                <TopBar leftButtonText="Zurück" titleText="Übung Info" onLeftPress={() => router.back()} />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text>Übung nicht gefunden.</Text>
                </View>
            </View>
        );
    }
    return (
        <View style={exerciseStyles.container}>


            {/* Top Bar */}
            <TopBar leftButtonText={"Zurück"}
                    titleText={"Übung Info"}
                    onLeftPress={() => router.back()}
            ></TopBar>

            {/* Exercise Picture */}
            <View style={exerciseStyles.picWrapper}>
                <Image
                    source={
                        exercise.image
                            ? { uri: exercise.image }
                            : (exercise.isOwn
                                ? USER_DEFAULT
                                : ADMIN_DEFAULT)
                    }
                    style={exerciseStyles.picture}
                />
            </View>

            {/* Exercise name and fav toggle */}
            <View style={exerciseStyles.infoNameFavIconWrapper}>
                <Text style={exerciseStyles.infoName}>{exercise.name}</Text>
                <Pressable
                    onPress={handleToggleFavorite}>
                    <Ionicons
                        name={exercise.isFavorite ? "heart" : "heart-outline"}
                        size={32}
                        color="#555"
                    />
                </Pressable>

            </View>

            {/* muscle groups */}
            <View style={exerciseStyles.infoMuscleWrapper}>
                <Text
                    style={exerciseStyles.infoMuscle}>{exercise.muscleGroup}
                </Text>
            </View>

            {/* Instructions */}
            <View style={exerciseStyles.instructionWrapper}>
                <Text style={exerciseStyles.instructionTitle}>Anleitung</Text>

                <View style={exerciseStyles.instructionBox}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Text style={exerciseStyles.instructionText}>
                            {exercise.instructions}
                        </Text>
                    </ScrollView>
                </View>
            </View>
        </View>
    );
}