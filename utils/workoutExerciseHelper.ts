// Helper functions for workout and exercise operations
// Reusable across ActiveWorkoutScreen and SingleWorkoutInfoScreen

import type { ExerciseSet } from "@/types/workoutTypes";

/**
 * Groups exercise sets by their exerciseId
 * Used for rendering sets organized by exercise
 */
export const groupSetsByExercise = (sets: ExerciseSet[]) => {
  const map: { [exerciseId: string]: ExerciseSet[] } = {};
  sets.forEach((set) => {
    if (!map[set.exerciseId]) {
      map[set.exerciseId] = [];
    }
    map[set.exerciseId].push(set);
  });
  return map;
};

/**
 * Formats seconds to HH:MM:SS format
 * Used for displaying workout duration and rest timer
 */
export const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

/**
 * Formats a date string (ISO format) to a readable format
 * Optional: used for displaying workout date
 */
export const formatDate = (dateString?: string) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return date.toLocaleDateString("de-DE", {
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};
