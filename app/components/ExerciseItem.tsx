import { router } from "expo-router";
import { Image,View,StyleSheet,Text, Button } from "react-native";



export default function ExerciseItem({exercise}: any) {
    return (
        <View style={styles.container}>
            <Image source={require(exercise.image)}/>
            <View>
                <Text style={styles.title}>{exercise.name}</Text>
                <Text style={styles.text}>{exercise.name}</Text>
            </View>
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
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    title: {
        fontSize: 18,
        color: "white",
    },
    text: {
        fontSize: 10,
        color: "white",
    }
})