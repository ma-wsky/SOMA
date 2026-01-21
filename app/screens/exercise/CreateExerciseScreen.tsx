import { router } from "expo-router";
import { View,Text,TextInput,Platform, TouchableWithoutFeedback,Keyboard, ScrollView, KeyboardAvoidingView, Pressable, Alert, Image } from "react-native";
import { useState } from "react";
import { TopBar } from "@/components/TopBar"
import { auth, db } from "@/firebaseConfig";
import { collection, addDoc, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import LoadingOverlay from "@/components/LoadingOverlay";
import { exerciseStyles } from "@/styles/exerciseStyles";
import { useImagePicker } from "@/hooks/useImagePicker"
import { uploadImage } from "@/utils/uploadImage"
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/styles/theme";

export default function CreateExerciseScreen() {

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        muscles: "",
        equipment: "",
        instructions: ""
    });
    const { image, pickImage } = useImagePicker();
    const [hasImage, setHasImage] = useState<boolean>(false);

    const handleTakePhoto = async () => {
        const uri = await pickImage();
        if (uri) setHasImage(true);
    }

    const saveChanges = async () => {

        if (formData.name.trim() === "") {
            Alert.alert("Fehler", "Bitte gib einen Namen für die Übung ein.");
            return;
        }

        const uid = auth.currentUser?.uid;

        if (!uid) {
            console.error("No UID found.");
            return;
        }
        setLoading(true);

        try {
            const userExerciseCollection = collection(db, "users", uid, "exercises");

            const q = query(
                userExerciseCollection,
                where("name", "==", formData.name.trim()),
            );
            const snapshot = await getDocs(q);

            let downloadURL = null;
            if (hasImage && image) {
                const path = `users/${uid}/exercises/${Date.now()}.jpg`;
                downloadURL = await uploadImage(image, path);
            }

            if(snapshot.empty){
                await addDoc(userExerciseCollection, {
                    isGlobal: false,
                    name: formData.name.trim(),
                    muscleGroup: formData.muscles,
                    equipment: formData.equipment,
                    instructions: formData.instructions,
                    image: downloadURL,
                    createdAt: new Date()
                });

                Alert.alert("Erfolg", "Übung wurde erstellt.");
                router.back();
            }else{
                Alert.alert(
                    "Übung ändern",
                    `Es existiert bereits eine Übung mit dem Namen "${formData.name}". Möchten Sie die Übung aktualisieren?`,
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

                                if (formData.muscles !== data.muscleGroup && formData.muscles !== "") updates.muscleGroup = formData.muscles;
                                if (formData.equipment !== data.equipment && formData.equipment !== "") updates.equipment = formData.equipment;
                                if (formData.instructions !== data.instructions && formData.instructions !== "") updates.instructions = formData.instructions;
                                if (hasImage && image) {
                                    const path = `users/${uid}/exercises/${Date.now()}.jpg`;
                                    downloadURL = await uploadImage(image, path);
                                    updates.image = downloadURL;
                                }

                                if(Object.keys(updates).length > 0){
                                    await updateDoc(docRef, updates);
                                }

                                Alert.alert("Gespeichert", "Deine Änderungen wurden übernommen.");
                                router.back();
                            },
                        },
                    ],
                    { cancelable: true }
                );
            }
        } catch (e) {
            console.error(e);
            Alert.alert("Fehler", "Speichern fehlgeschlagen.");
        }finally {
            setLoading(false);
        }
    }

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        
        <KeyboardAvoidingView
            style={{ flex: 1,backgroundColor:Colors.background }}
            behavior={Platform.OS === "ios" ? "padding" : "height"} // iOS verschiebt, Android passt Höhe an
        ><SafeAreaView style={{backgroundColor:Colors.background}}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} style={{backgroundColor:Colors.background}}>
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1, backgroundColor:Colors.background }}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Screen */}
                    <View style={exerciseStyles.container}>

                        {/* Top Bar */}
                        <TopBar isSheet={false}
                                leftButtonText={"Zurück"}
                                titleText={"Erstellen"}
                                rightButtonText={"Speichern"}
                                onLeftPress={() => router.back()}
                                onRightPress={saveChanges}
                        />

                        {/* Exercise Picture */}
                        <View style={exerciseStyles.picWrapper}>
                            <Pressable
                                onPress={handleTakePhoto}
                                style={({pressed}) => [
                                    { opacity: pressed ? 0.7 : 1.0 },
                                ]}
                            >
                                <Image
                                    source={image ? { uri: image } : require('@/assets/default-exercise-picture/users.png')}
                                    style={exerciseStyles.picture}/>

                                {!hasImage && (
                                    <View style={exerciseStyles.textOverlay}>
                                        <Text style={exerciseStyles.picText}>Hinzufügen</Text>
                                    </View>
                                )}
                            </Pressable>
                        </View>

                        {/* Layout of Infos */}
                        <View style={exerciseStyles.layout}>

                            {/* Name */}
                            <View style={exerciseStyles.wrapper}>
                                <Text style={exerciseStyles.text}>Name</Text>

                                <View style={exerciseStyles.fieldWrapper}>
                                    <TextInput
                                        style={exerciseStyles.input}
                                        placeholder={"Name der Übung eingeben"}
                                        value={formData.name}
                                        onChangeText={(val) => handleInputChange("name", val)}/>
                                </View>
                            </View>

                            {/* Muskeln */}
                            <View style={exerciseStyles.wrapper}>
                                <Text style={exerciseStyles.text}>Muskeln</Text>

                                <View style={exerciseStyles.fieldWrapper}>
                                    <TextInput
                                        style={exerciseStyles.input}
                                        placeholder={"welche Muskeln trainiert diese Übung"}
                                        value={formData.muscles}
                                        onChangeText={(val) => handleInputChange("muscles", val)}/>
                                </View>
                            </View>

                            {/* Equipment */}
                            <View style={exerciseStyles.wrapper}>
                                <Text style={exerciseStyles.text}>Ausrüstung</Text>

                                <View style={exerciseStyles.fieldWrapper}>
                                    <TextInput
                                        style={exerciseStyles.input}
                                        placeholder={"Ausrüstung angeben"}
                                        value={formData.equipment}
                                        onChangeText={(val) => handleInputChange("equipment", val)}/>
                                </View>
                            </View>

                            {/* Instructions */}
                            <View style={exerciseStyles.wrapper}>
                                <Text style={exerciseStyles.text}>Anleitung</Text>

                                <View style={exerciseStyles.fieldWrapper}>
                                    <TextInput
                                        style={exerciseStyles.input}
                                        placeholder={"Anleitung angeben"}
                                        value={formData.instructions}
                                        onChangeText={(val) => handleInputChange("instructions", val)}
                                        multiline
                                    />
                                </View>
                            </View>

                        </View>

                        {/* Loading Overlay */}
                        <LoadingOverlay visible={loading} />

                    </View>
                </ScrollView>
            </TouchableWithoutFeedback>
        </SafeAreaView>
        </KeyboardAvoidingView>
        
    );
}