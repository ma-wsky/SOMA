import {Dispatch, SetStateAction, useEffect} from "react";
import {collection, doc, getDoc, getDocs} from "firebase/firestore";
import {auth, db} from "@/firebaseConfig";
import {showAlert} from "@/utils/helper/alertHelper";
import type {Exercise, ExerciseSet, Workout} from "@/types/workoutTypes";
import {getEditingWorkout} from "@/utils/store/workoutEditingStore"
import {getActiveWorkout} from "@/utils/store/activeWorkoutStore"


interface LoadWorkoutParams {
    id?: string | string[];
    workoutEditId?: string | string[];
    setWorkout: Dispatch<SetStateAction<Workout | null>>;
    setOriginalWorkout?: Dispatch<SetStateAction<Workout | null>>;
    setExercises?: Dispatch<SetStateAction<Map<string, Exercise>>>;
    setLoading: Dispatch<SetStateAction<boolean>>;
    setEditIdRef?: (id: string) => void;
}


export const useWorkoutLoader = ({
                                    id,
                                    workoutEditId,
                                    setWorkout,
                                    setOriginalWorkout,
                                    setExercises,
                                    setLoading,
                                    setEditIdRef,
                                }: LoadWorkoutParams) => {
    useEffect(() => {
        const loadWorkoutData = async () => {
            setLoading(true);
            try {
                const user = auth.currentUser;
                if (!user) return;

                //Load all exercises for ref
                const exercisesMap = new Map<string, Exercise>();
                const exercisesSnapshot = await getDocs(collection(db, "exercises"));
                exercisesSnapshot.forEach((doc) => {
                    exercisesMap.set(doc.id, {id: doc.id, ...doc.data()} as Exercise);
                });

                if (setExercises) {
                    setExercises(exercisesMap);
                }

                const currentEditId = (workoutEditId || id || `temp_${Date.now()}`) as string;
                if (setEditIdRef) {
                    setEditIdRef(currentEditId);
                }

                //if existing Workout
                if (id != null) {
                    const userRef = doc(db, "users", user.uid, "workouts", id as string);
                    const userSnap = await getDoc(userRef);

                    if (userSnap.exists()) {
                        const workoutData = userSnap.data() as Omit<Workout, "id" | "exerciseSets">;

                        //Load exercise sets from subcollection
                        const setsSnapshot = await getDocs(collection(userRef, "exerciseSets"));
                        const exerciseSets: ExerciseSet[] = [];
                        setsSnapshot.forEach((setDoc) => {
                            const setData = setDoc.data();
                            exerciseSets.push({
                                id: setDoc.id,
                                exerciseId: setData.exerciseId,
                                exerciseName: setData.exerciseName,
                                name: setData.name,
                                weight: setData.weight,
                                reps: setData.reps,
                                isDone: setData.isDone || false,
                                breaktime: setData.breaktime ?? 30,
                            });
                        });

                        //restore draft
                        const draft = getEditingWorkout(currentEditId);

                        //get active start time
                        const activeStore = getActiveWorkout();
                        const preservedStartTime = (activeStore?.id === id) ? activeStore.startTime : undefined;

                        if (draft) {
                            const cleanSets = exerciseSets.map(s => ({...s, isDone: false}));

                            setWorkout(draft);
                            if (setOriginalWorkout) setOriginalWorkout({
                                id: userSnap.id,
                                ...workoutData,
                                exerciseSets:cleanSets,
                                startTime: preservedStartTime || draft.startTime || Date.now(),
                            });
                        } else {
                            //reset isDone
                            const cleanSets = exerciseSets.map(s => ({...s, isDone: false}));

                            const loadedW = {
                                id: userSnap.id,
                                ...workoutData,
                                date: new Date().toISOString(),
                                exerciseSets: cleanSets,
                                startTime: preservedStartTime || Date.now(),
                            };
                            setWorkout(loadedW);
                            if (setOriginalWorkout) setOriginalWorkout(loadedW);
                        }
                        return;
                    }
                }

                const draft = getEditingWorkout(currentEditId);

                const activeStore = getActiveWorkout();
                const preservedStartTime = activeStore ? activeStore.startTime : undefined;

                if (draft) {
                    setWorkout((currentWorkout) => {
                        if (JSON.stringify(currentWorkout) !== JSON.stringify(draft)) {
                            return draft;
                        }
                        return currentWorkout;
                    });
                    if (setOriginalWorkout) setOriginalWorkout({
                        ...draft,
                        startTime: preservedStartTime || draft.startTime || Date.now(),
                    } as Workout);
                } else {
                    const newW = {
                        id: currentEditId,
                        date: new Date().toISOString(),
                        exerciseSets: [],
                        startTime: preservedStartTime || Date.now(),
                    };
                    setWorkout(newW);
                    if (setOriginalWorkout) setOriginalWorkout(newW);
                }
            } catch (e) {
                console.error("Fehler beim Laden des Workouts:", e);
                showAlert("Fehler", "Workout konnte nicht geladen werden");
            } finally {
                setLoading(false);
            }
        };

        loadWorkoutData();
    }, [id, workoutEditId]);
};


