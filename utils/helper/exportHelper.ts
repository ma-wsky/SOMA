import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Workout, ExerciseSet } from '@/types/workoutTypes';
import { Exercise } from '@/types/Exercise';
import { Alert } from "react-native";
import { Colors } from '@/styles/theme';

export const exportWorkoutsToPDF = async (workouts: Workout[], date: string) => {
    if (workouts.length === 0) {
        Alert.alert("Fehler", "Keine Workouts zum Exportieren vorhanden.");
        return;
    }

    const htmlContent = `
    <html lang="">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; }
          h1 { text-align: center; color: ${Colors.black}; }
          .workout { border: 1px solid ${Colors.gray}; padding: 15px; margin-bottom: 20px; border-radius: 8px; background-color:${Colors.white}; }
          .workout-header { font-size: 18px; font-weight: bold; margin-bottom: 10px; color: ${Colors.darkGray}; border-bottom: 2px solid ${Colors.primary}; padding-bottom: 5px; }
          .exercise { margin-bottom: 15px; }
          .exercise-title { font-weight: bold; margin-bottom: 5px; font-size: 16px; }
          table { width: 100%; border-collapse: collapse; margin-top: 5px; }
          th, td { border: 1px solid ${Colors.gray}; padding: 8px; text-align: left; }
          th { background-color: ${Colors.primary}; color: white; }
          tr:nth-child(even) { background-color: ${Colors.white}; }
        </style>
      </head>
      <body>
        <h1>Workout Verlauf - ${new Date(date).toLocaleDateString("de-DE")}</h1>
        
        ${workouts.map(workout => `
          <div class="workout">
            <div class="workout-header">
              ${workout.name || "Unbenanntes Workout"} 
              <span style="font-size: 14px; font-weight: normal; float: right;">
                ${new Date(workout.date).toLocaleTimeString("de-DE", {hour: '2-digit', minute: '2-digit'})}
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
        const {uri} = await Print.printToFileAsync({html: htmlContent});
        await Sharing.shareAsync(uri, {UTI: '.pdf', mimeType: 'application/pdf'});
    } catch (error) {
        console.error("Fehler beim PDF Export:", error);
        alert("Export fehlgeschlagen.");
    }
};


const groupSetsByExercise = (sets: ExerciseSet[]) => {
    const grouped: { [key: string]: { exerciseName: string; sets: ExerciseSet[] } } = {};
    sets.forEach((set) => {
        const id = set.exerciseId;
        if (!grouped[id]) {
            grouped[id] = {exerciseName: set.exerciseName || "Unbekannt", sets: []};
        }
        grouped[id].sets.push(set);
    });
    return grouped;
};


export const exportExerciseStatisticsToPDF = async (
    exercise: Exercise,
    history: { date: Date; weight: number; reps?: number; timestamp: number; isDone?: boolean }[]
) => {
    if (!exercise) {
        Alert.alert("Fehler", "Keine Übung zum Exportieren vorhanden.");
        return;
    }

    // Gruppiere nach Datum und finde Bestleistungen
    const bestPerDay = new Map<string, { date: Date; weight: number; reps?: number }>();
    history.forEach((entry) => {
        const dayKey = entry.date.toISOString().split('T')[0];
        const existing = bestPerDay.get(dayKey);
        if (!existing || entry.weight > existing.weight) {
            bestPerDay.set(dayKey, {date: entry.date, weight: entry.weight, reps: entry.reps});
        }
    });

    const sortedHistory = Array.from(bestPerDay.values())
        .sort((a, b) => b.date.getTime() - a.date.getTime());

    if (sortedHistory.length <= 0) {
        Alert.alert("Fehler", "Keine Daten zum Exportieren vorhanden.");
        return;
    }

    // Berechne Statistiken
    const maxWeight = history.length > 0 ? Math.max(...history.map(h => h.weight)) : 0;
    const totalVolume = history.reduce((sum, h) => sum + (h.weight * (h.reps || 0)), 0);
    const totalReps = history.reduce((sum, h) => {
        return h.isDone ? sum + (h.reps || 0) : sum;
    }, 0);
    history.length > 0
        ? (history.reduce((sum, h) => sum + h.weight, 0) / history.length).toFixed(1)
        : '0';

    const htmlContent = `
    <html lang="">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; }
          h1 { text-align: center; color: ${Colors.black}; margin-bottom: 10px; }
          h2 { text-align: center; color: ${Colors.darkGray}; font-size: 16px; margin-top: 0; }
          .stats-box { 
            display: flex; 
            justify-content: space-around; 
            background: ${Colors.white}; 
            padding: 15px; 
            border-radius: 8px; 
            margin: 20px 0;
            border: 1px solid ${Colors.gray};
          }
          .stat-item { text-align: center; }
          .stat-value { font-size: 24px; font-weight: bold; color: ${Colors.primary}; }
          .stat-label { font-size: 12px; color: ${Colors.darkGray}; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid ${Colors.gray}; padding: 10px; text-align: left; }
          th { background-color: ${Colors.primary}; color: white; }
          tr:nth-child(even) { background-color: ${Colors.white}; }
          .info-row { margin: 5px 0; color: ${Colors.darkGray}; }
        </style>
      </head>
      <body>
        <h1>${exercise.name}</h1>
        <h2>${exercise.muscleGroup || 'Keine Muskelgruppe'}</h2>
        
        <div class="stats-box">
          <div class="stat-item">
            <div class="stat-value">${maxWeight} kg</div>
            <div class="stat-label">Max. Gewicht</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${totalVolume.toLocaleString("de-DE")} kg</div>
            <div class="stat-label">Gesamtvolumen</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${totalReps}</div>
            <div class="stat-label">Gesamte Wiederholungen</div>
          </div>
        </div>

        <h3>Verlauf (Bestleistung pro Tag)</h3>
        ${sortedHistory.length > 0 ? `
        <table>
          <thead>
            <tr>
              <th>Datum</th>
              <th>Gewicht (kg)</th>
              <th>Wiederholungen</th>
            </tr>
          </thead>
          <tbody>
            ${sortedHistory.map(entry => `
              <tr>
                <td>${entry.date.toLocaleDateString("de-DE")}</td>
                <td>${entry.weight}</td>
                <td>${entry.reps ?? '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        ` : '<p style="text-align: center; color: #999;">Keine Trainingsdaten vorhanden.</p>'}
        
        <p style="text-align: center; margin-top: 30px; font-size: 12px; color: #999;">
          Exportiert am ${new Date().toLocaleDateString("de-DE")}
        </p>
      </body>
    </html>
  `;

    try {
        const {uri} = await Print.printToFileAsync({html: htmlContent});
        await Sharing.shareAsync(uri, {UTI: '.pdf', mimeType: 'application/pdf'});
    } catch (error) {
        console.error("Fehler beim PDF Export:", error);
        alert("Export fehlgeschlagen.");
    }
};