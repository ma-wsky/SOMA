import { useState, useEffect, useRef } from "react";

export const useWorkoutTimer = (workoutId?: string | null) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);


  useEffect(() => {
    const savedTimer = require("@/utils/store/workoutTimerStore").getWorkoutTimer();
    if (savedTimer && workoutId === savedTimer?.workoutId) {
      const elapsed = Math.floor((Date.now() - savedTimer.startTime) / 1000);
      setElapsedTime(Math.max(0, elapsed));
    }

    timerRef.current = setInterval(() => {
      setElapsedTime((prev) => {
        const newVal = prev + 1;
        if (workoutId) {
          require("@/utils/store/workoutTimerStore").setWorkoutTimer({
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

import { playSound } from "@/utils/helper/soundHelper";
import { vibrate } from "@/utils/helper/vibrationHelper";

export const useRestTimer = () => {
  const [restTimeRemaining, setRestTimeRemaining] = useState(0);
  const restTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startLocalTick = () => {
      if (restTimerRef.current) clearInterval(restTimerRef.current);
      
      const tick = () => {
          const status = require("@/utils/store/restTimerStore").getRestTimer();
          if (status && status.isActive) {
              setRestTimeRemaining(status.timeRemaining);
          } else {
            if (status && status.timeRemaining <= 0) {
              vibrate([0, 200, 100, 200]);
              try {
                playSound(require('@/assets/sounds/timer.mp3'));
              } catch (e) {}
            }
            stopRestTimer();
          }
      }

      tick();
      restTimerRef.current = setInterval(tick, 1000) as unknown as NodeJS.Timeout;
  };

  //Resume timer
  useEffect(() => {
    const saved = require("@/utils/store/restTimerStore").getRestTimer();
    if (saved && saved.isActive) {
        setRestTimeRemaining(saved.timeRemaining);
        startLocalTick();
    }
    return () => {
        if (restTimerRef.current) clearInterval(restTimerRef.current);
    };
  }, []);


  const startRestTimer = (seconds: number) => {
    require("@/utils/store/restTimerStore").startRestTimer(seconds);
    setRestTimeRemaining(seconds);
    startLocalTick();
  };

  const stopRestTimer = () => {
    if (restTimerRef.current) clearInterval(restTimerRef.current);
    restTimerRef.current = null;
    require("@/utils/store/restTimerStore").clearRestTimer();
    setRestTimeRemaining(0);
  };

  return {
    restTimeRemaining,
    restTimerRef,
    startRestTimer,
    stopRestTimer,
  };
};
