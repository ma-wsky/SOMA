import { router } from "expo-router";
import { View,Text,TextInput,Platform, TouchableWithoutFeedback,Keyboard, ScrollView, KeyboardAvoidingView, Pressable, Alert, Image } from "react-native";
import { useState } from "react";
import { TopBar } from "../../components/TopBar"
import { auth, db } from "../../firebaseConfig";
import { collection, addDoc, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import LoadingOverlay from "../../components/LoadingOverlay";
import { exerciseStyles as styles } from "../../styles/exerciseStyles";
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";


export default function CreateExerciseScreen() {

    const [loading, setLoading] = useState(false);

    const[inputName, setInputName] = useState<string>("");
    const[inputMuscles, setInputMuscles] = useState<string>("");
    const[inputEquipment, setInputEquipment] = useState<string>("");
    const[inputInstructions, setInputInstructions] = useState<string>("");
    const [image, setImage] = useState<string>(require('../../assets/default-exercise-picture/default-exercise-picture.jpg'));
    const [hasImage, setHasImage] = useState<boolean>(false);

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
            setImage(result.assets[0].uri);
            setHasImage(true);
            //uploadImage(result.assets[0].uri);
        }
    }

    const uploadImage = async (uri:string)=> {
        try {
            // 1. URI in Blob umwandeln
            const response = await fetch(uri);
            const blob = await response.blob();

            // 2. Referenz in Firebase Storage erstellen
            const storage = getStorage();
            const filename = `exercises/${inputName}.jpg`;
            const storageRef = ref(storage, filename);

            // 3. Hochladen
            await uploadBytes(storageRef, blob);

            console.log("Upload erfolgreich!");

            // 4. Download-URL erhalten (optional, um sie in der DB zu speichern)
            const downloadURL = await getDownloadURL(storageRef);
            console.log("Bild verfügbar unter:", downloadURL);

            const user = auth.currentUser;
            if (!user) return;

            const userExerciseCollection = collection(db, "users", user.uid, "exercises");
            const q = query(
                userExerciseCollection,
                where("name", "==", inputName),
            );
            const snapshot = await getDocs(q);

            const docRef = doc(userExerciseCollection, snapshot.docs[0].id);

            await updateDoc(docRef, {
                image: downloadURL,
            })

            console.log("URL im User-Feld gespeichert!");
        } catch (error) {
            console.error(error);
            alert("Upload fehlgeschlagen.");
        }
    }

    const saveChanges = async () => {

        setLoading(true);

        const user = auth.currentUser;
        if (!user) return;

        const uid = auth.currentUser?.uid;
        if (!uid) {
            console.error("No UID found – user is not logged in.");
            return;
        }

        if(inputName == ""){
            Alert.alert("Fehler", "Name darf nicht leer sein");
            setLoading(false);
            return;
        }

        try {

            const userExerciseCollection = collection(db, "users", uid, "exercises");

            const q = query(
                userExerciseCollection,
                where("name", "==", inputName),
            );
            const snapshot = await getDocs(q);

            if(snapshot.empty){
                await addDoc(userExerciseCollection, {
                    isGlobal: false,
                    name: inputName,
                    muscleGroup: inputMuscles,
                    equipment: inputEquipment,
                    instructions: inputInstructions,
                })

                // upload image
                if (hasImage) await uploadImage(image);

                router.replace("/screens/workout/ExerciseScreen");
                Alert.alert("Gespeichert", "Deine Änderungen wurden übernommen.");

            }else{
                Alert.alert(
                    "Übung ändern",
                    `Es existiert bereits eine Übung mit dem Namen "${inputName}". Möchten Sie die Übung aktualisieren?`,
                    [
                        {
                            text: "Abbrechen",
                            style: "cancel",
                        },
                        {
                            text: "Aktualisieren",
                            style: "destructive",
                            onPress: async () => {
                                const data = snapshot.docs[0].data();
                                const docRef = doc(userExerciseCollection, snapshot.docs[0].id);
                                const updates: any = {};

                                if (inputMuscles !== data.muscleGroup && inputMuscles !== "") updates.muscleGroup = inputMuscles;
                                if (inputEquipment !== data.equipment && inputEquipment !== "") updates.equipment = inputEquipment;
                                if (inputInstructions !== data.instructions && inputInstructions !== "") updates.instructions = inputInstructions;

                                if(Object.keys(updates).length > 0){
                                    await updateDoc(docRef, updates);
                                }

                                router.replace("/screens/workout/ExerciseScreen");
                                Alert.alert("Gespeichert", "Deine Änderungen wurden übernommen.");
                            },
                        },
                    ],
                    { cancelable: true }
                );
            }

        } catch (e) {
            console.error("Update-Fehler:", e);
            Alert.alert("Fehler", "Die Änderungen konnten nicht gespeichert werden.");
        }finally {
            setLoading(false);
        }

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

                        {/* Top Bar */}
                        <TopBar leftButtonText={"Zurück"}
                                titleText={"Übung erstellen"}
                                rightButtonText={"Speichern"}
                                onLeftPress={() => router.back()}
                                onRightPress={saveChanges}
                        ></TopBar>

                        {/* Exercise Picture */}
                        <View style={styles.picWrapper}>
                            <Pressable
                                style={({pressed}) => [
                                    { opacity: pressed ? 0.7 : 1.0 },
                                ]}
                                onPress={takePhoto}>

                                <Image
                                    source={
                                        typeof image === 'string'
                                            ? { uri: image }
                                            : image
                                    }
                                    style={styles.image}/>

                                {/* Die Bedingung für den Text: Nur anzeigen, wenn KEIN Bild da ist */}
                                {typeof image !== 'string' && (
                                    <View style={styles.textOverlay}>
                                        <Text style={styles.picText}>click to add pic</Text>
                                    </View>
                                )}

                            </Pressable>

                        </View>

                        {/* Layout of Infos */}
                        <View style={styles.layout}>

                            {/* Name */}
                            <View style={styles.wrapper}>
                                <Text style={styles.text}>Name</Text>

                                <View style={styles.fieldWrapper}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder={"Name der Übung eingeben"}
                                        value={inputName}
                                        onChangeText={setInputName}/>
                                </View>
                            </View>

                            {/* Muskeln */}
                            <View style={styles.wrapper}>
                                <Text style={styles.text}>Muskeln</Text>

                                <View style={styles.fieldWrapper}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder={"welche Muskeln trainiert diese Übung"}
                                        value={inputMuscles}
                                        onChangeText={setInputMuscles}/>
                                </View>
                            </View>

                            {/* Equipment */}
                            <View style={styles.wrapper}>
                                <Text style={styles.text}>Ausrüstung</Text>

                                <View style={styles.fieldWrapper}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder={"Ausrüstung angeben"}
                                        value={inputEquipment}
                                        onChangeText={setInputEquipment}/>
                                </View>
                            </View>

                            {/* Instructions */}
                            <View style={styles.wrapper}>
                                <Text style={styles.text}>Anleitung</Text>

                                <View style={styles.fieldWrapper}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder={"Anleitung angeben"}
                                        value={inputInstructions}
                                        onChangeText={setInputInstructions}
                                        multiline/>
                                </View>
                            </View>

                        </View>

                        {/* Loading Overlay */}
                        <LoadingOverlay visible={loading} />

                    </View>
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}