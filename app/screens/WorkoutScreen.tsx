import { SafeAreaView,Text,TextInput,Button, TouchableOpacity,StyleSheet, FlatList } from "react-native";
import {useRouter, router} from "expo-router";
import {useState} from "react";
import WorkoutItem from "../components/WorkoutItem";


const EXAMPLEWORKOUTS = [
    {id:"1", name: "Push"},
    {id:"2", name: "Beine"},
    {id:"3", name: "Arme"},
    {id:"4", name: "Rücken"},
];

export default function WorkoutScreen() {
    //case insensitiv ?
    const [filter, setFilter] = useState("");

    const filteredWorkout = EXAMPLEWORKOUTS.filter(workout => {
        return workout.name.toLowerCase().includes(filter.toLowerCase());
    });


    return (
        <SafeAreaView style={{flex: 1}}>
            <Button color='purple' title="Leeres Training starten" onPress={()=>{console.log("push Screen WorkoutActivEditScreen")}}/>

            <TextInput placeholder={"Training suchen..."}
                       placeholderTextColor='white'
                       value={filter}
                       onChangeText={setFilter}
                       style={styles.search}/>
            <FlatList data={filteredWorkout} keyExtractor={(item) => item.id}
                      renderItem={({ item }) => (<WorkoutItem workout={item}/>)}/>

            <Button color='purple' title="Training erstellen" onPress={()=> router.push("/screens/WorkoutEditScreen")}/>
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
})