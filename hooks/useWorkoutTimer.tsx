// Custom hook for managing workout timer and rest timer
// Handles elapsed time tracking and rest timer during workouts

import { useState, useEffect, useRef } from "react";
import { Vibration } from "react-native";

export const useWorkoutTimer = (workoutId?: string | null) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize timer and restore previous elapsed time if resuming
  useEffect(() => {
    const savedTimer = require("@/utils/workoutTimerStore").getWorkoutTimer();
    if (savedTimer && workoutId === savedTimer?.workoutId) {
      const elapsed = Math.floor((Date.now() - savedTimer.startTime) / 1000);
      setElapsedTime(Math.max(0, elapsed));
    }

    timerRef.current = setInterval(() => {
      setElapsedTime((prev) => {
        const newVal = prev + 1;
        // Update global store
        if (workoutId) {
          require("@/utils/workoutTimerStore").setWorkoutTimer({
            startTime: Date.now() - newVal * 1000,
            elapsedTime: newVal,
            workoutId: workoutId,
          });
        }
        return newVal;
      });
    }, 1000) as unknown as NodeJS.Timeout;

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [workoutId]);

  return {
    elapsedTime,
    timerRef,
  };
};

import { playSound } from "@/utils/soundHelper";

export const useRestTimer = () => {
  const [restTimeRemaining, setRestTimeRemaining] = useState(0);
  const restTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startLocalTick = () => {
      if (restTimerRef.current) clearInterval(restTimerRef.current);
      
      const tick = () => {
          const status = require("@/utils/restTimerStore").getRestTimer();
          if (status && status.isActive) {
              setRestTimeRemaining(status.timeRemaining);
          } else {
             // Timer finished or cleared
             if (status && status.timeRemaining <= 0) {
                 Vibration.vibrate([0, 200, 100, 200]);
                 try {
                     playSound(require('@/assets/sounds/timer.mp3'));
                 } catch (e) {
                 }
             }
             stopRestTimer();
          }
      }

      tick(); // Immediate update
      restTimerRef.current = setInterval(tick, 1000) as unknown as NodeJS.Timeout;
  };

  // Resume timer from store on mount
  useEffect(() => {
    const saved = require("@/utils/restTimerStore").getRestTimer();
    if (saved && saved.isActive) {
        setRestTimeRemaining(saved.timeRemaining);
        startLocalTick();
    }
    return () => {
        if (restTimerRef.current) clearInterval(restTimerRef.current);
    };
  }, []);

  const startRestTimer = (seconds: number) => {
    require("@/utils/restTimerStore").startRestTimer(seconds);
    setRestTimeRemaining(seconds);
    startLocalTick();
  };

  const stopRestTimer = () => {
    if (restTimerRef.current) clearInterval(restTimerRef.current);
    restTimerRef.current = null;
    require("@/utils/restTimerStore").clearRestTimer();
    setRestTimeRemaining(0);
  };

  return {
    restTimeRemaining,
    restTimerRef,
    startRestTimer,
    stopRestTimer,
  };
};
