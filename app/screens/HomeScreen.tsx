import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { useEffect, useState, useCallback } from 'react';
import { View, Pressable, Text, Vibration } from 'react-native';
import { clearActiveWorkout } from '@/utils/activeWorkoutStore';
import { Calendar } from "react-native-calendars";
import { homeStyles as styles } from "@/styles/homeStyles";
import Ionicons from "@expo/vector-icons/Ionicons";
import { playSound } from "@/utils/soundHelper";


export default function Home(){

    const router = useRouter();
    const { activeOverlayWorkout } = useLocalSearchParams<{ activeOverlayWorkout?: string }>();

    const [overlayObj, setOverlayObj] = useState<{ id?: string | null; setsCount?: number; startTime?: number; elapsed?: number } | null>(null);
    const [displayElapsed, setDisplayElapsed] = useState<number>(0);
    const [restTimer, setRestTimer] = useState<{ timeRemaining: number; isActive: boolean } | null>(null);

    useEffect(() => {
        if (!activeOverlayWorkout) {
            setOverlayObj(null);
            setDisplayElapsed(0);
            return;
        }
        try {
            const parsed = JSON.parse(activeOverlayWorkout);
            setOverlayObj(parsed);
            if (parsed.startTime) {
                const tick = () => setDisplayElapsed(Math.floor((Date.now() - parsed.startTime)/1000));
                tick();
                const t = setInterval(tick, 1000);
                return () => clearInterval(t);
            } else {
                setDisplayElapsed(parsed.elapsed ?? 0);
            }
        } catch (e) {
            console.warn('Invalid overlay param', e);
            setOverlayObj(null);
            setDisplayElapsed(0);
        }
    }, [activeOverlayWorkout]);

    // Rest Timer polling
    useFocusEffect(
        useCallback(() => {
            const checkRestTimer = () => {
                const timer = require("@/utils/restTimerStore").getRestTimer();
                setRestTimer(timer);

                // Check if timer finished just now (triggered by this poll)
                // Note: The timer store doesn't automatically clear itself, hooks do that.
                // We need to coordinate to avoid double firing.
                // Since this view is active when the workout screen is NOT, we can take responsibility if needed.
                if (timer && timer.timeRemaining <= 0) {
                     Vibration.vibrate([0, 200, 100, 200]);
                     try {
                         playSound(require('@/assets/sounds/timer.mp3'));
                     } catch (e) {}
                     require("@/utils/restTimerStore").clearRestTimer();
                     setRestTimer(null);
                }
            };
            
            checkRestTimer();
            const interval = setInterval(checkRestTimer, 500);
            return () => clearInterval(interval);
        }, [])
    );

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
            {overlayObj && (
                <Pressable
                    onPress={() => {
                        // clear param and open active workout
                        clearActiveWorkout();
                        router.replace({ pathname: '/(tabs)/HomeScreenProxy' });
                        router.push({ pathname: '/screens/workout/ActiveWorkoutScreen', params: { id: overlayObj?.id } });
                    }}
                    style={{ position: 'absolute', left: 20, right: 20, bottom: 80, backgroundColor: '#222', padding: 12, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#333' }}
                >
                    <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: (restTimer && restTimer.isActive) ? 4 : 0 }}>
                            <Text style={{ color: '#fff', fontWeight: '600' }}>{overlayObj.setsCount} Sätze</Text>
                            <Text style={{ color: '#aaa' }}>{formatTime(displayElapsed)}</Text>
                        </View>
                        {restTimer && restTimer.isActive && (
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={{ color: '#ff6b6b', fontWeight: '600', marginRight: 8 }}>⏱ Pause</Text>
                                <Text style={{ color: '#ff6b6b', fontSize: 16, fontWeight: 'bold' }}>
                                    {Math.floor(restTimer.timeRemaining / 60)}:{(restTimer.timeRemaining % 60).toString().padStart(2, '0')}
                                </Text>
                            </View>
                        )}
                    </View>
                </Pressable>
            )}

        </View>

    );
}