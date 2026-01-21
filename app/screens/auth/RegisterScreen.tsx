import {useRouter} from "expo-router";
import { Text, View, Alert, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useState } from "react";
import { db, auth } from "@/firebaseConfig";
import { createUserWithEmailAndPassword, EmailAuthProvider, linkWithCredential } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { authStyles } from "@/styles/authStyles";
import LoadingOverlay from "@/components/LoadingOverlay";
import { useGuestLogin } from "@/hooks/useGuestLogin";
import { AuthButton } from "@/components/auth/authButton"
import { DividingLine } from "@/components/auth/dividingLine";
import { AuthInput } from "@/components/auth/authInput"
import { getAuthErrorMessage } from "@/utils/auth/authErrors"


export default function RegisterScreen() {

    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordAgain, setPasswordAgain] = useState("");
    const [loading, setLoading] = useState(false);
    const { isGuestLoading } = useGuestLogin();

    const handleRegister = async () => {
        if (!email || !password) {
            Alert.alert("Fehler", "Bitte fülle alle Felder aus.");
            return;
        }
        if (password !== passwordAgain){
            Alert.alert("Fehler", "Die Passwörter müssen gleich sein.");
            return;
        }
        setLoading(true);

        try {
            const currentUser = auth.currentUser;
            let finalUser;

            if (currentUser && currentUser.isAnonymous){
                // gast upgrade
                const credential = EmailAuthProvider.credential(email.trim(), password.trim());
                const userCredential = await linkWithCredential(currentUser, credential);
                finalUser = userCredential.user;
            } else{
                // neuer user
                const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password.trim());
                finalUser = userCredential.user;
            }

            await setDoc(doc(db, "users", finalUser.uid), {
                name: "",
                email: email.trim().toLowerCase(),
                birthdate: "",
                height: null,
                weight: null,
                updatedAt: serverTimestamp(),
                createdAt: serverTimestamp(),
                reminderTime: { hour: 20, minute: 0 },
                reminderDays: [],
            }, { merge: true });

            Alert.alert("Geschafft!", "Registrierung erfolgreich.");
            router.replace("/(tabs)/HomeScreenProxy");

        } catch (error: any) {
            const message = getAuthErrorMessage(error.code);
            Alert.alert("Fehler", message);
        }finally {
            setLoading(false);
        }
    };

    return(
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"} // iOS verschiebt, Android passt Höhe an
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 10 }} keyboardShouldPersistTaps="handled">
                    <View style={authStyles.container}>

                        {/* Title */}
                        <View style={authStyles.titleWrapper}>
                            <Text style={authStyles.appnameText}>SOMA</Text>
                            <Text style={authStyles.titleText}>Dein Körper. Dein Fortschritt.</Text>
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

                            {/* Password again*/}
                            <AuthInput placeholder="Passwort wiederholen"
                                       value={passwordAgain}
                                       onChangeText={setPasswordAgain}
                                       iconName="lock-closed-outline"
                                       isPassword={true}
                            />

                        </View>

                        {/* Register */}
                        <View style={authStyles.buttonWrapper}>
                            <AuthButton title="Registrieren"
                                        onPress={handleRegister}
                            />
                        </View>

                        {/* Bereits ein Konto */}
                        <View style={{marginTop: 40,}}>

                            <DividingLine text="Bereits ein Konto?" />

                            {/* to LoginScreen */}
                            <AuthButton title="Einloggen"
                                        onPress={() => router.replace("/screens/auth/LoginScreen")}
                                        variant="secondary"
                            />
                        </View>

                        {/* Loading Overlay */}
                        <LoadingOverlay visible={loading || isGuestLoading} />

                    </View>
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}