import { useRouter } from "expo-router";
import { Text, View, Alert, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform } from 'react-native';
import {useState} from "react";
import { auth } from "../../firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { authStyles } from "../../styles/authStyles";
import LoadingOverlay from "../../components/LoadingOverlay";
import { useGuestLogin } from "../../hooks/useGuestLogin";
import { AuthButton } from "../../components/auth/authButton"
import { DividingLine } from "../../components/auth/dividingLine";
import { AuthInput } from "../../components/auth/authInput"
import { getAuthErrorMessage } from "../../utils/auth/authErrors"


export default function LoginScreen(){

    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { isGuestLoading } = useGuestLogin();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Fehler", "Bitte fülle alle Felder aus.");
            return;
        }
        setLoading(true);

        try{
            await signInWithEmailAndPassword(auth, email.trim(), password.trim());
            Alert.alert("Geschafft!", "Login erfolgreich.");
            router.replace("/(tabs)/HomeScreenProxy");
        }catch (error: any){
            console.error("Login error:", error.code);
            const message = getAuthErrorMessage(error.code);
            Alert.alert("Fehler", message);

        }finally {
            setLoading(false);
        }
    }

    return(
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"} // iOS verschiebt, Android passt Höhe an
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={authStyles.container}>

                    {/* Title */}
                    <View style={authStyles.titleWrapper}>
                        <Text style={authStyles.titleText}>Willkommen bei</Text>
                        <Text style={authStyles.appnameText}>Appname!</Text>
                    </View>

                    {/* Inputs */}
                    <View style={authStyles.authInputsWrapper}>

                        {/* E-Mail */}
                        <AuthInput placeholder="E-Mail"
                                   value={email}
                                   onChangeText={setEmail}
                                   iconName="person-outline"
                                   keyboardType="email-address"
                        />

                        {/* Password */}
                        <AuthInput placeholder="Passwort"
                                   value={password}
                                   onChangeText={setPassword}
                                   iconName="lock-closed-outline"
                                   isPassword={true}
                        />

                    </View>

                    {/* Login */}
                    <View style={authStyles.buttonWrapper}>
                        <AuthButton
                            title="Einloggen"
                            onPress={handleLogin}/>
                    </View>

                    {/* Noch kein Konto */}
                    <View style={{marginTop: 40,}}>

                        <DividingLine text="Noch kein Konto?"/>

                        {/* to RegisterScreen */}
                        <AuthButton title="Konto erstellen"
                                    onPress={() => router.replace("/screens/auth/RegisterScreen")}
                                    variant="secondary"
                        />
                    </View>

                    {/* Loading Overlay */}
                    <LoadingOverlay visible={loading || isGuestLoading} />

                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>

    );
}