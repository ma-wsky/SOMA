import {useRouter} from "expo-router";
import { Text, View, Pressable, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useState } from "react";
import { db, auth } from "../firebaseConfig";
import { createUserWithEmailAndPassword, EmailAuthProvider, linkWithCredential } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors } from "../styles/theme";
import { authStyles as styles } from "../styles/authStyles";
import LoadingOverlay from "../components/LoadingOverlay";


export default function RegisterScreen() {

    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [hidden, setHidden] = useState(true);
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        setLoading(true);
        try {

            const user = auth.currentUser;

            if (!user) {
                Alert.alert("Fehler", "Kein Benutzer vorhanden.");
                return;
            }

            if (user.isAnonymous){
                const credential = EmailAuthProvider.credential(email, password);
                await linkWithCredential(user, credential);
            } else{
                await createUserWithEmailAndPassword(auth, email, password);
            }

            await setDoc(doc(db, "users", user.uid), {
                name: "",
                email: user.email,
                birthdate: "",
                height: null,
                weight: null,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            })

            console.log("User registered and document created.");
            Alert.alert("Geschafft!", "Registrierung erfolgreich.");
            router.replace("/(tabs)/HomeScreenProxy");

        } catch (error: any) {
            console.error("Register error:", error.code);

            switch (error.code) {
                case "auth/missing-email":
                    Alert.alert("Fehler", "Bitte E-Mail eingeben.");
                    break;
                case "auth/missing-password":
                    Alert.alert("Fehler", "Bitte Passwort eingeben.");
                    break;
                case "auth/invalid-email":
                    Alert.alert("Fehler", "Bitte eine gültige E-Mail-Adresse eingeben.");
                    break;
                case "auth/email-already-in-use":
                    Alert.alert("Fehler", "Email ist bereits an ein Konto gebunden.");
                    break;
                case "auth/weak-password":
                    Alert.alert("Fehler", "Passwort nicht stark genug.");
                    break;
                default:
                    Alert.alert("Fehler", "Ein unbekannter Fehler ist aufgetreten.");
            }
        }finally {
            setLoading(false);
        }
    };

    return(
        <View style={styles.container}>

            {/* Title */}
            <View style={styles.titleWrapper}>
                <Text style={styles.title}>Willkommen bei</Text>
                <Text style={styles.appname}>APPNAME!</Text>
            </View>

            {/* Inputs */}
            <View style={styles.inputs}>

                {/* E-Mail */}
                <View style={styles.inputRow}>
                    <Ionicons
                        name="person-outline"
                        size={28}
                        color="#555"
                        style={styles.icon}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="E-Mail"
                        value={email}
                        onChangeText={setEmail}
                    />
                </View>

                {/* Password */}
                <View style={styles.inputRow}>
                    <Ionicons
                        name="lock-closed-outline"
                        size={28}
                        color="#555"
                        style={styles.icon}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Passwort"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={hidden}/>

                    <TouchableOpacity onPress={() => setHidden(!hidden)}>
                        <Ionicons
                            name={hidden ? "eye-outline" : "eye-off-outline"}
                            size={24}
                            color="#555"
                            style={styles.eyeIcon}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Register */}
            <View style={styles.buttonWrapper}>
                <Pressable
                    onPress={handleRegister}
                    style={({ pressed }) => [
                        styles.button,
                        {backgroundColor: pressed ? Colors.secondary : Colors.primary}
                    ]}
                >
                    <Text style={styles.buttonText}>Registrieren</Text>
                </Pressable>
            </View>

            {/* Bereits ein Konto */}
            <View style={{marginTop: 40,}}>
                <View style={{flexDirection:"row",justifyContent:"space-around",alignItems: "center"}}>
                    <View style={styles.line}/>
                    <Text style={styles.smallText}>Bereits ein Konto?</Text>
                    <View style={styles.line}/>
                </View>

                {/* to LoginScreen */}
                <Pressable
                    onPress={() => router.replace("/screens/LoginScreen")}
                    style={({ pressed }) => [
                        styles.secondaryBotton,
                        {backgroundColor: pressed ? "#eee" : 'transparent'},
                        {borderColor: pressed ? Colors.secondary : Colors.primary}
                    ]}
                >
                    <Text style={styles.secondaryButtonText}>Einloggen</Text>
                </Pressable>
            </View>

            {/* Loading Overlay */}
            <LoadingOverlay visible={loading} />

        </View>
    );
}