export const useSingleWorkoutLoader = ({
                                           id,
                                           workoutEditId,
                                           setWorkout,
                                           setOriginalWorkout,
                                           setExercises,
                                           setLoading,
                                           setEditIdRef,
                                           isCreateMode,
                                       }: LoadWorkoutParams & { isCreateMode?: boolean }) => {
    useEffect(() => {
        const fetchWorkout = async () => {
            setLoading(true);
            try {
                // Load exercises first
                const exercisesMap = new Map<string, Exercise>();
                const exercisesSnapshot = await getDocs(collection(db, "exercises"));
                exercisesSnapshot.forEach((doc) => {
                    exercisesMap.set(doc.id, {id: doc.id, ...doc.data()} as Exercise);
                });

                if (setExercises) {
                    setExercises(exercisesMap);
                }

                // Set edit ref
                const normalizedEditId = Array.isArray(workoutEditId) ? workoutEditId[0] : workoutEditId;
                const editId = normalizedEditId || (id ? `workout_${id}` : `new_${Date.now()}`);
                if (setEditIdRef) {
                    setEditIdRef(editId);
                }

                // New workout- if no draft exists
                if (!id) {
                    const emptyWorkout: Workout = {
                        date: new Date().toISOString(),
                        exerciseSets: [],
                        name: "",
                    };

                    if (setOriginalWorkout) {
                        setOriginalWorkout(emptyWorkout);
                    }

                    const draft = editId ? require("@/utils/store/workoutEditingStore").getEditingWorkout(editId) : null;
                    if (draft) {
                        // Prevent infinite loop by checking if draft is different from current state
                        setWorkout((currentWorkout) => {
                            if (JSON.stringify(currentWorkout) !== JSON.stringify(draft)) {
                                return draft;
                            }
                            return currentWorkout;
                        });
                    } else {
                        // Only set initial empty workout if no draft exists
                        setWorkout(emptyWorkout);
                    }
                    return;
                }

                // Existing Workout
                const user = auth.currentUser;
                if (!user) {
                    return;
                }

                const userRef = doc(db, "users", user.uid, "workouts", id as string);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    // Load exercise sets from subcollection
                    const setsSnapshot = await getDocs(collection(userRef, "exerciseSets"));
                    const sets: ExerciseSet[] = [];
                    setsSnapshot.forEach((doc) => {
                        const data = doc.data();
                        const exercise = exercisesMap.get(data.exerciseId);
                        sets.push({
                            id: doc.id,
                            exerciseId: data.exerciseId,
                            exerciseName: data.exerciseName || exercise?.name,
                            name: data.name || undefined,
                            breaktime: data.breaktime ?? 30,
                            weight: data.weight,
                            reps: data.reps,
                            isDone: data.isDone || false,
                        });
                    });

                    const loadedWorkout = {
                        id: userSnap.id,
                        name: userSnap.data().name || "",
                        date: userSnap.data().date,
                        exerciseSets: sets,
                    };

                    setWorkout(loadedWorkout);
                    if (setOriginalWorkout) {
                        setOriginalWorkout(loadedWorkout);
                    }

                    // Check if there is a draft overlaying the existing workout
                    const draft = editId ? getEditingWorkout(editId) : null;
                    if (draft) {
                        setWorkout(draft);
                    }
                }
            } catch (e) {
                console.error("Fehler beim Laden des Workouts:", e);
            } finally {
                setLoading(false);
            }
        };

        fetchWorkout();
    }, [id, workoutEditId]);
};
