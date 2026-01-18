type RestTimer = { timeRemaining: number; isActive: boolean } | null;

let restTimer: RestTimer = null;

export const setRestTimer = (val: RestTimer) => {
  restTimer = val;
};

export const clearRestTimer = () => {
  restTimer = null;
};

export const getRestTimer = (): RestTimer => restTimer;
