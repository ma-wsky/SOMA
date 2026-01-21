import { View,TextInput,StyleSheet } from "react-native";
import { router } from "expo-router";
import { useState } from 'react';
import LoadingOverlay from "@/components/LoadingOverlay";
import ExerciseList from "@/components/ExerciseList"
import { useLoadExercises } from "@/hooks/useLoadExercises"
import { Colors } from "@/styles/theme";


export default function StatisticScreen() {

    const { exercises, loading } = useLoadExercises();
    const [filter, setFilter] = useState("");

    return (
        <View style={[styles.container, { backgroundColor: Colors.background }]}>

            {/* Search Bar */}
            <TextInput placeholder={"Übung suchen..."}
                       placeholderTextColor={Colors.white}
                       value={filter}
                       onChangeText={setFilter}
                       style={styles.search}/>


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
        color: Colors.white,
        fontSize:20,
        backgroundColor:Colors.black,
        margin:20,
        borderRadius: 50,
    },
    divider: {
        marginVertical: 12,
    },
    dividerText: {
        fontWeight: "600",
        color: Colors.darkGray
    },
    line: {
        flex: 1,
        borderBottomColor: 'gray',
        borderBottomWidth: 2,
        height: 1,
        backgroundColor: Colors.gray,
        marginTop: 4
    },
    listContent: {
        marginHorizontal: 16,
    },
});