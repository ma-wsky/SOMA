import { useRouter } from "expo-router";
import { Text, View, Pressable, TextInput,TouchableOpacity, Alert } from 'react-native';
import {useState} from "react";
import { auth } from "../firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors } from "../theme"
import { authStyles as styles } from "../styles/authStyles";
import LoadingOverlay from "../components/LoadingOverlay";


export default function LoginScreen(){

    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [hidden, setHidden] = useState(true);
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setLoading(true);
        try{
            await signInWithEmailAndPassword(auth, email.trim(), password.trim());
            Alert.alert("Geschafft!", "Login erfolgreich.");
            router.replace("/(tabs)/HomeScreenProxy");
        }catch (error: any){
            console.error("Login error:", error.code);

            switch (error.code) {
                case "auth/invalid-credential":
                    Alert.alert("Fehler", "Das Passwort oder die E-Mail sind nicht korrekt.");
                    break;
                case "auth/missing-password":
                    Alert.alert("Fehler", "Bitte Passwort eingeben.");
                    break;
                case "auth/invalid-email":
                    Alert.alert("Fehler", "Bitte gib eine gültige E-Mail-Adresse ein.");
                    break;
                case "auth/user-disabled":
                    Alert.alert("Fehler", "Dieser Account wurde deaktiviert.");
                    break;
                case "auth/too-many-requests":
                    Alert.alert("Fehler", "Zu viele Versuche. Bitte versuche es später erneut.");
                    break;
                default:
                    Alert.alert("Fehler", "Ein unbekannter Fehler ist aufgetreten.");
            }
        }finally {
            setLoading(false);
        }
    }

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

            {/* Login */}
            <View style={styles.buttonWrapper}>
                <Pressable
                    onPress={handleLogin}
                    style={({ pressed }) => [
                        styles.button,
                        {backgroundColor: pressed ? Colors.secondary : Colors.primary},
                        {borderColor: pressed ? Colors.secondary : Colors.primary}
                    ]}
                >
                    <Text style={styles.buttonText}>Einloggen</Text>
                </Pressable>
            </View>

            {/* Noch kein Konto */}
            <View style={{marginTop: 40,}}>
                <View style={{flexDirection:"row",justifyContent:"space-around",alignItems: "center"}}>
                    <View style={styles.line}/>
                    <Text style={styles.smallText}>Noch kein Konto?</Text>
                    <View style={styles.line}/>
                </View>

                {/* to RegisterScreen */}
                <Pressable
                    onPress={() => router.replace("/screens/RegisterScreen")}
                    style={({ pressed }) => [
                        styles.secondaryBotton,
                        {backgroundColor: pressed ? "#eee" : 'transparent'},
                        {borderColor: pressed ? Colors.secondary : Colors.primary}
                    ]}
                >
                    <Text style={styles.secondaryButtonText}>Konto erstellen</Text>
                </Pressable>
            </View>

            {/* Loading Overlay */}
            <LoadingOverlay visible={loading} />

        </View>
    );
}