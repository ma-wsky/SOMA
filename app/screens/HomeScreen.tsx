import { useRouter } from "expo-router";
import { View, Pressable, Text } from 'react-native';
import { Calendar } from "react-native-calendars";
import { homeStyles as styles } from "@/styles/homeStyles";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState, useEffect } from 'react';
import { auth, db } from '@/firebaseConfig';
import { User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function Home(){

    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<any>(null);
    const [isAnonymous, setIsAnonymous] = useState<boolean>(false);

    useEffect(() => {
        const loadUserData = async () => {
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
                }
            }
        };
        
        loadUserData();
    }, []);

    const getUserDisplayName = () => {
        if (!user) {
            return "User";
        }
        if (isAnonymous) {
            return "Gast";
        }
        if (userData?.name) {
            return userData.name;
        }
        return "User";
    };

    return (
        <View style={{backgroundColor: '#ffffff', flex:1, flexDirection: "column",justifyContent: 'flex-start',}}>
            <View style={{alignItems: "center", marginTop: 160,}}>
                <Text>Hallo, {getUserDisplayName()}!</Text>
            </View>

            <View style={{marginHorizontal: 40,}}>
                <Calendar
                    onDayPress={(day) => {
                        router.push({
                            pathname: "/screens/workout/WorkoutHistoryScreen",
                            params: { date: day.dateString }
                        });
                    }}
                />
            </View>


            <View style={{marginHorizontal: 20, marginTop: 80,}}>
                <Pressable
                    onPress={() => {router.push("/screens/exercise/ExerciseScreen")}}
                    style={({ pressed }) => [
                        styles.bigButton,
                        {backgroundColor: pressed ? "#333" : "#000"},
                    ]}
                >
                    <View style={styles.bigButtonTextWrapper}>
                        <Text style={styles.buttonText}>Übungen</Text>
                        <Ionicons
                            name={"barbell-outline"}
                            size={28}
                            color="#fff"
                        />
                    </View>

                </Pressable>
            </View>

        </View>

    );
}