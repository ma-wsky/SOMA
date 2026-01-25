import {useRouter} from "expo-router";
import {Alert, Image, Pressable, ScrollView, StyleSheet, Text, View} from "react-native";
import {useEffect, useState} from 'react';
import {auth, db} from "@/firebaseConfig";
import {deleteUser, signOut} from "firebase/auth";
import {doc, getDoc} from "firebase/firestore";
import {userStyles} from "@/styles/userStyles";
import LoadingOverlay from "@/components/LoadingOverlay";
import {SettingsOverlay} from "@/components/user/SettingsOverlay";
import Ionicons from "@expo/vector-icons/Ionicons";
import {Colors} from "@/styles/theme";
import {loadSettings} from "@/utils/store/settingsStore";
import {SafeAreaView} from "react-native-safe-area-context";


const DataRow = ({label, value, unit = ""}: { label: string, value?: string | number, unit?: string }) => (
    <View style={userStyles.rowWrapper}>
        <Text style={userStyles.text}>{label}</Text>
        <View style={userStyles.fieldWrapper}>
            <Text style={userStyles.field}>
                {value && value !== ""
                    ? `${value}${unit}`
                    : (auth.currentUser?.isAnonymous ? "Registrieren zum Eintragen" : "Nicht eingetragen")
                }
            </Text>
        </View>
    </View>
);

export default function UserScreen() {

    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [userData, setUserData] = useState<any>(null);
    const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
    const [settingsVisible, setSettingsVisible] = useState(false);

    const defaultPic = require('@/assets/default-profile-picture/default-profile-picture.jpg');

    useEffect(() => {
        // app settings store
        loadSettings();

        const loadUserData = async () => {
            setLoading(true);
            const user = auth.currentUser;

            if (!user) {
                console.error("Kein User angemeldet.");
                setLoading(false);
                return;
            }

            setIsAnonymous(user.isAnonymous);

            // firebase fetch userdata
            try {
                const docRef = doc(db, "users", user.uid);
                const snapshot = await getDoc(docRef);

                if (snapshot.exists()) {
                    setUserData(snapshot.data());
                }
            } catch (e) {
                console.error("Fehler beim Laden der User-Daten:", e);
                Alert.alert("Fehler", "Daten konnten nicht geladen werden.");
            } finally {
                setLoading(false);
            }
        };
        loadUserData();
    }, []);

    const confirmLogout = async () => {
        Alert.alert(
            "Abmelden",
            isAnonymous
                ? "Als Gast gehen deine Daten verloren. Wirklich abmelden?"
                : "Möchtest du dich wirklich abmelden?",
            [
                {text: "Abbrechen", style: "cancel"},
                {
                    text: "Abmelden",
                    style: "destructive",
                    onPress: handleLogout,
                },
            ],
        );
    }

    const handleLogout = async () => {
        setLoading(true);
        setSettingsVisible(false);

        try {
            const user = auth.currentUser;

            // delete anon user data
            if (isAnonymous && user) {
                await deleteUser(user);
            } else {
                await signOut(auth);
            }

            Alert.alert("Abmelden", "Erfolgreich abgemeldet");
            router.replace("/screens/auth/LandingScreen");

        } catch (error: any) {
            console.error("Logout fehlgeschlagen:", error);
            Alert.alert("Fehler", "Abmeldung fehlgeschlagen.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <SafeAreaView style={userStyles.userContainer}>
            <ScrollView>

                {/* Settings Gear Icon - oben rechts */}
                <Pressable
                    style={localStyles.settingsIcon}
                    onPress={() => setSettingsVisible(true)}
                >
                    <Ionicons name="settings-outline" size={28} color={Colors.black}/>
                </Pressable>

                {/* Settings Overlay */}
                <SettingsOverlay
                    visible={settingsVisible}
                    onClose={() => setSettingsVisible(false)}
                    onEdit={() => {
                        setSettingsVisible(false);
                        if (isAnonymous) {
                            router.push("/screens/auth/RegisterScreen");
                        } else {
                            router.push("/screens/user/EditUserScreen");
                        }
                    }}
                    onLogout={confirmLogout}
                    onImpressum={() => {
                        setSettingsVisible(false);
                        router.push("/screens/user/ImpressumScreen");
                    }}
                    isAnonymous={isAnonymous}
                />


                {/* Profile Picture */}
                <View style={userStyles.profilePictureWrapper}>
                    <Image
                        source={userData?.profilePicture
                            ? {uri: userData.profilePicture}
                            : defaultPic
                        }
                        style={userStyles.profilePicture}/>
                </View>

                {/* User Data */}
                <View style={userStyles.layout}>
                    <DataRow label="Name" value={userData?.name}/>
                    <DataRow label="E-Mail" value={userData?.email}/>

                    <View style={userStyles.line}/>

                    <DataRow label="Geburtsdatum" value={userData?.birthdate}/>
                    <DataRow label="Gewicht" value={userData?.weight} unit=" kg"/>
                    <DataRow label="Größe" value={userData?.height} unit=" cm"/>

                    <View style={userStyles.line}/>

                    <Text style={[userStyles.text, {marginLeft: 30, marginBottom: 5}]}>Trainingserinnerung</Text>

                    <DataRow
                        label="Uhrzeit"
                        value={
                            userData?.reminderTime
                                ? `${String(userData.reminderTime.hour).padStart(2, '0')}:${String(userData.reminderTime.minute).padStart(2, '0')}`
                                : "Nicht gesetzt"
                        }
                    />
                    <DataRow
                        label="Tage"
                        value={(() => {
                            if (!userData?.reminderDays || userData.reminderDays.length === 0) return "Keine";
                            const map: any = {1: "Mo", 2: "Di", 3: "Mi", 4: "Do", 5: "Fr", 6: "Sa", 7: "So"};
                            const sorted = [...userData.reminderDays].sort((a, b) => a - b);
                            return sorted.map(d => map[d]).join(", ");
                        })()}
                    />
                </View>

                {/* Loading Overlay */}
                <LoadingOverlay visible={loading}/>

            </ScrollView>
        </SafeAreaView>
    );
}

const localStyles = StyleSheet.create({
    settingsIcon: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 10,
        padding: 8,
    },
});