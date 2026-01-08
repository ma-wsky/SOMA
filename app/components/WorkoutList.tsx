import { useMemo } from "react";
import { FlatList, View, Text, StyleSheet } from "react-native";
import { workoutStyles } from "../styles/workoutStyles";
import WorkoutItem from "./WorkoutItem";



interface Props{
    workouts: Workout[];
    filter?: string;
    onItemPress?: (workout: Workout) => void;
}

type Workout = {
    id: string;
    name: string;
    duration: number;
    exercises: WorkoutExercise[];
};

type WorkoutExercise = {
    id: string;
    breakTime: number;
    sets: Set[];
};

type Set = {
    reps: number;
    weight: number;
    isDone: boolean;
};

type ListItem =
    | { type: "workout"; data: Workout };

export default function WorkoutList({workouts,filter="", onItemPress}: Props) {

    const listData: ListItem[] = useMemo(() => {
        const filtered = workouts.filter(w =>
            w.name.toLowerCase().includes(filter.toLowerCase())
        );
        const data: ListItem[] = [];

        return data;
    }, [workouts]);

    console.log(workouts);
    return (
        <FlatList
            data={listData}
            keyExtractor={(item) =>
                item.type === "workout" ? item.data.id : ""
            }
            renderItem={({ item }) => {
                if (item.type === "workout") {
                    return (
                        <View style={workoutStyles.itemContainer}>
                            <Text style={workoutStyles.title}>{item.data.name}</Text>
                        </View>
                    );
                }
                return (
                    <WorkoutItem
                    workout={item.data}
                    onPress={()=>onItemPress && onItemPress(item.data)}
                    />
                );
            }}

            ListEmptyComponent={()=>(
                <View style={{marginTop: 20}}>
                    <Text style={{ textAlign: "center", color: "#666" }}>Keine Workouts gefunden.</Text>
                </View>
            )}
            />
    );
}

