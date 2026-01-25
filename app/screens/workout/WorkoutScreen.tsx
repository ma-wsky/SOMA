import {Pressable, Text, TextInput, View} from "react-native";
import {useRouter} from "expo-router";
import {useCallback, useState} from "react";
import {useFocusEffect} from "@react-navigation/native";
import WorkoutList from "@/components/WorkoutList";
import {workoutStyles as styles} from "@/styles/workoutStyles";
import Ionicons from "@expo/vector-icons/Ionicons";
import {useLoadWorkouts} from "@/hooks/useLoadWorkouts";
import LoadingOverlay from "@/components/LoadingOverlay";
import {deleteDoc, doc} from "firebase/firestore";
import {auth, db} from "@/firebaseConfig";
import {showAlert} from "@/utils/helper/alertHelper";
import {Colors} from "@/styles/theme";
import {SafeAreaView} from "react-native-safe-area-context";
import {getActiveWorkout} from "@/utils/store/activeWorkoutStore"

export default function WorkoutScreen() {
    const router = useRouter();
    const [filter, setFilter] = useState("");
    const [loading, setLoading] = useState(false);
    const {workouts, loading: workoutsLoading, refetch} = useLoadWorkouts();

    //Handle focus
    useFocusEffect(
        useCallback(() => {
            try {
                const active = getActiveWorkout();
                if (active?.id) {
                    router.push({pathname: '/screens/workout/ActiveWorkoutScreen', params: {id: active.id}});
                }
            } catch (e) {
                console.warn('Error checking active workout on focus', e);
            }
        }, [])
    );

    //Handle delete workout
    const handleDeleteWorkout = async (workoutId: string) => {
        setLoading(true);
        try {
            const user = auth.currentUser;
            if (!user) {
                showAlert("Fehler", "Sie müssen angemeldet sein.");
                return;
            }

            const workoutRef = doc(db, "users", user.uid, "workouts", workoutId);
            await deleteDoc(workoutRef);

            showAlert("Erfolg", "Training gelöscht");
            refetch?.();
        } catch (e) {
            console.error("Fehler beim Löschen:", e);
            showAlert("Fehler", "Training konnte nicht gelöscht werden.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container]}>

            {/* leeres workout starten button*/}
            <View style={{marginHorizontal: 20, marginTop: 20,}}>
                <Pressable
                    onPress={() => {
                        router.push("/screens/workout/ActiveWorkoutScreen");
                    }}
                    style={({pressed}) => [
                        styles.bigButton,
                        {backgroundColor: pressed ? Colors.darkGray : Colors.black},
                    ]}
                >
                    <View style={styles.bigButtonTextWrapper}>
                        <Text style={styles.buttonTitle}>Leeres Training starten</Text>
                        <Ionicons name={"add-outline"}
                                size={styles.itemTitle.fontSize}
                                color={styles.itemTitle.color}/>
                    </View>
                </Pressable>
            </View>

            {/* search bar */}
            <View style={styles.searchContainer}>
                {/* lupe */}
                <Ionicons name="search" size={20} color={Colors.white} style={styles.searchIcon}/>

                <TextInput
                    placeholder={"Übung suchen..."}
                    placeholderTextColor='rgba(255,255,255,0.7)'
                    value={filter}
                    onChangeText={setFilter}
                    style={styles.searchInput}
                />

                {/* delete */}
                {filter !== "" && (
                    <Pressable onPress={() => setFilter("")} style={styles.deleteButton}>
                        <Ionicons name="close-circle" size={20} color={Colors.primary}/>
                    </Pressable>
                )}
            </View>

            {/* übungen */}
            <WorkoutList
                workouts={workouts}
                filter={filter}
                onItemPress={(workout) =>
                    router.push({
                        pathname: "/screens/workout/SingleWorkoutInfoScreen",
                        params: {id: workout.id},
                    })
                }
                onDelete={handleDeleteWorkout}
            />

            {/* create workout button */}
            <View style={{marginHorizontal: 20, marginTop: 20}}>
                <Pressable
                    onPress={() => {
                        router.push({
                            pathname: "/screens/workout/SingleWorkoutInfoScreen",
                            params: {workoutEditId: `temp_${Date.now()}`},
                        });
                    }}
                    style={({pressed}) => [
                        styles.bigButton,
                        {backgroundColor: pressed ? Colors.darkGray : Colors.black},
                    ]}
                >
                    <View style={styles.bigButtonTextWrapper}>
                        <Text style={styles.buttonTitle}>Training erstellen</Text>
                        <Ionicons name={"add-outline"}
                                size={styles.itemTitle.fontSize}
                                color={styles.itemTitle.color}
                        />
                    </View>
                </Pressable>
            </View>

            {/* loading overlay */}
            <LoadingOverlay visible={loading || workoutsLoading}/>

        </SafeAreaView>
    );
}
