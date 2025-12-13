import { View,Text, TouchableOpacity,StyleSheet } from "react-native";
import {useRouter, router} from "expo-router";


export default function WorkoutEditScreen() {
    return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', borderColor: 'blue', borderWidth: 2}}>
            <Text>
                Edit Workout Screen
            </Text>
        </View>
    );
}