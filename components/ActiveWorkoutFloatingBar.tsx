import React, {useEffect, useRef, useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {usePathname, useRouter} from 'expo-router';
import {getActiveWorkout, subscribeToActiveWorkout} from "@/utils/store/activeWorkoutStore";
import {subscribeToRestTimer} from "@/utils/store/restTimerStore";
import {playSound} from "@/utils/helper/soundHelper";
import {vibrate} from "@/utils/helper/vibrationHelper";
import {Colors} from "@/styles/theme";
import {formatTimeShort} from "@/utils/helper/formatTimeHelper";

export const ActiveWorkoutFloatingBar = () => {
    const router = useRouter();
    const pathname = usePathname();
    const [activeWorkout, setActiveWorkoutState] = useState(getActiveWorkout());
    const [elapsedTime, setElapsedTime] = useState(0);
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

    // workout timer tick
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

        setElapsedTime(Math.floor((Date.now() - (activeWorkout.startTime || Date.now())) / 1000));

        return () => clearInterval(interval);
    }, [activeWorkout]);

    // pause timer tick + sound
    useEffect(() => {
        if (!restTimer) {
            setRestTimeRemaining(0);
            return;
        }

        const interval = setInterval(() => {
            const now = Date.now();
            const remain = Math.max(0, Math.ceil((restTimer.endTime - now) / 1000));
            setRestTimeRemaining(remain);

            if (remain <= 0 && lastRestTimeRef.current > 0) {
                if (!pathname.includes('ActiveWorkoutScreen')) {
                    vibrate([0, 200, 100, 200]);
                    try {
                        playSound(require('@/assets/sounds/timer.mp3'));
                    } catch (e) {
                    }
                    require("@/utils/store/restTimerStore").clearRestTimer();
                }
            }
            lastRestTimeRef.current = remain;
        }, 1000);

        return () => clearInterval(interval);
    }, [restTimer, pathname]);

    if (!activeWorkout || pathname.includes('ActiveWorkoutScreen') || pathname.includes('AddExerciseToWorkoutScreen')) {
        return null;
    }

    const handlePress = () => {
        if (!activeWorkout?.id) return;
        router.push({
            pathname: "/screens/workout/ActiveWorkoutScreen",
            params: {id: activeWorkout.id}
        });
    };

    const showRestTimer = restTimeRemaining > 0;

    return (
        <Pressable onPress={handlePress} style={[styles.container, showRestTimer && styles.restContainer]}>
            <View style={styles.content}>
                <View>
                    {/* pause timer */}
                    <Text style={[styles.label, showRestTimer && styles.restLabel]}>
                        {showRestTimer ? "Pause läuft" : "Aktives Training"}
                    </Text>
                    <Text style={[styles.timer, showRestTimer && styles.restTimerText]}>
                        {showRestTimer
                            ? `${formatTimeShort(restTimeRemaining)} Pause`
                            : `${formatTimeShort(elapsedTime)} min • ${activeWorkout.setsCount || 0} Sätze`
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
        bottom: 110,
        left: 20,
        right: 20,
        backgroundColor: Colors.primary,
        borderRadius: 12,
        padding: 12,
        shadowColor: Colors.black,
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        zIndex: 9999,
    },
    restContainer: {
        backgroundColor: Colors.secondary,
    },
    content: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    label: {
        color: Colors.white,
        fontWeight: 'bold',
        fontSize: 14,
    },
    restLabel: {
        color: Colors.white,
    },
    timer: {
        color: Colors.background,
        fontSize: 12,
        marginTop: 2,
    },
    restTimerText: {
        color: Colors.background,
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
        color: Colors.white,
        fontSize: 12,
        fontWeight: '600',
    },
    restButtonText: {
        color: Colors.white,
    }
});
