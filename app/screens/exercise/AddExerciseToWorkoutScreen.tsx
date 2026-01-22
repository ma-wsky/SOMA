import { router, useLocalSearchParams } from "expo-router";
import { View, TextInput, StyleSheet, Text, Alert, ScrollView, Pressable } from "react-native";
import { useState } from "react";
import { TopBar } from "@/components/TopBar"
import ExerciseList from "@/components/ExerciseList";
import LoadingOverlay from "@/components/LoadingOverlay";
import { useLoadExercises } from "@/hooks/useLoadExercises";
import { Colors } from "@/styles/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { listFilterStore } from "@/utils/store/listFilterStore";
import Ionicons from "@expo/vector-icons/Ionicons";


const CATEGORIES = ["Alle", "Brust", "Rücken", "Beine", "Schultern", "Arme", "Bauch"];


export default function AddExerciseToWorkoutScreen() {

    const [breakTime, setBreakTime] = useState("30");
    const { workoutEditId, returnTo } = useLocalSearchParams<{ workoutEditId?: string; returnTo?: "active"|"edit"; }>();  
    const { exercises, loading } = useLoadExercises();
    const { filter, setFilter, selectedCategory, setSelectedCategory } = listFilterStore();


    const addExercise = (exercise: {id:string; name:string}) => {
        if (!workoutEditId) {
            console.error("workoutEditId ist null");
            Alert.alert("Fehler", "Es konnte kein Trainings-Kontext gefunden werden.");
            return;
        }

        const params = {
            workoutEditId,
            selectedExerciseId: exercise.id,
            selectedExerciseName: exercise.name,
            selectedBreakTime: breakTime,
            _t: Date.now().toString()
        }; 

        if (returnTo === 'active'){
            router.navigate({ pathname: "/screens/workout/ActiveWorkoutScreen", 
                params
            });
        } else if (returnTo === 'edit'){
            router.navigate({ pathname: "/screens/workout/SingleWorkoutInfoScreen", 
                params
            });
        }
    };

    const openInfo = (exercise: {id: string}) => {
        router.push({ pathname: "/screens/exercise/SingleExerciseInfoScreen", 
            params: { id: exercise.id } });
    };

    return (
        <SafeAreaView style={styles.container}>

            {/* Top Bar */}
            <TopBar 
                isSheet={false}
                leftButtonText={"Zurück"}
                titleText={"Übung hinzufügen"}
                onLeftPress={() => router.back()}
            />

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                {/* lupe */}
                <Ionicons name="search" size={20} color={Colors.white} style={styles.searchIcon} />

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
                        <Ionicons name="close-circle" size={20} color={Colors.primary} />
                    </Pressable>
                )}
            </View>

            {/* filter tags */}
            <View style={{  }}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterTagList}
                >
                    {CATEGORIES.map((cat) => (
                        <Pressable
                            key={cat}
                            onPress={() => setSelectedCategory(cat)}
                            style={[
                                styles.filterTag,
                                selectedCategory === cat && styles.filterTagActive
                            ]}
                        >
                            <Text style={[
                                styles.filterTagText,
                                selectedCategory === cat && styles.filterTagTextActive
                            ]}>
                                {cat}
                            </Text>
                        </Pressable>
                    ))}
                </ScrollView>
            </View>

            {/* Break Time Input */}
            <View style={styles.breakTimeContainer}>
                <Text style={styles.breakTimeLabel}>Pausenzeit nach einem Satz (Sekunden)</Text>
                <TextInput
                    value={breakTime}
                    onChangeText={setBreakTime}
                    placeholder="30"
                    placeholderTextColor={Colors.gray}
                    keyboardType="numeric"
                    style={styles.breakTimeInput}
                />
            </View>

            <ExerciseList
                exercises={exercises}
                filter={filter}
                category={selectedCategory}
                showAddButton
                onItemPress={openInfo}
                onAddToWorkout={addExercise}
            />

            {/* Loading Overlay */}
            <LoadingOverlay visible={loading} />

        </SafeAreaView>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        justifyContent: 'flex-start',
    },
    search:{
        padding:10,
        fontSize:20,
        backgroundColor:Colors.black,
        margin:20,
        borderRadius: 50,
    },
    breakTimeContainer: {
        paddingHorizontal: 20,
        paddingBottom: 12,
    },
    breakTimeLabel: {
        color: Colors.black,
        fontSize: 14,
        marginBottom: 6,
    },
    breakTimeInput: {
        backgroundColor: Colors.black,
        color: Colors.white,
        padding: 10,
        borderRadius: 8,
        fontSize: 16,
    },

    // tags
    filterTagList: {
        paddingHorizontal: 20,
        marginBottom: 10,
        alignItems: 'center',
        gap: 10,
    },
    filterTag: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: Colors.black,
    },
    filterTagActive: {
        backgroundColor: Colors.primary,
    },
    filterTagText: {
        color: Colors.white,
        fontWeight: '500',
    },
    filterTagTextActive: {
        fontWeight: 'bold',
    },

    //search bar
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.black,
        borderRadius: 12,
        paddingHorizontal: 12,
        marginHorizontal: 16,
        height: 50,
        marginTop: 20,
        marginBottom: 10,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        color: Colors.white,
        fontSize: 16,
        height: '100%',
    },
    deleteButton: {
        padding: 5,
    },
})