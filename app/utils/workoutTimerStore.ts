type WorkoutTimer = { startTime: number; elapsedTime: number; workoutId?: string } | null;

let workoutTimer: WorkoutTimer = null;

export const setWorkoutTimer = (val: WorkoutTimer) => {
  workoutTimer = val;
};

export const getWorkoutTimer = (): WorkoutTimer => workoutTimer;

export const clearWorkoutTimer = () => {
  workoutTimer = null;
};
