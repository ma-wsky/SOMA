import { router, useLocalSearchParams } from "expo-router";
import { View, Text, Image, Pressable, Alert } from "react-native";
import { useState, useEffect } from "react";
import { TopBar } from "@/components/TopBar"
import { auth } from "@/firebaseConfig";
import LoadingOverlay from "@/components/LoadingOverlay";
import { Exercise } from "@/types/Exercise"
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import { statStyles } from "@/styles/statStyles"
import Ionicons from "@expo/vector-icons/Ionicons";
import { transformHistoryToChartData } from "@/utils/transformHistoryToChartData"
import { ExerciseService } from "@/services/exerciseService"


interface MyChartData {
    labels: string[];
    datasets: [
        {
            data: number[];
            // Hier können später noch optionale Felder wie 'color' stehen
        }
    ];
}

export default function SingleExerciseStatisticScreen() {

    const [loading,setLoading] = useState<boolean>(false);
    const { id } = useLocalSearchParams<{ id: string }>();
    const [exercise, setExercise] = useState<Exercise | null>(null);
    const [chartData, setChartData] = useState<MyChartData | null>(null);

    const ADMIN_DEFAULT = require("@/assets/default-exercise-picture/admin.png");
    const USER_DEFAULT = require("@/assets/default-exercise-picture/users.png");


    useEffect(() => {
        const loadData = async () => {
            const user = auth.currentUser;
            if (!id || !user) return;

            setLoading(true);

            try {
                const exercise = await ExerciseService.fetchExercise(id, user.uid);
                setExercise(exercise);

                if (exercise){
                    const history = await ExerciseService.fetchHistory(id);
                    if(history && history.length > 0) {
                        const formattedData = transformHistoryToChartData(history);
                        setChartData(formattedData);

                    } else {
                        setChartData(null);
                    }

                }
            } catch (e) {
                console.error("Fehler beim Laden der Übung:", e);
                setExercise(null);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    async function handleToggleFavorite() {
        if (!exercise || !auth.currentUser) return;

        try {
            const isNowFavorite = await ExerciseService.toggleFavorite(exercise, auth.currentUser.uid);
            setExercise({ ...exercise, isFavorite: isNowFavorite});
        } catch (e) {
            Alert.alert("Fehler", "Favorit konnte nicht gespeichert werden.");
        }
    }

    if (!exercise) return;

    return (
        <View style={statStyles.container}>

            {/* Top Bar */}
            <TopBar leftButtonText={"Zurück"}
                    titleText={"Übung Statistik"}
                    rightButtonText={"Download"}
                    onLeftPress={() => router.replace("../../(tabs)/StatisticScreenProxy")}
                    onRightPress={() => console.log("download")}
            ></TopBar>

            {/* Exercise Picture */}
            <View style={statStyles.picWrapper}>
                <Image
                    source={
                        exercise.image
                            ? { uri: exercise.image }
                            : (exercise.isOwn
                                ? USER_DEFAULT
                                : ADMIN_DEFAULT
                            )
                    }
                    style={statStyles.picture}
                />
            </View>

            {/* Exercise name and fav toggle */}
            <View style={statStyles.infoNameFavIconWrapper}>
                <Text style={statStyles.infoName}>{exercise.name}</Text>
                <Pressable
                    onPress={handleToggleFavorite}>
                    <Ionicons
                        name={exercise.isFavorite ? "heart" : "heart-outline"}
                        size={32}
                        color="#555"
                    />
                </Pressable>

            </View>

            {/* muscle groups */}
            <View style={statStyles.infoMuscleWrapper}>
                <Text
                    style={statStyles.infoMuscle}>{exercise.muscleGroup}
                </Text>
            </View>

            <View style={statStyles.line}/>

            {/* chart */}
            <View style={statStyles.content}>

                {chartData ? (
                    <View style={statStyles.graphWrapper}>
                        <LineChart
                            data={chartData}
                            width={Dimensions.get("window").width - 60} // Breite des Bildschirms minus Padding
                            height={250}
                            chartConfig={{
                                backgroundColor: "#ffffff",
                                backgroundGradientFrom: "#ffffff",
                                backgroundGradientTo: "#ffffff",
                                decimalPlaces: 1,
                                color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
                                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                style: { borderRadius: 16, },
                                propsForDots: { r: "5", strokeWidth: "2", stroke: "#007AFF" },
                            }}
                            bezier
                            style={statStyles.chart}
                        />
                    </View>
                ) : (
                    <Text style={statStyles.emptyText}>Keine Trainingsdaten gefunden.</Text>
                )}

            </View>

            {/* Loading Overlay */}
            <LoadingOverlay visible={loading} />

        </View>
    );
}
