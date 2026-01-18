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

export const useRestTimer = () => {
  const [restTimeRemaining, setRestTimeRemaining] = useState(0);
  const restTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startRestTimer = (seconds: number) => {
    setRestTimeRemaining(seconds);
    require("@/utils/restTimerStore").setRestTimer({ timeRemaining: seconds, isActive: true });

    if (restTimerRef.current) clearInterval(restTimerRef.current);

    restTimerRef.current = setInterval(() => {
      setRestTimeRemaining((prev) => {
        const newVal = prev <= 1 ? 0 : prev - 1;
        require("@/utils/restTimerStore").setRestTimer({ timeRemaining: newVal, isActive: newVal > 0 });

        if (newVal <= 0) {
          if (restTimerRef.current) clearInterval(restTimerRef.current);
          Vibration.vibrate([0, 200, 100, 200]);
        }
        return newVal;
      });
    }, 1000) as unknown as NodeJS.Timeout;
  };

  const stopRestTimer = () => {
    if (restTimerRef.current) clearInterval(restTimerRef.current);
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
