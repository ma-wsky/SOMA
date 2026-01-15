import { useRouter } from "expo-router";
import { View, Text, TextInput, Platform, TouchableWithoutFeedback, Keyboard, ScrollView, KeyboardAvoidingView, Pressable, Alert, Image } from "react-native";
import { useState, useEffect } from 'react';
import { auth, db } from "../../firebaseConfig";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { userStyles } from "../../styles/userStyles";
import LoadingOverlay from "../../components/LoadingOverlay";
import DateTimePicker from '@react-native-community/datetimepicker';
import { UserButton } from "../../components/user/userButton";
import { validateEmail } from "../../utils/user/validateEmail";
import { useImagePicker } from "@/app/hooks/useImagePicker";
import { uploadImage } from "@/app/utils/uploadImage";

const EditRow = ({ label, value, onChangeText, placeholder, keyboardType = "default", isPressable = false, onPress = () => {} }: any) => (
    <View style={userStyles.rowWrapper}>
        <Text style={userStyles.text}>{label}</Text>
        <View style={userStyles.EditFieldWrapper}>
            {isPressable ? (
                <Pressable onPress={onPress} style={userStyles.input}>
                    <Text style={[userStyles.input, !value && { color: '#999' }, { paddingTop: 12 }]}>
                        {value || placeholder}
                    </Text>
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
    const { image, pickImage } = useImagePicker(); // Unser Custom Hook

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

    useEffect(() => {
        const loadUserData = async () => {
            const user = auth.currentUser;
            if (!user) return;

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
                            setDateObject(new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0])));
                        }
                    }
                }
            } catch (e) {
                console.error(e);
                Alert.alert("Fehler", "Daten konnten nicht geladen werden.");
            } finally {
                setLoading(false);
            }
        };
        loadUserData();
    }, []);

    const saveChanges = async () => {
        if (!validateEmail(formData.email)) {
            Alert.alert("Eingabe prüfen", "Bitte gib eine gültige E-Mail-Adresse ein.");
            return;
        }

        setLoading(true);
        try {
            const uid = auth.currentUser!.uid;
            let finalPhotoUrl = formData.profilePicture;

            if (image) {
                const path = `users/${uid}/profile_${Date.now()}.jpg`;
                const downloadURL = await uploadImage(image, path);
                if (downloadURL) {
                    finalPhotoUrl = downloadURL;
                }
            }

            const userRef = doc(db, "users", uid);
            await updateDoc(userRef, {
                name: formData.name,
                email: formData.email,
                birthdate: formData.birthdate,
                weight: parseFloat(formData.weight) || 0,
                height: parseFloat(formData.height) || 0,
                profilePicture: finalPhotoUrl,
                updatedAt: serverTimestamp(),
            });

            Alert.alert("Erfolg", "Profil aktualisiert.");
            router.replace("/(tabs)/UserScreenProxy");
        } catch (e) {
            console.error(e);
            Alert.alert("Fehler", "Speichern fehlgeschlagen.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 10 }} keyboardShouldPersistTaps="handled">

                    <View style={userStyles.editUserContainer}>

                        <View style={userStyles.buttonWrapper}>
                            <UserButton title="Speichern" onPress={saveChanges}/>
                        </View>

                        {/* Profile Picture */}
                        <Pressable onPress={() => pickImage()} style={userStyles.profilePictureWrapper}>
                            <Image
                                source={
                                    image
                                        ? { uri: image }
                                        : formData.profilePicture
                                            ? { uri: formData.profilePicture }
                                            : require('../../assets/default-profile-picture/default-profile-picture.jpg')
                                }
                                style={userStyles.profilePicture}
                            />
                        </Pressable>

                        {/* Layout of Infos */}
                        <View style={userStyles.layout}>
                            <EditRow
                                label="Name"
                                value={formData.name}
                                onChangeText={(t: string) => setFormData({...formData, name: t})}
                                placeholder="Name"/>

                            <EditRow
                                label="E-Mail"
                                value={formData.email}
                                onChangeText={(t: string) => setFormData({...formData, email: t})}
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
                                onChangeText={(t: string) => setFormData({...formData, weight: t})}
                                placeholder="kg"
                                keyboardType="numeric"/>

                            <EditRow
                                label="Größe"
                                value={formData.height}
                                onChangeText={(t: string) => setFormData({...formData, height: t})}
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