import { View, Text, StyleSheet, Pressable, Image } from "react-native";
import { router, useLocalSearchParams } from "expo-router"
import {TopBar} from "../../components/TopBar";
import { useState, useEffect } from "react";
import { doc, getDoc, setDoc, deleteDoc, updateDoc } from "firebase/firestore";
import Ionicons from "@expo/vector-icons/Ionicons";
import {Colors} from "../../styles/theme";
import {auth, db} from "../../firebaseConfig";
import LoadingOverlay from "../../components/LoadingOverlay";
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

type Exercise = {
    id: string;
    name: string;
    muscleGroup?: string;
    equipment?: string;
    instructions?: string;
};

export default function SingleExerciseInfoScreen() {

    const [loading,setLoading] = useState<boolean>(false);
    const { id } = useLocalSearchParams<{ id: string }>();
    const [exercise, setExercise] = useState<Exercise | null>(null);
    const [isFavorite, setFavorite] = useState<boolean|null>(null);
    const [image, setImage] = useState<string>();
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [isGlobal, setIsGlobal] = useState<boolean>(false);

    useEffect(() => {
        if (!id) return;
        setLoading(true);

        const fetchExercise = async () => {
            const defaultImage = require('../../assets/default-exercise-picture/default-exercise-picture.jpg');

            try{
                const globalRef = doc(db, "exercises", id);
                const globalSnap = await getDoc(globalRef);
                if (globalSnap.exists()) {
                    setIsGlobal(true);
                    const data = globalSnap.data();
                    setExercise({ id: globalSnap.id, ...globalSnap.data() } as Exercise);
                    setImage(data.image ? data.image : defaultImage);
                    await checkFavorite();
                    return;
                }else{
                    setImage(defaultImage);
                }

                const user = auth.currentUser;
                if (!user) return;

                const userRef = doc(db, "users", user.uid, "exercises", id);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    const data = userSnap.data();
                    setExercise({ id: userSnap.id, ...userSnap.data() } as Exercise);
                    setImage(data.image ? data.image : defaultImage);
                    await checkFavorite();
                    return;
                }else{
                    setImage(defaultImage);
                }

                setExercise(null);
            } catch (e) {
                console.error("Fehler beim Laden der Übung:", e);
                setExercise(null);
                setImage(defaultImage);
            } finally {
                setLoading(false);
            }

        };

        fetchExercise();
    }, [id]);

    const checkFavorite = async ()=> {
        const user = auth.currentUser;
        if (!user) return;
        const favRef = doc(db, "users", user.uid, "favorites", id);
        const favSnap = await getDoc(favRef);
        if (favSnap.exists()){
            setFavorite(true);
        }else {
            setFavorite(false);
        }
    }

    async function toggleFavorite() {
        const user = auth.currentUser;
        if (!user) return;
        if (!exercise) return;

        const ref = doc(
            db,
            "users",
            user.uid,
            "favorites",
            id,
        );

        // toggle favorite in db
        if (isFavorite) {
            await deleteDoc(ref);
            setFavorite(false);
            console.log(exercise.name+": no fav");
        } else {
            await setDoc(ref, {
                name: exercise.name,
                muscleGroup: exercise.muscleGroup,
                equipment: exercise.equipment,
                instructions: exercise.instructions,
            });
            setFavorite(true);
            console.log(exercise.name+": fav");
        }
    }

    const takePhoto = async ()=> {

        if (isGlobal) return;
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
            if (!exercise) return;
            const filename = `exercises/${exercise.id}.jpg`;
            const storageRef = ref(storage, filename);

            // 3. Hochladen
            await uploadBytes(storageRef, blob);

            console.log("Upload erfolgreich!");

            // 4. Download-URL erhalten (optional, um sie in der DB zu speichern)
            const downloadURL = await getDownloadURL(storageRef);
            console.log("Bild verfügbar unter:", downloadURL);

            const user = auth.currentUser;
            if (!user) return;
            const userRef = doc(db, "users", user.uid, "exercises", id);
            await updateDoc(userRef, {
                image: downloadURL,
            })

            console.log("URL im User-Feld gespeichert!");
        } catch (error) {
            console.error(error);
            alert("Upload fehlgeschlagen.");
        }finally{
            setIsUploading(false);
        }
    }

    if (!exercise) return;

    if (isFavorite === null){
        return (
            <View>
                {/* Loading Overlay */}
                <LoadingOverlay visible={loading} />
            </View>
        );
    }

    return (
        <View style={styles.container}>

            {/* Top Bar */}
            <TopBar leftButtonText={"Zurück"}
                    titleText={"Übung Info"}
                    onLeftPress={() => router.back()}
            ></TopBar>

            {/* Exercise Picture */}
            <View style={styles.picWrapper}>
                <Pressable
                    style={({pressed}) => [
                        { opacity: (pressed && !isGlobal) ? 0.7 : 1.0 },
                    ]}
                    onPress={takePhoto}>

                    <Image
                        source={
                            typeof image === 'string'
                                ? { uri: image }
                                : image
                        }
                        style={styles.image}/>

                </Pressable>

            </View>

            {/* Exercise name and fav toggle */}
            <View style={styles.nameFav}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Pressable
                    onPress={toggleFavorite}>
                    <Ionicons
                        name={isFavorite ? "heart" : "heart-outline"}
                        size={32}
                        color="#555"
                        style={styles.icon}
                    />
                </Pressable>

            </View>

            {/* muscle groups */}
            <View style={styles.muscleGroupWrapper}>
                <Text style={styles.muscleGroup}>{exercise.muscleGroup}</Text>
            </View>

            {/* Instructions */}
            <View style={styles.instructionWrapper}>
                <Text style={styles.instructionText}>Instructions</Text>
                <Text style={styles.instructionBody}>{exercise.instructions}</Text>
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
    },
    picture: {
        height: 130,
        width: 130,
        borderRadius: 20,
        backgroundColor: Colors.black,
        alignItems: "center",
        justifyContent: "center",
    },
    picWrapper: {
        marginTop: 40,
        alignItems: "center",
    },
    picText: {
        color: "white",
    },
    nameFav: {
        marginTop: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginLeft: 50,
    },
    icon: {
        marginRight: 50,
    },
    exerciseName: {
        fontSize: 24,
        fontWeight: "bold",
    },
    muscleGroup: {
        fontSize: 18,
        fontWeight: "semibold",
    },
    muscleGroupWrapper: {
        marginTop: 15,
        marginLeft: 50,
    },
    instructionText: {
        fontSize: 18,
    },
    instructionBody: {
        marginLeft: 10,
        marginTop: 5,
        fontSize: 18,
    },
    instructionWrapper: {
        marginTop: 15,
        marginLeft: 50,
    },
    image: {
        width:150,
        height:150,
        borderRadius: 75,
        borderWidth: 4,
        borderColor: 'black',
        resizeMode: 'cover',
    },
})