import { router } from "expo-router";
import { View,StyleSheet,Text, Button } from "react-native";



export default function WorkoutItem({workout}: any) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{workout.name}</Text>
            <Button color='purple'
                    title="Training starten"
                    onPress={() => {router.push("/screens/workout/WorkoutEditScreen")}}

            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding:12,
        backgroundColor: "black",
        marginVertical: 5,
        marginHorizontal: 10,
        borderRadius: 5,
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
    },
    title: {
        fontSize: 18,
        color: "white",
    }
})
