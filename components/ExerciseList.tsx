import { FlatList, View, Text } from "react-native";
import { useMemo } from "react";
import ExerciseItem from "@/components/ExerciseItem";
import { exerciseStyles } from "@/styles/exerciseStyles";
import { Exercise } from "@/types/Exercise"

interface Props {
    exercises: Exercise[];
    filter?: string,
    category?: string,

    onItemPress?: (exercise: Exercise) => void;
    onAddToWorkout?: (exercise: Exercise) => void;
    showAddButton?: boolean;
}

type ListItem =
    | { type: "divider"; title: string }
    | { type: "exercise"; data: Exercise };

export default function ExerciseList({ exercises, filter="",category="Alle", onItemPress, onAddToWorkout, showAddButton = false}: Props) {

    const listData = useMemo(() => {

        const filtered = exercises.filter(ex => {
            const matchesSearch = filter.toLowerCase() === "" ||
                ex.name.toLowerCase().includes(filter.toLowerCase());

            const matchesCategory = category === "Alle" ||
                ex.muscleGroup?.toLowerCase().includes(category.toLowerCase());

            return matchesSearch && matchesCategory;
        });

        const sortedFilter = filtered.sort((a, b) => a.name.localeCompare(b.name));

        const favoriteExercises: Exercise[] = [];
        const ownExercises: Exercise[] = [];
        const otherExercises: Exercise[] = [];

        sortedFilter.forEach(ex => {
            if (ex.isFavorite) favoriteExercises.push(ex);
            else if (ex.isOwn) ownExercises.push(ex);
            else otherExercises.push(ex);
        })

        const data: ListItem[] = [];

        if (favoriteExercises.length > 0) {
            data.push({ type: "divider", title: "Favoriten" });
            favoriteExercises.forEach(ex => data.push({ type: "exercise", data: ex }));
        }
        if (ownExercises.length > 0) {
            data.push({ type: "divider", title: "Meine Übungen" });
            ownExercises.forEach(ex => data.push({ type: "exercise", data: ex }));
        }
        if (otherExercises.length > 0){
            data.push({ type: "divider", title: "Andere Übungen"});
            otherExercises.forEach(ex => data.push({ type: "exercise", data: ex}));
        }

        return data;
    }, [exercises, filter, category]);

    const renderItem = ({ item }: { item: ListItem }) => {
        if (item.type === "divider"){
            return (
                // Dividing line with Text
                <View style={exerciseStyles.divider}>
                    <Text style={exerciseStyles.dividerText}>{item.title}</Text>
                    <View style={exerciseStyles.line} />
                </View>
            );
        }
        return (
            <ExerciseItem
                exercise={item.data}
                onPress={()=> onItemPress && onItemPress(item.data)}
                onAddToWorkout={onAddToWorkout}
                showAddButton={showAddButton}
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
            contentContainerStyle={exerciseStyles.listContent}
            keyboardDismissMode="on-drag"

            // No Exercises found
            ListEmptyComponent={
                <View style={exerciseStyles.noExFound}>
                    <Text style={exerciseStyles.noExFoundText}>
                        Keine Übungen gefunden
                    </Text>
                </View>

            }
        />
    );
}
