import { FlatList, View, Text, StyleSheet } from "react-native";
import { useMemo } from "react";
import ExerciseItem from "./ExerciseItem";

interface Props {
    exercises: Exercise[];
    filter?: string,
    onItemPress?: (exercise: Exercise) => void;
}

type Exercise = {
    id: string;
    name: string;
    muscleGroup?: string;
    isFavorite: boolean;
    isOwn: boolean;
};

type ListItem =
    | { type: "divider"; title: string }
    | { type: "exercise"; data: Exercise };

export default function ExerciseList({ exercises, filter="", onItemPress }: Props) {

    const listData: ListItem[] = useMemo(() => {
        const filtered = exercises.filter(e =>
            e.name.toLowerCase().includes(filter.toLowerCase())
        );

        const favoriteExercises = filtered.filter(e => e.isFavorite);
        const ownExercises = filtered.filter(e => e.isOwn && !e.isFavorite);
        const otherExercises = filtered.filter(e => !e.isOwn && !e.isFavorite);

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
    }, [exercises, filter]);

    console.log(exercises);
    return (
        <FlatList
            data={listData}
            keyExtractor={(item, index) =>
                item.type === "divider" ? `divider-${index}` : item.data.id
            }
            renderItem={({ item }) => {

                {/* Dividing line with Text */}
                if (item.type === "divider") {
                    return (
                        <View style={ styles.divider }>
                            <Text style={ styles.dividerText }> { item.title } </Text>
                            <View style={ styles.line } />
                        </View>
                    );
                }

                {/* Exercise Item */}
                return (
                    <ExerciseItem
                        exercise={item.data}
                        onPress={()=> onItemPress && onItemPress(item.data)}
                    />
                );
            }}
            contentContainerStyle={ styles.listContent }

            // No Exercises found
            ListEmptyComponent={() => (
                <View style={{ marginTop: 20 }}>
                    <Text style={{ textAlign: "center", color: "#666" }}>
                        Keine Übungen gefunden
                    </Text>
                </View>
            )}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        marginTop: 20,
    },
    divider: {
        marginVertical: 12,
    },
    dividerText: {
        fontWeight: "600",
        color: "#666"
    },
    line: {
        flex: 1,
        borderBottomColor: 'gray',
        borderBottomWidth: 2,
        height: 1,
        backgroundColor: "#ccc",
        marginTop: 4
    },
    listContent: {
        marginHorizontal: 16,
    },
});
