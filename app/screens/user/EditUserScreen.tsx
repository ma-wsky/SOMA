import { useRouter } from "expo-router";
import { View,Text,TextInput,Platform, TouchableWithoutFeedback,Keyboard, ScrollView, KeyboardAvoidingView, Pressable, Alert, Image } from "react-native";
import { useState, useEffect } from 'react';
import { auth, db } from "../../firebaseConfig";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { Colors } from "../../styles/theme";
import { userStyles as styles } from "../../styles/userStyles";
import LoadingOverlay from "../../components/LoadingOverlay";
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import DateTimePicker from '@react-native-community/datetimepicker';


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

    const [profilePic, setProfilePic] = useState<string>();
    const [isUploading, setIsUploading] = useState<boolean>(false)

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [dateObject, setDateObject] = useState(new Date());

    const takePhoto = async ()=> {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

        if (permissionResult.granted === false){
            alert("Kamerazugriff verweigert!");
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
        });

        if (!result.canceled){
            setProfilePic(result.assets[0].uri);
            uploadImage(result.assets[0].uri);
        }
    }

    const uploadImage = async (uri:string)=> {
        try {
            setIsUploading(true);

            // 1. URI in Blob umwandeln
            const response = await fetch(uri);
            const blob = await response.blob();

            // 2. Referenz in Firebase Storage erstellen
            const storage = getStorage();
            const filename = `photos/${Date.now()}.jpg`;
            const storageRef = ref(storage, filename);

            // 3. Hochladen
            await uploadBytes(storageRef, blob);

            console.log("Upload erfolgreich!");

            // 4. Download-URL erhalten (optional, um sie in der DB zu speichern)
            const downloadURL = await getDownloadURL(storageRef);
            console.log("Bild verfügbar unter:", downloadURL);

            const user = auth.currentUser;
            if (!user) return;
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
                profilePicture: downloadURL,
            })

            console.log("URL im User-Feld gespeichert!");
        } catch (error) {
            console.error(error);
            alert("Upload fehlgeschlagen.");
        }finally{
            setIsUploading(false);
        }
    }


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
                const userRef = doc(db, "users", user.uid);
                const snapshot = await getDoc(userRef);

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

                    setProfilePic(data.profilePicture);

                    if (data.birthdate) {
                        // Versuch, den String "TT.MM.JJJJ" zurück in ein Objekt zu wandeln
                        const parts = data.birthdate.split('.');
                        if (parts.length === 3) {
                            const parsedDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
                            setDateObject(parsedDate);
                        }
                    }
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

        if (inputName !== currentName) updates.name = inputName;
        if (inputMail !== currentMail) updates.email = inputMail;
        if (inputBirthdate !== currentBirthdate) updates.birthdate = inputBirthdate;
        if (inputWeight !== currentWeight) updates.weight = inputWeight;
        if (inputHeight !== currentHeight) updates.height = inputHeight;
        updates.updatedAt = serverTimestamp();

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
                            <Pressable
                                style={({pressed}) => [
                                    { opacity: pressed ? 0.7 : 1.0 },
                                ]}
                                onPress={takePhoto}>

                                <Image
                                    source={
                                        typeof profilePic === 'string'
                                            ? { uri: profilePic }
                                            : profilePic
                                    }
                                    style={styles.image}/>

                            </Pressable>
                        </View>


                        {/* Layout of Infos */}
                        <View style={styles.layout}>

                            {/* Name */}
                            <View style={styles.wrapper}>
                                <Text style={styles.text}>Name</Text>

                                <View style={styles.EditFieldWrapper}>
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

                                <View style={styles.EditFieldWrapper}>
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

                                <View style={styles.EditFieldWrapper}>
                                    <Pressable
                                        onPress={() => setShowDatePicker(true)}
                                        style={styles.input}
                                    >
                                        <Text style={[styles.input, !inputBirthdate && { color: '#999' }]}>
                                            {inputBirthdate || "Datum wählen"}
                                        </Text>
                                    </Pressable>
                                </View>


                                {showDatePicker && (
                                    <DateTimePicker
                                        value={dateObject}
                                        mode="date"
                                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                        maximumDate={new Date()} // Verhindert Daten in der Zukunft
                                        onChange={(event, selectedDate) => {
                                            // Android schließt den Picker sofort nach Auswahl
                                            if (Platform.OS === 'android') setShowDatePicker(false);

                                            if (selectedDate) {
                                                setDateObject(selectedDate);

                                                // Formatierung für die Anzeige (TT.MM.JJJJ)
                                                const formatted = selectedDate.toLocaleDateString('de-DE', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric'
                                                });

                                                setInputBirthdate(formatted);
                                            }
                                        }}
                                    />
                                )}
                            </View>

                            {/* Weight */}
                            <View style={styles.wrapper}>
                                <Text style={styles.text}>Gewicht</Text>

                                <View style={styles.EditFieldWrapper}>
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

                                <View style={styles.EditFieldWrapper}>
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