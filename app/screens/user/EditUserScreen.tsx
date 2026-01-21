import { useRouter } from "expo-router";
import { View, Text, TextInput, Platform, TouchableWithoutFeedback, Keyboard, ScrollView, KeyboardAvoidingView, Pressable, Alert, Image } from "react-native";
import { useState, useEffect } from 'react';
import { auth, db } from "@/firebaseConfig";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { userStyles } from "@/styles/userStyles";
import { Colors } from "@/styles/theme";
import LoadingOverlay from "@/components/LoadingOverlay";
import DateTimePicker from '@react-native-community/datetimepicker';
import { UserButton } from "@/components/user/userButton";
import { validateEmail } from "@/utils/user/validateEmail";
import { useImagePicker } from "@/hooks/useImagePicker";
import { uploadImage } from "@/utils/uploadImage";
import { scheduleWeeklyWorkoutReminder, cancelAllNotifications } from "@/utils/helper/notificationHelper";
import { SafeAreaView } from "react-native-safe-area-context";
import { TopBar } from "@/components/TopBar";


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

const WeekdayPicker = ({ selectedDays, onToggleDay }: { selectedDays: number[], onToggleDay: (day: number) => void }) => {
    const days = [
        { id: 1, label: "Mo" },
        { id: 2, label: "Di" },
        { id: 3, label: "Mi" },
        { id: 4, label: "Do" },
        { id: 5, label: "Fr" },
        { id: 6, label: "Sa" },
        { id: 7, label: "So" },
    ];

    return (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20,paddingBottom:50 }}>
            {days.map((day) => {
                const isSelected = selectedDays.includes(day.id);
                return (
                    <Pressable
                        key={day.id}
                        onPress={() => onToggleDay(day.id)}
                        style={{
                            width: 35,
                            height: 35,
                            borderRadius: 17.5,
                            backgroundColor: isSelected ? Colors.primary : Colors.gray,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <Text style={{ color: isSelected ? Colors.white : Colors.black, fontWeight: 'bold' }}>{day.label}</Text>
                    </Pressable>
                );
            })}
        </View>
    );
};

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
        profilePicture: "",
        reminderTime: new Date(),
        reminderDays: [] as number[],
    });

    const [showTimePicker, setShowTimePicker] = useState(false);

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [dateObject, setDateObject] = useState(new Date());
    const [hasImage, setHasImage] = useState<boolean>(false);

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
                    
                    let loadedDate = new Date();
                    // Load Reminder settings
                    if (data.reminderTime && data.reminderTime.hour !== undefined && data.reminderTime.minute !== undefined) {
                         const d = new Date();
                         d.setHours(data.reminderTime.hour);
                         d.setMinutes(data.reminderTime.minute);
                         loadedDate = d;
                    }

                    setFormData({
                        name: data.name || "",
                        email: data.email || "",
                        birthdate: data.birthdate || "",
                        weight: data.weight?.toString() || "",
                        height: data.height?.toString() || "",
                        profilePicture: data.profilePicture || "",
                        reminderDays: data.reminderDays || [],
                        reminderTime: loadedDate
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

    const handleTakePhoto = async () => {
        const uri = await pickImage();
        if (uri) setHasImage(true);
    }

    const saveChanges = async () => {
        if (!validateEmail(formData.email)) {
            Alert.alert("Eingabe prüfen", "Bitte gib eine gültige E-Mail-Adresse ein.");
            return;
        }

        setLoading(true);
        try {
            const uid = auth.currentUser!.uid;
            let finalPhotoUrl = formData.profilePicture;

            if (hasImage && image) {
                const path = `users/${uid}/profile_${Date.now()}.jpg`;
                const downloadURL = await uploadImage(image, path);
                if (downloadURL) {
                    finalPhotoUrl = downloadURL;
                }
            }

            // Sync notifications
            await cancelAllNotifications();
            if (formData.reminderDays.length > 0) {
                await scheduleWeeklyWorkoutReminder(
                    "Zeit abzuliefern!",
                    "Dein Training wartet auf dich.",
                    formData.reminderTime.getHours(),
                    formData.reminderTime.getMinutes(),
                    formData.reminderDays
                );
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
                // Save Reminder Settings
                reminderDays: formData.reminderDays,
                reminderTime: {
                    hour: formData.reminderTime.getHours(),
                    minute: formData.reminderTime.getMinutes()
                }
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

    const toggleDay = (day: number) => {
        let newDays;
        if (formData.reminderDays.includes(day)) {
            newDays = formData.reminderDays.filter(d => d !== day);
        } else {
            newDays = [...formData.reminderDays, day];
        }
        setFormData({ ...formData, reminderDays: newDays });
    };


    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: Colors.background }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <SafeAreaView>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView contentContainerStyle={{ flexGrow: 1}} keyboardShouldPersistTaps="handled">

                    <View style={userStyles.editUserContainer}>


                        <TopBar
                            rightButtonText="Speichern"
                            onRightPress={saveChanges}
                        />
                        

                        {/* Profile Picture */}
                        <View style={userStyles.picWrapper}>
                            <Pressable
                                onPress={handleTakePhoto}
                                style={userStyles.profilePictureWrapperEdit}
                            >
                                <Image
                                    source={
                                        image
                                            ? { uri: image }
                                            : formData.profilePicture
                                                ? { uri: formData.profilePicture }
                                                : require('@/assets/default-profile-picture/default-profile-picture.jpg')
                                    }
                                    style={userStyles.profilePicture}
                                />

                                {!hasImage && (
                                    <View style={userStyles.textOverlay}>
                                        <Text style={userStyles.picText}>Bearbeiten</Text>
                                    </View>
                                )}
                            </Pressable>
                        </View>


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

                            <View style={userStyles.line}/>

                            <Text style={[userStyles.text, { marginLeft: 30, marginTop: 10 }]}>Trainingserinnerung</Text>

                            <EditRow
                                label="Uhrzeit"
                                value={formData.reminderTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                isPressable
                                onPress={() => setShowTimePicker(true)}
                                placeholder="Zeit wählen"
                            />

                            <View style={{ gap: 10 }}>
                                <Text style={[userStyles.text, { marginLeft: 30 }]}>Tage</Text>
                                <WeekdayPicker selectedDays={formData.reminderDays} onToggleDay={toggleDay} />
                            </View>

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

                        {showTimePicker && (
                            <DateTimePicker
                                value={formData.reminderTime}
                                mode="time"
                                is24Hour={true}
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={(event, date) => {
                                    if (Platform.OS === 'android') setShowTimePicker(false);
                                    if (date) {
                                        setFormData({ ...formData, reminderTime: date });
                                    }
                                }}
                            />
                        )}
                    </View>


                    {/* Loading Overlay */}
                    <LoadingOverlay visible={loading} />

                </ScrollView>
            </TouchableWithoutFeedback>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
}