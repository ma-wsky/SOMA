import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Vibration } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { subscribeToActiveWorkout, getActiveWorkout } from "@/utils/activeWorkoutStore";
import { subscribeToRestTimer } from "@/utils/restTimerStore";
import { playSound } from "@/utils/soundHelper";
import { Colors } from "@/styles/theme";

export const ActiveWorkoutFloatingBar = () => {
    const router = useRouter();
    const pathname = usePathname();
    const [activeWorkout, setActiveWorkoutState] = useState(getActiveWorkout());
    const [elapsedTime, setElapsedTime] = useState(0);
    
    // Rest Timer State
    const [restTimer, setRestTimerState] = useState<{ endTime: number } | null>(null);
    const [restTimeRemaining, setRestTimeRemaining] = useState(0);
    const lastRestTimeRef = useRef<number>(0);

    useEffect(() => {
        const unsubscribe = subscribeToActiveWorkout((workout) => {
            setActiveWorkoutState(workout);
        });
        return unsubscribe;
    }, []);

    useEffect(() => {
        const unsubscribe = subscribeToRestTimer((timer) => {
            setRestTimerState(timer);
        });
        return unsubscribe;
    }, []);

    // Workout Timer Tick
    useEffect(() => {
        if (!activeWorkout?.startTime) {
            setElapsedTime(0);
            return;
        }

        const interval = setInterval(() => {
            const now = Date.now();
            const start = activeWorkout.startTime || now;
            setElapsedTime(Math.floor((now - start) / 1000));
        }, 1000);

        // Initial update
        setElapsedTime(Math.floor((Date.now() - (activeWorkout.startTime || Date.now())) / 1000));

        return () => clearInterval(interval);
    }, [activeWorkout]);

    // Rest Timer Tick & Sound
    useEffect(() => {
        if (!restTimer) {
             setRestTimeRemaining(0);
             return;
        }

        const interval = setInterval(() => {
            const now = Date.now();
            const remain = Math.max(0, Math.ceil((restTimer.endTime - now) / 1000));
            setRestTimeRemaining(remain);

            // Handle Finish (Sound/Vibration)
            // ONLY if we are not on the ActiveScreen (which handles it itself)
            if (remain <= 0 && lastRestTimeRef.current > 0) {
                 if (!pathname.includes('ActiveWorkoutScreen')) {
                     Vibration.vibrate([0, 200, 100, 200]);
                     try {
                         playSound(require('@/assets/sounds/timer.mp3'));
                     } catch (e) {}
                     // Clear timer after notifying? 
                     // Usually we keep it at 0 or clear it
                     require("@/utils/restTimerStore").clearRestTimer();
                 }
            }
            lastRestTimeRef.current = remain;
        }, 1000);

        return () => clearInterval(interval);
    }, [restTimer, pathname]);

    // Hide if no workout active OR if we are currently on the workout screen OR adding an exercise to it
    if (!activeWorkout || pathname.includes('ActiveWorkoutScreen') || pathname.includes('AddExerciseToWorkoutScreen')) {
        return null;
    }

    const handlePress = () => {
        if (!activeWorkout?.id) return;
        router.push({
            pathname: "/screens/workout/ActiveWorkoutScreen",
            params: { id: activeWorkout.id }
        });
    };

    const formatTime = (totalSeconds: number) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Determine what to show: Rest Timer (Priority) or Workout Timer
    const showRestTimer = restTimeRemaining > 0;

    return (
        <Pressable onPress={handlePress} style={[styles.container, showRestTimer && styles.restContainer]}>
            <View style={styles.content}>
                <View>
                    <Text style={[styles.label, showRestTimer && styles.restLabel]}>
                        {showRestTimer ? "Pause läuft" : "Aktives Training"}
                    </Text>
                    <Text style={[styles.timer, showRestTimer && styles.restTimerText]}>
                        {showRestTimer 
                            ? `${formatTime(restTimeRemaining)} Pause` 
                            : `${formatTime(elapsedTime)} min • ${activeWorkout.setsCount || 0} Sätze`
                        }
                    </Text>
                </View>
                <View style={[styles.button, showRestTimer && styles.restButton]}>
                    <Text style={[styles.buttonText, showRestTimer && styles.restButtonText]}>Öffnen</Text>
                </View>
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 90, 
        left: 20,
        right: 20,
        backgroundColor: Colors.primary,
        borderRadius: 12,
        padding: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        zIndex: 9999,
    },
    restContainer: {
        backgroundColor: Colors.secondary, // Or a distinct color for rest
    },
    content: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    label: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
    restLabel: {
        color: '#fff', 
    },
    timer: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        marginTop: 2,
    },
    restTimerText: {
        color: 'rgba(255,255,255,0.95)',
        fontWeight: 'bold',
    },
    button: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    restButton: {
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
    buttonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    restButtonText: {
        color: 'white',
    }
});
