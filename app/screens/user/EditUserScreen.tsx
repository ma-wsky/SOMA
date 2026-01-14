import { useRouter } from "expo-router";
import { View,Text,TextInput,Platform, TouchableWithoutFeedback,Keyboard, ScrollView, KeyboardAvoidingView, Pressable, Alert, Image } from "react-native";
import { useState, useEffect } from 'react';
import { auth, db } from "../../firebaseConfig";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { userStyles } from "../../styles/userStyles";
import LoadingOverlay from "../../components/LoadingOverlay";
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import DateTimePicker from '@react-native-community/datetimepicker';
import { UserButton } from "../../components/user/userButton"
import { validateEmail } from "../../utils/user/validateEmail"

const EditRow = ({ label, value, onChangeText, placeholder, keyboardType = "default", isPressable = false, onPress = () => {} }: any) => (
    <View style={userStyles.rowWrapper}>
        <Text style={userStyles.text}>{label}</Text>
        <View style={userStyles.EditFieldWrapper}>
            {isPressable ? (
                <Pressable onPress={onPress} style={userStyles.input}>
                    <Text style={[userStyles.input, !value && { color: '#999' }]}>{value || placeholder}</Text>
                </Pressable>
            ) : (
                <TextInput
                    style={userStyles.input}
                    placeholder={placeholder}
                    value={value}
                    onChangeText={onChangeText}
                    keyboardType={keyboardType}
                />
            )}
        </View>
    </View>
);

export default function EditUserScreen() {

    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        birthdate: "",
        weight: "",
        height: "",
        profilePicture: ""
    });

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [dateObject, setDateObject] = useState(new Date());

    const takePhoto = async ()=> {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

        if (permissionResult.granted === false){
            Alert.alert("Kamera", "Zugriff verweigert");
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled){
            await handleUpload(result.assets[0].uri);
        }
    }

    const handleUpload = async (uri:string)=> {
        try {
            setLoading(true);

            const response = await fetch(uri);
            const blob = await response.blob();

            const storage = getStorage();
            const filename = `photos/${Date.now()}.jpg`;
            const storageRef = ref(storage, filename);

            await uploadBytes(storageRef, blob);
            const url = await getDownloadURL(storageRef);

            setFormData(prev => ({ ...prev, profilePicture: url }));
            await updateDoc(doc(db, "users", auth.currentUser!.uid), { profilePicture: url });
        } catch (error) {
            console.error(error);
            Alert.alert("Upload Fehler", "Bild konnte nicht gespeichert werden.");
        } finally {
            setLoading(false);
        }
    }


    useEffect(() => {
        const loadUserData = async () => {
            const user = auth.currentUser;
            if (!user) {
                console.error("Kein User angemeldet.");
                return;
            }
            setLoading(true);

            try {
                const docRef = doc(db, "users", user.uid);
                const snapshot = await getDoc(docRef);

                if (snapshot.exists()) {
                    const data = snapshot.data();
                    setFormData({
                        name: data.name || "",
                        email: data.email || "",
                        birthdate: data.birthdate || "",
                        weight: data.weight?.toString() || "",
                        height: data.height?.toString() || "",
                        profilePicture: data.profilePicture || ""
                    });

                    if (data.birthdate) {
                        const parts = data.birthdate.split('.');
                        if (parts.length === 3) {
                            const parsedDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
                            setDateObject(parsedDate);
                        }
                    }
                }
            } catch (e) {
                console.error("Fehler beim Laden:", e);
                Alert.alert("Fehler", "Daten konnten nicht geladen werden.");
            }finally {
                setLoading(false);
            }
        };
        loadUserData();
    }, []);

    const saveChanges = async () => {
        if (!validateEmail(formData.email)){
            Alert.alert("Eingabe prüfen", "Bitte gib eine gültige E-Mail-Adresse ein.");
            return;
        }
        setLoading(true);
        try {
            const userRef = doc(db, "users", auth.currentUser!.uid);
            await updateDoc(userRef, {
                ...formData,
                updatedAt: serverTimestamp(),
            });
            Alert.alert("Erfolg", "Profil aktualisiert.");
        } catch (e) {
            Alert.alert("Fehler", "Speichern fehlgeschlagen.");
        } finally {
            setLoading(false);
            router.replace("/(tabs)/UserScreenProxy");
        }
    }

    return (
        // iOS verschiebt, Android passt Höhe an
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 10 }} keyboardShouldPersistTaps="handled">
                    {/* Screen */}
                    <View style={userStyles.editUserContainer}>

                        {/* Save Button */}
                        <View style={userStyles.buttonWrapper}>
                            <UserButton title="Speichern" onPress={saveChanges}/>
                        </View>

                        {/* Profile Picture */}
                        <Pressable onPress={takePhoto} style={userStyles.profilePictureWrapper}>
                            <Image
                                source={formData.profilePicture ? { uri: formData.profilePicture } : require('../../assets/default-profile-picture/default-profile-picture.jpg')}
                                style={userStyles.profilePicture}
                            />
                        </Pressable>

                        {/* Layout of Infos */}
                        <View style={userStyles.layout}>
                            <EditRow
                                label="Name"
                                value={formData.name}
                                onChangeText={(t:any) => setFormData({...formData, name: t})}
                                placeholder="Name"/>

                            <EditRow
                                label="E-Mail"
                                value={formData.email}
                                onChangeText={(t:any) => setFormData({...formData, email: t})}
                                placeholder="E-Mail"/>

                            <View style={userStyles.line}/>

                            <EditRow
                                label="Geburtsdatum"
                                value={formData.birthdate}
                                isPressable
                                onPress={() => setShowDatePicker(true)}
                                placeholder="Datum wählen"/>

                            <EditRow
                                label="Gewicht"
                                value={formData.weight}
                                onChangeText={(t:any) => setFormData({...formData, weight: t})}
                                placeholder="kg"
                                keyboardType="numeric"/>

                            <EditRow
                                label="Größe"
                                value={formData.height}
                                onChangeText={(t:any) => setFormData({...formData, height: t})}
                                placeholder="cm"
                                keyboardType="numeric"/>
                        </View>

                        {showDatePicker && (
                            <DateTimePicker
                                value={dateObject}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                maximumDate={new Date()}
                                onChange={(event, date) => {
                                    if (Platform.OS === 'android') setShowDatePicker(false);
                                    if (date) {
                                        setDateObject(date);
                                        const fmt = date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
                                        setFormData({...formData, birthdate: fmt});
                                    }
                                }}
                            />
                        )}
                    </View>

                    {/* Loading Overlay */}
                    <LoadingOverlay visible={loading} />

                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}