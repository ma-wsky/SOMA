import { useRouter } from "expo-router";
import { View, Pressable, Text } from 'react-native';
import { Calendar } from "react-native-calendars";
import { homeStyles as styles } from "@/styles/homeStyles";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function Home(){

    const router = useRouter();

    return (
        <View style={{backgroundColor: '#ffffff', flex:1, flexDirection: "column",justifyContent: 'flex-start',}}>
            <View style={{alignItems: "center", marginTop: 160,}}>
                <Text>Hallo, Max Musterman!</Text>
            </View>

            <View style={{marginHorizontal: 40,}}>
                <Calendar
                    onDayPress={(day) => {
                         router.push({
                            pathname: "/screens/workout/WorkoutHistoryScreen",
                            params: { date: day.dateString }
                        });
                    }}
                />
            </View>


            <View style={{marginHorizontal: 20, marginTop: 80,}}>
                <Pressable
                    onPress={() => {router.push("/screens/exercise/ExerciseScreen")}}
                    style={({ pressed }) => [
                        styles.bigButton,
                        {backgroundColor: pressed ? "#333" : "#000"},
                    ]}
                >
                    <View style={styles.bigButtonTextWrapper}>
                        <Text style={styles.buttonText}>Übungen</Text>
                        <Ionicons
                            name={"barbell-outline"}
                            size={28}
                            color="#fff"
                        />
                    </View>

                </Pressable>
            </View>

        </View>

    );
}