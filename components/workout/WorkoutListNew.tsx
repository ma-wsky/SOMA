import { FlatList, View, Text } from "react-native";
import { useMemo } from "react";
import WorkoutItem from "@/components/workout/WorkoutItemNew";
import { workoutStyles } from "@/styles/workoutStyles";
import { Workout } from "@/types/Workout";

interface Props {
    workouts: Workout[];
    filter?: string;
    onItemPress?: (workout: Workout) => void;
    onStartWorkout?: (workout: Workout) => void;
    onDelete?: (workoutId: string) => void;
}

type ListItem =
    | { type: "divider"; title: string }
    | { type: "workout"; data: Workout };

export default function WorkoutList({ workouts, filter = "", onItemPress, onStartWorkout, onDelete }: Props) {

    const listData = useMemo(() => {
        // 1. Filtern nach Name
        const filtered = workouts.filter(w =>
            filter.toLowerCase() === "" ||
            w.name?.toLowerCase().includes(filter.toLowerCase())
        );

        // 2. Sortieren (z.B. nach Name oder Datum - hier nach Name wie in ExerciseList)
        const sorted = filtered.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

        // 3. Kategorisierung (Hier als Beispiel: Eigene Vorlagen vs. Standard)
        // Du kannst das später anpassen (z.B. nach 'isTemplate' oder 'muscleGroup')
        const data: ListItem[] = [];

        if (sorted.length > 0) {
            data.push({ type: "divider", title: "Alle Pläne" });
            sorted.forEach(w => data.push({ type: "workout", data: w }));
        }

        return data;
    }, [workouts, filter]);

    const renderItem = ({ item }: { item: ListItem }) => {
        if (item.type === "divider") {
            return (
                <View style={workoutStyles.divider}>
                    <Text style={workoutStyles.dividerText}>{item.title}</Text>
                    <View style={workoutStyles.line} />
                </View>
            );
        }
        return (
            <WorkoutItem
                workout={item.data}
                onPress={() => onItemPress?.(item.data)}
                onStartWorkout={onStartWorkout}
                onDelete={onDelete}
            />
        );
    }

    return (
        <FlatList
            data={listData}
            keyExtractor={(item) =>
                item.type === "divider" ? `divider-${item.title}` : item.data.id
            }
            renderItem={renderItem}
            contentContainerStyle={workoutStyles.listContent}
            keyboardDismissMode="on-drag"
            ListEmptyComponent={
                <View style={workoutStyles.noFound}>
                    <Text style={workoutStyles.noFoundText}>
                        Keine Pläne gefunden
                    </Text>
                </View>
            }
        />
    );
}