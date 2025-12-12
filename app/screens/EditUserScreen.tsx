import { useRouter } from "expo-router";
import { View,Text,TextInput,Platform, TouchableWithoutFeedback,Keyboard, ScrollView, KeyboardAvoidingView,StyleSheet, Pressable, Alert } from "react-native";
import { useState, useEffect } from 'react';
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Colors } from "../styles/theme";
import { userStyles as styles } from "../styles/userStyles";
import LoadingOverlay from "../components/LoadingOverlay";


export default function EditUserScreen() {

    const router = useRouter();

    const [loading, setLoading] = useState(false);

    const [currentName, setCurrentName] = useState<string>("");
    const [inputName, setInputName] = useState<string>("");

    const [currentMail, setCurrentMail] = useState<string>("");
    const [inputMail, setInputMail] = useState<string>("");

    const [currentBirthdate, setCurrentBirthdate] = useState<string>("");
    const [inputBirthdate, setInputBirthdate] = useState<string>("");

    const [currentWeight, setCurrentWeight] = useState<string>("");
    const [inputWeight, setInputWeight] = useState<string>("");

    const [currentHeight, setCurrentHeight] = useState<string>("");
    const [inputHeight, setInputHeight] = useState<string>("");


    useEffect(() => {
        const loadUserData = async () => {
            setLoading(true);
            const user = auth.currentUser;
            if (!user) {
                console.error("Kein User angemeldet.");
                setLoading(false);
                return;
            }

            try {
                const ref = doc(db, "users", user.uid);
                const snapshot = await getDoc(ref);

                if (snapshot.exists()) {
                    const data = snapshot.data();
                    setCurrentName(data.name || "");
                    setInputName(data.name || "");

                    setCurrentMail(data.email || "");
                    setInputMail(data.email || "");

                    setCurrentBirthdate(data.birthdate || "");
                    setInputBirthdate(data.birthdate || "");

                    setCurrentWeight(data.weight || "");
                    setInputWeight(data.weight || "");

                    setCurrentHeight(data.height || "");
                    setInputHeight(data.height || "");
                }
            } catch (e) {
                console.error("Fehler beim Laden:", e);
            }

            setLoading(false);
        };

        loadUserData();
    }, []);

    const saveChanges = async () => {

        setLoading(true);

        const user = auth.currentUser;
        if (!user) return;

        const uid = auth.currentUser?.uid;
        if (!uid) {
            console.error("No UID found – user is not logged in.");
            return;
        }
        const userRef = doc(db, "users", uid);

        const updates: any = {};

        if (inputName !== currentName) updates.name = inputName
        if (inputMail !== currentMail) updates.email = inputMail
        if (inputBirthdate !== currentBirthdate) updates.birthdate = inputBirthdate
        if (inputWeight !== currentWeight) updates.weight = inputWeight
        if (inputHeight !== currentHeight) updates.height = inputHeight

        try {
            await updateDoc(userRef, updates);

            Alert.alert("Gespeichert", "Deine Änderungen wurden übernommen.");
        } catch (e) {
            console.error("Update-Fehler:", e);
            Alert.alert("Fehler", "Die Änderungen konnten nicht gespeichert werden.");
        }finally {
            setLoading(false);
        }

        router.replace("/(tabs)/UserScreenProxy");
    }

    return (
        // for scrolling up screen when opening keyboard
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"} // iOS verschiebt, Android passt Höhe an
        >
            {/* Closing Keyboard when pressing outside */}
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>

                {/* Scrolling Screen while Keyboard open */}
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1, padding: 10 }}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Screen */}
                    <View style={styles.container}>

                        {/* Save Button */}
                        <View style={styles.buttonWrapper}>
                            <Pressable
                                onPress={saveChanges}
                                style={({ pressed }) => [
                                    styles.button,
                                    {backgroundColor: pressed ? Colors.secondary : Colors.primary},
                                    {borderColor: pressed ? Colors.secondary : Colors.primary}
                                ]}
                            >
                                <Text style={styles.buttonText}>Speichern</Text>
                            </Pressable>
                        </View>

                        {/* Profile Picture */}
                        <View style={styles.circleWrapper}>
                            <View style={styles.circle}></View>
                        </View>

                        {/* Layout of Infos */}
                        <View style={styles.layout}>

                            {/* Name */}
                            <View style={styles.wrapper}>
                                <Text style={styles.text}>Name</Text>

                                <View style={styles.fieldWrapper}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder={currentName || "Name eingeben"}
                                        value={inputName}
                                        onChangeText={setInputName}/>
                                </View>

                            </View>

                            {/* E-Mail */}
                            <View style={styles.wrapper}>
                                <Text style={styles.text}>E-Mail</Text>

                                <View style={styles.fieldWrapper}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder={currentMail || "E-Mail eingeben"}
                                        value={inputMail}
                                        onChangeText={setInputMail}/>
                                </View>
                            </View>

                            <View style={styles.line}/>

                            {/* Birthdate */}
                            <View style={styles.wrapper}>
                                <Text style={styles.text}>Geburtsdatum</Text>

                                <View style={styles.fieldWrapper}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder={currentBirthdate || "Datum eingeben"}
                                        value={inputBirthdate}
                                        onChangeText={setInputBirthdate}/>
                                </View>
                            </View>

                            {/* Weight */}
                            <View style={styles.wrapper}>
                                <Text style={styles.text}>Gewicht</Text>

                                <View style={styles.fieldWrapper}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder={currentWeight || "Gewicht eingeben"}
                                        value={inputWeight}
                                        onChangeText={setInputWeight}
                                        keyboardType="numeric"/>
                                </View>
                            </View>

                            {/* Height */}
                            <View style={styles.wrapper}>
                                <Text style={styles.text}>Größe</Text>

                                <View style={styles.fieldWrapper}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder={currentHeight || "Größe eingeben"}
                                        value={inputHeight}
                                        onChangeText={setInputHeight}
                                        keyboardType="numeric"/>
                                </View>
                            </View>

                            {/* Loading Overlay */}
                            <LoadingOverlay visible={loading} />

                        </View>
                    </View>
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}