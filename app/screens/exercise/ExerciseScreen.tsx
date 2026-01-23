import {router} from "expo-router";
import {Pressable, ScrollView, Text, TextInput, View} from "react-native";
import {TopBar} from "@/components/TopBar"
import ExerciseList from "@/components/ExerciseList";
import LoadingOverlay from "@/components/LoadingOverlay";
import {useLoadExercises} from "@/hooks/useLoadExercises";
import {exerciseStyles} from "@/styles/exerciseStyles";
import {SafeAreaView} from "react-native-safe-area-context";
import {listFilterStore} from "@/utils/store/listFilterStore";
import Ionicons from "@expo/vector-icons/Ionicons";
import {Colors} from "@/styles/theme";


const CATEGORIES = ["Alle", "Brust", "Rücken", "Beine", "Schultern", "Arme", "Bauch"];

export default function ExerciseScreen() {

    const {exercises, loading} = useLoadExercises();
    const {filter, setFilter, selectedCategory, setSelectedCategory} = listFilterStore();


    return (
        <SafeAreaView style={[exerciseStyles.container]}>

            {/* Top Bar */}
            <TopBar leftButtonText={"Zurück"}
                    isSheet={false}
                    titleText={"Übungen"}
                    rightButtonText={"Erstellen"}
                    onLeftPress={() => router.push("/(tabs)/HomeScreenProxy")}
                    onRightPress={() => router.push("./CreateExerciseScreen")}
            />

            {/* Search Bar */}
            <View style={exerciseStyles.searchContainer}>
                {/* lupe */}
                <Ionicons name="search" size={20} color={Colors.white} style={exerciseStyles.searchIcon}/>

                <TextInput
                    placeholder={"Übung suchen..."}
                    placeholderTextColor='rgba(255,255,255,0.7)'
                    value={filter}
                    onChangeText={setFilter}
                    style={exerciseStyles.searchInput}
                />

                {/* delete */}
                {filter !== "" && (
                    <Pressable onPress={() => setFilter("")} style={exerciseStyles.deleteButton}>
                        <Ionicons name="close-circle" size={20} color={Colors.primary}/>
                    </Pressable>
                )}
            </View>

            {/* filter tags list*/}
            <View style={{}}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={exerciseStyles.filterTagList}
                >
                    {CATEGORIES.map((cat) => (
                        // tag
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

            {/* Übungen */}
            <ExerciseList
                exercises={exercises}
                filter={filter}
                category={selectedCategory}
                onItemPress={(exercise) => router.push({
                    pathname: "/screens/exercise/SingleExerciseInfoScreen",
                    params: {id: exercise.id}
                })}
                showAddButton={false}

            />

            {/* Loading Overlay */}
            <LoadingOverlay visible={loading}/>

        </SafeAreaView>
    );
}