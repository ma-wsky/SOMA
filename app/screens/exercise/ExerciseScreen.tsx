import { router } from "expo-router";
import { View, TextInput, ScrollView, Pressable, Text } from "react-native";
import { TopBar } from "@/components/TopBar"
import ExerciseList from "@/components/ExerciseList";
import LoadingOverlay from "@/components/LoadingOverlay";
import { useLoadExercises } from "@/hooks/useLoadExercises";
import { exerciseStyles } from "@/styles/exerciseStyles";
import { SafeAreaView } from "react-native-safe-area-context";
import { listFilterStore } from "@/utils/store/listFilterStore";


const CATEGORIES = ["Alle", "Brust", "Rücken", "Beine", "Schultern", "Arme", "Bauch"];

export default function ExerciseScreen() {

    const { exercises, loading } = useLoadExercises();
    const { filter, setFilter, selectedCategory, setSelectedCategory } = listFilterStore();


    return (
        <SafeAreaView style={[exerciseStyles.container]}>

            {/* Top Bar */}
            <TopBar leftButtonText={"Zurück"}
                    isSheet={false}
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
                showAddButton={false}

            />

            {/* Loading Overlay */}
            <LoadingOverlay visible={loading} />

        </SafeAreaView>
    );
}