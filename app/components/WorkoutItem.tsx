import { router } from "expo-router";
import { View,Text, Pressable } from "react-native";
import { workoutStyles as styles } from "../styles/workoutStyles"
import { Colors } from "../styles/theme"


export default function WorkoutItem({workout}: any) {
    return (
        <View style={styles.itemContainer}>

            {/* Name of Workout  */}
            <View>
                <Text style={styles.title}>{workout.name}</Text>
            </View>

            {/* Start Workout Button */}
            <Pressable
                onPress={() => {router.push("/screens/workout/ActiveWorkoutScreen")}}
                style={({ pressed }) => [
                    styles.itemButton,
                    {backgroundColor: pressed ? Colors.secondary : Colors.primary},
                    {borderColor: pressed ? Colors.secondary : Colors.primary}
                ]}
            >
                <Text style={styles.buttonText}>Training starten</Text>
            </Pressable>
        </View>
    );
}