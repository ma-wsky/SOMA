type RestTimerState = { endTime: number } | null;

let restTimer: RestTimerState = null;
const listeners = new Set<(timer: RestTimerState) => void>();

const notify = () => {
    listeners.forEach(l => l(restTimer));
};

export const subscribeToRestTimer = (listener: (timer: RestTimerState) => void) => {
    listeners.add(listener);
    listener(restTimer); 
    return () => { listeners.delete(listener); };
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
