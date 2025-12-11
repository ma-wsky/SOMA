import { useRouter } from "expo-router";
import { Text, View, Pressable, Alert } from 'react-native';
import {useEffect, useState} from "react";
import { auth } from "../firebaseConfig";
import { signInAnonymously } from "firebase/auth";
import { Colors } from "../styles/theme";
import { authStyles as styles } from "../styles/authStyles";
import LoadingOverlay from "../components/LoadingOverlay";


export default function LoginScreen(){

    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // is user already logged in
    useEffect(() => {
        if (auth.currentUser) {
            router.replace("/(tabs)/HomeScreenProxy");
        }
    }, []);

    const handleGuestLogin = async () => {
        setLoading(true);
        try{
            await signInAnonymously(auth);
            Alert.alert("Geschafft!", "Als Gast angemeldet.");
            router.replace("/(tabs)/HomeScreenProxy");
        }catch (error: any){
            console.error("Login error:", error.code);
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

            {/* Buttons */}
            <View style={styles.buttonWrapper}>
                {/* Register */}
                <Pressable
                    onPress={() => router.replace("/screens/RegisterScreen")}
                    style={({ pressed }) => [
                        styles.button,
                        {backgroundColor: pressed ? Colors.secondary : Colors.primary}
                    ]}
                >
                    <Text style={styles.buttonText}>Konto erstellen</Text>
                </Pressable>

                <View style={{flexDirection:"row",justifyContent:"space-around",alignItems: "center"}}>
                    <View style={styles.line}/>
                    <Text style={styles.text}>Oder</Text>
                    <View style={styles.line}/>
                </View>

                {/* Guest Login */}
                <Pressable
                    onPress={handleGuestLogin}
                    style={({ pressed }) => [
                        styles.button,
                        {backgroundColor: pressed ? Colors.secondary : Colors.primary}
                    ]}
                >
                    <Text style={styles.buttonText}>Als Gast beitreten</Text>
                </Pressable>
            </View>

            {/* Bereits ein Konto */}
            <View style={{marginTop: 50,}}>
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