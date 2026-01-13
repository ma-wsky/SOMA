import { useRouter, useLocalSearchParams } from "expo-router";
import { View, Pressable, Text } from 'react-native';
import { Calendar } from "react-native-calendars";
import {Colors} from "../styles/theme";
import { homeStyles as styles } from "../styles/homeStyles";
import Ionicons from "@expo/vector-icons/Ionicons";

//npm install react-native-calendars

export default function Home(){

    const router = useRouter();
    const { activeOverlayWorkout } = useLocalSearchParams<{ activeOverlayWorkout?: string }>();

    let overlay: { id?: string | null; setsCount?: number; elapsed?: number } | null = null;
    if (activeOverlayWorkout) {
        try {
            overlay = JSON.parse(activeOverlayWorkout);
        } catch (e) {
            console.warn('Invalid overlay param', e);
        }
    }

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <View style={{backgroundColor: '#ffffff', flex:1, flexDirection: "column",justifyContent: 'flex-start',}}>
            <View style={{alignItems: "center", marginTop: 160,}}>
                <Text>Hallo, Max Musterman!</Text>
            </View>

            <View style={{marginHorizontal: 40,}}>
                <Calendar
                    onDayPress={(day) => {
                        console.log("Pressed day:", day.dateString);
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

            {/* Active workout overlay (from minimized sheet) */}
            {overlay && (
                <Pressable
                    onPress={() => {
                        // clear param and open active workout
                        router.replace({ pathname: '/(tabs)/HomeScreenProxy' });
                        router.push({ pathname: '/screens/workout/ActiveWorkoutScreen', params: { id: overlay?.id } });
                    }}
                    style={{ position: 'absolute', left: 20, right: 20, bottom: 80, backgroundColor: '#222', padding: 12, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#333' }}
                >
                    <Text style={{ color: '#fff', fontWeight: '600' }}>{overlay.setsCount} Sätze</Text>
                    <Text style={{ color: '#aaa' }}>{formatTime(overlay.elapsed || 0)}</Text>
                </Pressable>
            )}

        </View>

    );
}