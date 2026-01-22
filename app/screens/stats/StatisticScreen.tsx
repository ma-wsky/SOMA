import { View,TextInput,Text, ScrollView, Pressable } from "react-native";
import { router, useFocusEffect } from "expo-router";
import {useCallback, useState } from 'react';
import LoadingOverlay from "@/components/LoadingOverlay";
import ExerciseList from "@/components/ExerciseList"
import { useLoadExercises } from "@/hooks/useLoadExercises"
import { Colors } from "@/styles/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { statStyles } from "@/styles/statStyles";
import { listFilterStore } from "@/utils/store/listFilterStore";
import Ionicons from "@expo/vector-icons/Ionicons";


const CATEGORIES = ["Alle", "Brust", "Rücken", "Beine", "Schultern", "Arme", "Bauch"];


export default function StatisticScreen() {

    const { exercises, loading } = useLoadExercises();
    const { filter, setFilter, selectedCategory, setSelectedCategory } = listFilterStore();


    return (
        <SafeAreaView style={[statStyles.container]}>

            {/* Search Bar */}
            <View style={statStyles.searchContainer}>
                {/* lupe */}
                <Ionicons name="search" size={20} color={Colors.white} style={statStyles.searchIcon} />

                <TextInput
                    placeholder={"Übung suchen..."}
                    placeholderTextColor='rgba(255,255,255,0.7)'
                    value={filter}
                    onChangeText={setFilter}
                    style={statStyles.searchInput}
                />

                {/* delete */}
                {filter !== "" && (
                    <Pressable onPress={() => setFilter("")} style={statStyles.deleteButton}>
                        <Ionicons name="close-circle" size={20} color={Colors.primary} />
                    </Pressable>
                )}
            </View>

            {/* filter tags */}
            <View style={{  }}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={statStyles.filterTagList}
                >
                    {CATEGORIES.map((cat) => (
                        <Pressable
                            key={cat}
                            onPress={() => setSelectedCategory(cat)}
                            style={[
                                statStyles.filterTag,
                                selectedCategory === cat && statStyles.filterTagActive
                            ]}
                        >
                            <Text style={[
                                statStyles.filterTagText,
                                selectedCategory === cat && statStyles.filterTagTextActive
                            ]}>
                                {cat}
                            </Text>
                        </Pressable>
                    ))}
                </ScrollView>
            </View>


            {/* Exercise List with favorites and regular */}
            <ExerciseList
                exercises={exercises}
                filter={filter}
                category={selectedCategory}
                onItemPress={(exercise) =>
                    router.push({
                        pathname: "/screens/stats/SingleExerciseStatisticScreen",
                        params: { id: exercise.id }
                    })
                }
            />

            {/* Loading Overlay */}
            <LoadingOverlay visible={loading} />

        </SafeAreaView>
    );
}