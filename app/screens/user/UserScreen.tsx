import { useRouter } from "expo-router";
import { View, Text, ScrollView, Alert, Image } from "react-native";
import { useState, useEffect } from 'react';
import { auth, db } from "../../firebaseConfig";
import { signOut, deleteUser } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { userStyles } from "../../styles/userStyles";
import LoadingOverlay from "../../components/LoadingOverlay";
import { UserButton } from "../../components/user/userButton"

const DataRow = ({ label, value, unit = "" }: { label: string, value?: string | number, unit?: string }) => (
    <View style={userStyles.rowWrapper}>
        <Text style={userStyles.text}>{label}</Text>
        <View style={userStyles.fieldWrapper}>
            <Text style={userStyles.field}>
                {value && value !== "" ? `${value}${unit}` : "Nicht gesetzt"}
            </Text>
        </View>
    </View>
);

export default function UserScreen() {

    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [userData, setUserData] = useState<any>(null);
    const [isAnonymous, setIsAnonymous] = useState<boolean>(false);

    const defaultPic = require('../../assets/default-profile-picture/default-profile-picture.jpg');

    useEffect(() => {
        const loadUserData = async () => {
            setLoading(true);
            const user = auth.currentUser;

            if (!user) {
                console.error("Kein User angemeldet.");
                setLoading(false);
                return;
            }

            setIsAnonymous(user.isAnonymous);

            try {
                const docRef = doc(db, "users", user.uid);
                const snapshot = await getDoc(docRef);

                if (snapshot.exists()) {
                    setUserData(snapshot.data());
                }
            } catch (e) {
                console.error("Fehler beim Laden der User-Daten:", e);
                Alert.alert("Fehler", "Daten konnten nicht geladen werden.");
            }finally {
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
                { text: "Abbrechen", style: "cancel" },
                {   text: "Abmelden",
                    style: "destructive",
                    onPress: handleLogout,
                },
            ],
        );
    }

    const handleLogout = async () => {
        setLoading(true);

        try{
            const user = auth.currentUser;
            if(isAnonymous && user){
                await deleteUser(user);
            } else {
                await signOut(auth);
            }

            Alert.alert("Abmelden", "Erfolgreich abgemeldet");
            router.replace("/screens/auth/LandingScreen");

        }catch (error: any){
            console.error("Logout fehlgeschlagen:", error);
            Alert.alert("Fehler", "Abmeldung fehlgeschlagen.");
        }finally {
            setLoading(false);
        }
    }

    return (

        <ScrollView style={userStyles.scrollView}>
            <View style={userStyles.userContainer}>

                {/* Header */}
                <View style={userStyles.buttonWrapper}>
                    <UserButton title={isAnonymous ? "Registrieren" : "Bearbeiten"}
                                onPress={() => isAnonymous
                                    ? router.push("/screens/auth/RegisterScreen")
                                    : router.push("/screens/user/EditUserScreen")}
                    />
                </View>

                {/* Profile Picture */}
                <View style={userStyles.profilePictureWrapper}>
                    <Image
                        source={userData?.profilePicture
                            ? { uri: userData.profilePicture }
                            : defaultPic
                        }
                        style={userStyles.profilePicture}/>
                </View>

                {/* User Data */}
                <View style={userStyles.layout}>
                    <DataRow label="Name" value={userData?.name} />
                    <DataRow label="E-Mail" value={userData?.email} />

                    <View style={userStyles.line}/>

                    <DataRow label="Geburtsdatum" value={userData?.birthdate} />
                    <DataRow label="Gewicht" value={userData?.weight} unit=" kg" />
                    <DataRow label="Größe" value={userData?.height} unit=" cm" />
                </View>

                {/* Logout */}
                <View style={userStyles.buttonWrapper}>
                    <UserButton title="Abmelden" onPress={confirmLogout}/>
                </View>

                {/* Loading Overlay */}
                <LoadingOverlay visible={loading} />

            </View>
        </ScrollView>
    );
}