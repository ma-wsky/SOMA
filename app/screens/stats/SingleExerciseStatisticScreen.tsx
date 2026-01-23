import {router, useLocalSearchParams} from "expo-router";
import {Alert, Dimensions, Image, Pressable, Text, View, ScrollView} from "react-native";
import {useEffect, useRef, useState} from "react";
import {TopBar} from "@/components/TopBar"
import {auth} from "@/firebaseConfig";
import LoadingOverlay from "@/components/LoadingOverlay";
import {Exercise} from "@/types/Exercise"
import {LineChart} from "react-native-chart-kit";
import {statStyles} from "@/styles/statStyles"
import Ionicons from "@expo/vector-icons/Ionicons";
import {transformHistoryToChartData} from "@/utils/transformHistoryToChartData"
import {ExerciseService} from "@/services/exerciseService"
import {exportExerciseStatisticsToPDF} from "@/utils/helper/exportHelper"
import {Colors} from "@/styles/theme";
import {SafeAreaView} from "react-native-safe-area-context";


interface MyChartData {
    labels: string[];
    datasets: [
        {
            data: number[];
        }
    ];
}

interface HistoryEntry {
    date: Date;
    weight: number;
    reps?: number;
    timestamp: number;
}

export default function SingleExerciseStatisticScreen() {

    const [loading, setLoading] = useState<boolean>(false);
    const {id} = useLocalSearchParams<{ id: string }>();
    const [exercise, setExercise] = useState<Exercise | null>(null);
    const [chartData, setChartData] = useState<MyChartData | null>(null);
    const historyRef = useRef<HistoryEntry[]>([]);

    // default images
    const ADMIN_DEFAULT = require("@/assets/default-exercise-picture/admin.png");
    const USER_DEFAULT = require("@/assets/default-exercise-picture/users.png");


    useEffect(() => {
        const loadData = async () => {
            const user = auth.currentUser;
            if (!id || !user) return;

            setLoading(true);

            // firebase fetch + put in state
            try {
                const exercise = await ExerciseService.fetchExercise(id, user.uid);
                setExercise(exercise);

                if (exercise) {
                    const history = await ExerciseService.fetchHistory(id, user.uid);
                    if (history && history.length > 0) {
                        historyRef.current = history;
                        const formattedData = transformHistoryToChartData(history);
                        setChartData(formattedData);

                    } else {
                        historyRef.current = [];
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
            setExercise({...exercise, isFavorite: isNowFavorite});
        } catch (e) {
            Alert.alert("Fehler", "Favorit konnte nicht gespeichert werden.");
        }
    }

    async function handleDownload() {
        if (!exercise) return;
        await exportExerciseStatisticsToPDF(exercise, historyRef.current);
    }

    if (!exercise) {
        return (
            <View style={statStyles.container}>
                <TopBar isSheet={false} leftButtonText="Zurück" onLeftPress={() => router.back()}/>
                <LoadingOverlay visible={true}/>
            </View>
        );
    }

    return (
        <SafeAreaView style={[statStyles.container]}>

            {/* Top Bar */}
            <TopBar isSheet={false}
                    leftButtonText={"Zurück"}
                    titleText={"Statistik"}
                    rightButtonText={"Export"}
                    onLeftPress={() => router.replace("/(tabs)/StatisticScreenProxy")}
                    onRightPress={handleDownload}
            />
            <ScrollView>

                {/* Exercise Picture */}
                <View style={statStyles.picWrapper}>
                    <Image
                        source={
                            exercise.image
                                ? {uri: exercise.image}
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
                            color={Colors.icon}
                        />
                    </Pressable>

                </View>

                {/* muscle groups */}
                <View style={statStyles.infoMuscleWrapper}>
                    <Text
                        style={statStyles.infoMuscle}>{exercise.muscleGroup}
                    </Text>
                </View>

                <View style={statStyles.singleLine}/>

                {/* chart */}
                <View style={statStyles.content}>
                    {chartData ? (
                        <View style={statStyles.graphWrapper}>
                            <LineChart
                                data={chartData}
                                width={Dimensions.get("window").width - 60}
                                height={250}
                                chartConfig={{
                                    backgroundColor: Colors.background,
                                    backgroundGradientFrom: Colors.background,
                                    backgroundGradientTo: Colors.background,
                                    decimalPlaces: 1,

                                    color: (opacity = 1) => `rgba(171, 143, 255, ${opacity})`,
                                    fillShadowGradientFrom: Colors.primary,
                                    fillShadowGradientTo: "#ffffff",
                                    fillShadowGradientOpacity: 0.5,

                                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                    style: {borderRadius: 16,},
                                    propsForDots: {
                                        r: "5",
                                        strokeWidth: "2",
                                        stroke: Colors.primary,
                                        fill: Colors.white,
                                    },
                                }}
                                bezier
                                style={statStyles.chart}
                            />
                        </View>
                    ) : (
                        <Text style={statStyles.emptyText}>Keine Trainingsdaten gefunden.</Text>
                    )}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}
