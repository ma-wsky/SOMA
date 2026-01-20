type RestTimerState = { endTime: number } | null;

let restTimer: RestTimerState = null;
const listeners = new Set<(timer: RestTimerState) => void>();

const notify = () => {
    listeners.forEach(l => l(restTimer));
};

export const subscribeToRestTimer = (listener: (timer: RestTimerState) => void) => {
    listeners.add(listener);
    // Immediately call with current state
    listener(restTimer); 
    return () => { listeners.delete(listener); };
};

export const setRestTimer = (val: any) => {
    // Legacy support or direct set if needed, but prefer startRestTimer
    if (val && val.timeRemaining) {
       // Converting legacy calls to new system is hard without modifying caller
       // So we keep this for compatibility if something else calls it, but we change the implementation
       // actually, only useRestTimer calls this. I will update useRestTimer.
    }
};

export const startRestTimer = (seconds: number) => {
  restTimer = { endTime: Date.now() + seconds * 1000 };
  notify();
};

export const clearRestTimer = () => {
  restTimer = null;
  notify();
};

export const getRestTimer = () => {
  if (!restTimer) return null;
  const now = Date.now();
  const timeRemaining = Math.max(0, Math.ceil((restTimer.endTime - now) / 1000));
  return {
    timeRemaining,
    isActive: timeRemaining > 0
  };
};
