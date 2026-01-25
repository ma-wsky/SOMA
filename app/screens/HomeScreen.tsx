import {useRouter} from "expo-router";
import {Pressable, Text, View} from 'react-native';
import {Calendar} from "react-native-calendars";
import {homeStyles as styles} from "@/styles/homeStyles";
import Ionicons from "@expo/vector-icons/Ionicons";
import {useEffect, useState} from 'react';
import {auth, db} from '@/firebaseConfig';
import {User} from 'firebase/auth';
import {collection, doc, getDoc, getDocs} from 'firebase/firestore';
import {Colors} from "@/styles/theme";
import {SafeAreaView} from "react-native-safe-area-context";
import {listFilterStore} from "@/utils/store/listFilterStore";
import LoadingOverlay from "@/components/LoadingOverlay";


export default function Home() {

    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<any>(null);
    const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
    const [daysWorkedOut, setDaysWorkedOut] = useState<{ [key: string]: any }>({});
    const {resetFilters} = listFilterStore();
    const [loading, setLoading] = useState<boolean>(false);

    // firebase fetch user data
    useEffect(() => {
        const loadUserData = async () => {
            setLoading(true);

            const currentUser = auth.currentUser;
            if (!currentUser) return;

            setUser(currentUser);
            setIsAnonymous(currentUser.isAnonymous);

            if (!currentUser.isAnonymous) {
                try {
                    const docRef = doc(db, "users", currentUser.uid);
                    const snapshot = await getDoc(docRef);
                    if (snapshot.exists()) {
                        setUserData(snapshot.data());
                    }
                } catch (e) {
                    console.error("Fehler beim Laden der User-Daten:", e);
                } finally {
                    setLoading(false)
                }
            }

            await loadDaysWorkedOut(currentUser.uid);
            setLoading(false);
        };

        loadUserData();
    }, []);


    // firebase fetch workout history
    const loadDaysWorkedOut = async (userId: string) => {
        try {
            const workoutsRef = collection(db, "users", userId, "workouts");
            const qSnapshot = await getDocs(workoutsRef);

            const days: { [key: string]: any } = {};
            qSnapshot.forEach((doc) => {
                const workoutData = doc.data();

                if (workoutData.date && workoutData.type !== "template") {
                    const dateOnly = workoutData.date.split('T')[0];

                    days[dateOnly] = {
                        marked: true,
                        dotColor: Colors.primary,
                    };
                }

            });

            setDaysWorkedOut(days);
        } catch (e) {
            console.error("Fehler beim Laden der Workout-Daten:", e);
        }
    };

    return (
        <SafeAreaView style={{
            backgroundColor: Colors.background,
            flex: 1,
            flexDirection: "column",
            justifyContent: 'flex-start',
        }}>
            {/* greeting */}
            <View style={{alignItems: "center", marginTop: 100,padding:10 }}>
                {!isAnonymous && userData?.name ? (
                    <Text style={{fontSize: 24, fontWeight: "bold", alignSelf: "center",}}
                    numberOfLines={2}
                    ellipsizeMode="tail">
                        Hallo, {userData.name}!
                    </Text>
                ) : (
                    <Text style={{fontSize: 24, fontWeight: "bold", alignSelf: "center"}}>
                        Hallo!
                    </Text>
                )}
            </View>

            {/* calendar */}
            <View style={{marginHorizontal: 40,}}>
                <Calendar
                    onDayPress={(day) => {
                        router.push({
                            pathname: "/screens/workout/WorkoutHistoryScreen",
                            params: {date: day.dateString}
                        });
                    }}
                    markedDates={daysWorkedOut}
                    theme={{
                        backgroundColor: Colors.background,
                        calendarBackground: Colors.background,
                        textSectionTitleColor: Colors.black,
                        dayTextColor: Colors.black,
                        todayTextColor: Colors.primary,
                        dotColor: Colors.primary,
                        indicatorColor: Colors.primary,
                        arrowColor: Colors.primary,
                        monthTextColor: Colors.primary,
                    }}
                />
            </View>

            {/* exercises button */}
            <View style={{marginHorizontal: 20, marginTop: 60,}}>
                <Pressable
                    onPress={() => {
                        resetFilters();
                        router.push("/screens/exercise/ExerciseScreen");
                    }}
                    style={({pressed}) => [
                        styles.bigButton,
                        {backgroundColor: pressed ? Colors.darkGray : Colors.black},
                    ]}
                >
                    <View style={styles.bigButtonTextWrapper}>
                        <Text style={styles.buttonText}>Übungen</Text>
                        <Ionicons
                            name={"barbell-outline"}
                            size={28}
                            color={Colors.white}
                        />
                    </View>

                </Pressable>
            </View>

            {/* Loading Overlay */}
            <LoadingOverlay visible={loading}/>

        </SafeAreaView>
    );
}