import { router, useLocalSearchParams } from "expo-router";
import { View, TextInput, ScrollView, Pressable, Text } from "react-native";
import { useState } from "react";
import { TopBar } from "@/components/TopBar"
import ExerciseList from "@/components/ExerciseList";
import LoadingOverlay from "@/components/LoadingOverlay";
import { useLoadExercises } from "@/hooks/useLoadExercises";
import { exerciseStyles } from "@/styles/exerciseStyles";

const CATEGORIES = ["Alle", "Brust", "Rücken", "Beine", "Schultern", "Arme", "Bauch"];

export default function ExerciseScreen() {

    const [filter, setFilter] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("Alle");
    const { exercises, loading } = useLoadExercises();

    const { mode } = useLocalSearchParams<{ mode?: string }>();
    const isSelectionMode = mode === "select";

    const handleAddExercise = (exercise: any) => {
        router.replace({
            pathname: "/screens/workoutRewrite/CreateTemplateScreen",
            params: {
                selectedExId: exercise.id,
                selectedExName: exercise.name,
                selectedExImage: exercise.image,
            }
        });
    };

    return (
        <View style={exerciseStyles.container}>

            {/* Top Bar */}
            <TopBar leftButtonText={"Zurück"}
                    titleText={"Übungen"}
                    rightButtonText={"Erstellen"}
                    onLeftPress={() => router.push("/(tabs)/HomeScreenProxy")}
                    onRightPress={() => router.push("./CreateExerciseScreen")}
            ></TopBar>

            {/* Search Bar */}
            <TextInput placeholder={"Übung suchen..."}
                       placeholderTextColor='white'
                       value={filter}
                       onChangeText={setFilter}
                       style={exerciseStyles.searchBar}
            />

            {/* filter tags */}
            <View style={{  }}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={exerciseStyles.filterTagList}
                >
                    {CATEGORIES.map((cat) => (
                        <Pressable
                            key={cat}
                            onPress={() => setSelectedCategory(cat)}
                            style={[
                                exerciseStyles.filterTag,
                                selectedCategory === cat && exerciseStyles.filterTagActive
                            ]}
                        >
                            <Text style={[
                                exerciseStyles.filterTagText,
                                selectedCategory === cat && exerciseStyles.filterTagTextActive
                            ]}>
                                {cat}
                            </Text>
                        </Pressable>
                    ))}
                </ScrollView>
            </View>

            <ExerciseList
                exercises={exercises}
                filter={filter}
                category={selectedCategory}
                onItemPress={(exercise) => router.push({
                    pathname: "/screens/exercise/SingleExerciseInfoScreen",
                    params: { id: exercise.id }
                })}
                showAddIcon={isSelectionMode}
                onAddPress={handleAddExercise}
            />

            {/* Loading Overlay */}
            <LoadingOverlay visible={loading} />

        </View>
    );
}