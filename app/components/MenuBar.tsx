import { SafeAreaView,Text, TouchableOpacity,StyleSheet,Image } from "react-native";
import { router } from "expo-router";

//Funktioniert Meh..
//import {SafeAreaView} from 'react-native-safe-area-context';
//npx expo install react-native-safe-area-context

export default function MenuBar(){
    return(
        <SafeAreaView style={styles.container}>
            <TouchableOpacity style={styles.button} onPress={()=>{router.push("/screens/HomeScreen")}}>
                <Image source={require("../assets/icons/Home.png")} style={styles.icon} />
                <Text>Startseite</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={()=>{router.push("/screens/WorkoutScreen")}}>
                <Image source={require("../assets/icons/Home.png")} style={styles.icon} />
                <Text>Training</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={()=>{router.push("/screens/StatisticScreen")}}>
                <Image source={require("../assets/icons/Home.png")} style={styles.icon} />
                <Text>Statistik</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={()=>{router.push("/screens/UserScreen")}}>
                <Image source={require("../assets/icons/Home.png")} style={styles.icon} />
                <Text>Benutzer</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 60,
        backgroundColor: "#000000",
        flexDirection: "row",
        justifyContent: "space-evenly",
        alignItems: "center",
    },
    button:{
        backgroundColor: "purple",
        alignItems: "center",
        justifyContent: "center",
    },
    icon:{
        width: 24,
        height: 24,
        marginBottom: 2
    }
});