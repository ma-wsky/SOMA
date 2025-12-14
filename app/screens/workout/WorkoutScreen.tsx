import { Text,TextInput, FlatList, View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import WorkoutItem from "../../components/WorkoutItem";
import { workoutStyles as styles } from "../../styles/workoutStyles";
import Ionicons from "@expo/vector-icons/Ionicons";


const EXAMPLEWORKOUTS = [
    {id:"1", name: "Push"},
    {id:"2", name: "Pull"},
    {id:"3", name: "Legs"},
];

export default function WorkoutScreen() {
    //case insensitiv ?
    const router = useRouter();
    const [filter, setFilter] = useState("");

    const filteredWorkout = EXAMPLEWORKOUTS.filter(workout => {
        return workout.name.toLowerCase().includes(filter.toLowerCase());
    });


    return (
        <View style={styles.container}>

            {/* EmptyWorkout Button */}
            <View style={{marginHorizontal: 20,}}>
                <Pressable
                    onPress={() => {router.push("/screens/workout/ActiveWorkoutScreen")}}
                    style={({ pressed }) => [
                        styles.bigButton,
                        {backgroundColor: pressed ? "#333" : "#000"},
                    ]}
                >
                    <View style={styles.bigButtonTextWrapper}>
                        <Text style={styles.buttonText}>Leeres Training starten</Text>
                        <Ionicons
                            name={"add-outline"}
                            size={24}
                            color="#fff"
                        />
                    </View>
                </Pressable>
            </View>

            {/* Search Bar */}
            <TextInput placeholder={"Training suchen..."}
                       placeholderTextColor='white'
                       value={filter}
                       onChangeText={setFilter}
                       style={styles.search}/>

            {/* Saved Workouts List */}
            <FlatList data={filteredWorkout} keyExtractor={(item) => item.id}
                      renderItem={({ item }) => (<WorkoutItem workout={item}/>)}/>

            {/* create Workout Button */}
            <View style={{marginHorizontal: 20,}}>
                <Pressable
                    onPress={() => {router.push("/screens/workout/EditWorkoutScreen")}}
                    style={({ pressed }) => [
                        styles.bigButton,
                        {backgroundColor: pressed ? "#333" : "#000"},
                    ]}
                >
                    <View style={styles.bigButtonTextWrapper}>
                        <Text style={styles.buttonText}>Training erstellen</Text>
                        <Ionicons
                            name={"add-outline"}
                            size={24}
                            color="#fff"
                        />
                    </View>

                </Pressable>
            </View>
        </View>
    );
}