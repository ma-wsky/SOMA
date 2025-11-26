import {useRouter, router} from "expo-router";
import { View, Button, TextInput, Text } from 'react-native';
import {useState} from "react";
import { Calendar } from "react-native-calendars";
//npm install react-native-calendars

export default function Home(){
    return (
        <View style={{backgroundColor: '#ffffff', flex:1 , justifyContent: 'center', alignItems: 'center'}}>
            <Text>Hallo, Max Musterman!</Text>
            <Calendar
                onDayPress={(day) => {
                    console.log("Pressed day:", day.dateString);
                }}
            />
        </View>

    );
    /*(
        <View style={{
            flex:1,
            justifyContent: 'center',
            alignItems: 'center'}}>
            <View style={{marginBottom: 20, borderWidth: 2, borderColor: 'grey'}}>
            </View>

        </View>
    );

     */
}