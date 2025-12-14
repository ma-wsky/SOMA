import { FlatList, View, Text } from "react-native";
import ExerciseItem from "./ExerciseItem";

interface Props {
    exercises: Exercise[];
    onItemPress?: (exercise: Exercise) => void;
}

type Exercise = {
    id: string;
    name: string;
    muscleGroup?: string;
    ownerId?: string | null;
    isGlobal?: boolean;
};

export default function ExerciseList({ exercises, onItemPress }: Props) {
    console.log(exercises);
    return (
        <FlatList
            data={exercises}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <ExerciseItem exercise={item} onPress={onItemPress} />
            )}
            contentContainerStyle={{ padding: 16 }}
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
