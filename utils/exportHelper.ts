
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Workout, ExerciseSet } from '@/types/workoutTypes';

export const exportWorkoutsToPDF = async (workouts: Workout[], date: string) => {
    if (workouts.length === 0) {
        alert("Keine Workouts zum Exportieren vorhanden.");
        return;
    }

    const htmlContent = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; }
          h1 { text-align: center; color: #333; }
          .workout { border: 1px solid #ccc; padding: 15px; margin-bottom: 20px; border-radius: 8px; background-color: #f9f9f9; }
          .workout-header { font-size: 18px; font-weight: bold; margin-bottom: 10px; color: #555; border-bottom: 2px solid #AB8FFF; padding-bottom: 5px; }
          .exercise { margin-bottom: 15px; }
          .exercise-title { font-weight: bold; margin-bottom: 5px; font-size: 16px; }
          table { width: 100%; border-collapse: collapse; margin-top: 5px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #AB8FFF; color: white; }
          tr:nth-child(even) { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <h1>Workout Verlauf - ${new Date(date).toLocaleDateString("de-DE")}</h1>
        
        ${workouts.map(workout => `
          <div class="workout">
            <div class="workout-header">
              ${workout.name || "Unbenanntes Workout"} 
              <span style="font-size: 14px; font-weight: normal; float: right;">
                ${new Date(workout.date).toLocaleTimeString("de-DE", { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            
            ${Object.values(groupSetsByExercise(workout.exerciseSets)).map(group => `
              <div class="exercise">
                <div class="exercise-title">${group.exerciseName}</div>
                <table>
                  <thead>
                    <tr>
                      <th>Satz</th>
                      <th>Gewicht (kg)</th>
                      <th>Wdh.</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${group.sets.map((set, index) => `
                      <tr>
                        <td>${index + 1}</td>
                        <td>${set.weight}</td>
                        <td>${set.reps}</td>
                        <td>${set.isDone ? '✓' : '-'}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            `).join('')}
          </div>
        `).join('')}
      </body>
    </html>
  `;

    try {
        const { uri } = await Print.printToFileAsync({ html: htmlContent });
        await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) {
        console.error("Fehler beim PDF Export:", error);
        alert("Export fehlgeschlagen.");
    }
};

// Helper for grouping sets (duplicate logic from components, but handled here for clean isolation)
const groupSetsByExercise = (sets: ExerciseSet[]) => {
    const grouped: { [key: string]: { exerciseName: string; sets: ExerciseSet[] } } = {};
    sets.forEach((set) => {
        const id = set.exerciseId;
        if (!grouped[id]) {
            grouped[id] = { exerciseName: set.exerciseName || "Unbekannt", sets: [] };
        }
        grouped[id].sets.push(set);
    });
    return grouped;
};
