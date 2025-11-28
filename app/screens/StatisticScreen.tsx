import { Image,View,Text,TextInput,Button,FlatList, TouchableOpacity,StyleSheet } from "react-native";
import { useState } from 'react';
import {useRouter, router} from "expo-router";
import ExerciseItem from "../components/ExerciseItem";
import {SafeAreaView} from 'react-native-safe-area-context';


//Attributes: Stats??
//Tags -> Enum?
const EXAMPLEEXERCISE = [
    {id:"1", name: "Squat", image: require("../assets/image/Squat.png"), tags:["Großer Brustmuskel","Trizeps","Vorderer Schultermuskel"], guide:"Lorem Ipsum...", favorite: false},
    {id:"2", name: "Pushup", image: require("../assets/image/Squat.png"), tags:["Großer Brustmuskel","Trizeps","Vorderer Schultermuskel"], guide:"Lorem Ipsum...", favorite: false},
    {id:"3", name: "Lat Pulldown (Cable)", image: require("../assets/image/Squat.png"), tags:["Großer Brustmuskel","Trizeps","Vorderer Schultermuskel"], guide:"Lorem Ipsum...", favorite: false},
    {id:"4", name: "Crunch", image: require("../assets/image/Squat.png"), tags:["Großer Brustmuskel","Trizeps","Vorderer Schultermuskel"], guide:"Lorem Ipsum...", favorite: true},
];
export default function StatisticScreen() {
    //case insensitiv ?
    const [filter, setFilter] = useState("");

    const filteredWorkout = EXAMPLEEXERCISE.filter(exercise => {
        return exercise.name.toLowerCase().includes(filter.toLowerCase());
    });


    return (
        <SafeAreaView style={{flex:1}}>
            <Text>Übungsstatistik</Text>

            <TextInput placeholder={"Training suchen..."}
                       placeholderTextColor='white'
                       value={filter}
                       onChangeText={setFilter}
                       style={styles.search}/>

            {/* Filter with tags  & !!!!!!!!!!! //So darf man nicht kommentieren !!!!!!!!!!!!!!!!!!!!!!!!!*/}
            <Text>Filter</Text>

            <View style={{flexDirection: "row"}}>
                <Image source={require("../assets/icons/Heart.png")} />
                <View style={styles.line} />
            </View>

            <FlatList data={filteredWorkout} keyExtractor={(item) => item.id}
                      renderItem={({ item }) => (<ExerciseItem exercise={item}/>)}/>

            <View style={styles.line}/>

            <FlatList data={filteredWorkout} keyExtractor={(item) => item.id}
                      renderItem={({ item }) => (<ExerciseItem exercise={item}/>)}/>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    search:{
        padding:10,
        color: 'white',
        fontSize:20,
        backgroundColor:'black',
        margin:10
    },
    line: {
        flex: 1,
        borderBottomColor: 'gray',
        borderBottomWidth: 1,
        marginVertical: "5%",
    }
})