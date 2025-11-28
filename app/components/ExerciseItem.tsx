import { router } from "expo-router";
import { Image,View,StyleSheet,Text, Button } from "react-native";



export default function ExerciseItem({exercise}: any) {
    return (
        <View style={styles.container}>
            <Image source={exercise.image} style={styles.image}/>
            <View>
                <Text style={styles.title}>{exercise.name}</Text>
                <Text style={styles.text}>{exercise.name}</Text>
            </View>
        </View>
    );
}
//"../assets/icons/Home.png" -> exercise.name

const styles = StyleSheet.create({
    container: {
        padding:12,
        backgroundColor: "black",
        marginVertical: 5,
        marginHorizontal: 10,
        borderRadius: 10,
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
    },
    title: {
        marginHorizontal: 5,
        fontSize: 18,
        color: "white",
    },
    text: {
        marginHorizontal: 5,
        fontSize: 10,
        color: "white",
    },
    image:{
        width: 77,
        height: 77,
    }
})