import { View,Text,TextInput,FlatList,StyleSheet, Pressable } from "react-native";
import { useState, useEffect } from 'react';
import {useRouter, router} from "expo-router";
import ExerciseItem from "../../components/ExerciseItem";
import { auth, db } from "../../firebaseConfig";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { getDocs, where, query, collection } from "firebase/firestore";
import LoadingOverlay from "../../components/LoadingOverlay";
import {Colors} from "@/app/styles/theme";


type Exercise = {
    id: string;
    name: string;
    muscleGroup?: string;
    equipment?: string;
    ownerId?: string | null;
    isGlobal?: boolean;
    isFavorite: boolean;
};

type ListItem =
    | { type: "divider"; title: string }
    | { type: "exercise"; data: Exercise };

export default function StatisticScreen() {

    const [filter, setFilter] = useState("");
    const [loading, setLoading] = useState(false);
    const [exercises, setExercises] = useState<Exercise[]>([]);

    const filteredExercises = exercises.filter(ex => {
        return ex.name.toLowerCase().includes(filter.toLowerCase());
    });

    const favoriteExercises = filteredExercises.filter(e => e.isFavorite);
    const otherExercises = filteredExercises.filter(e => !e.isFavorite);

    const listData: ListItem[] = [];

    if (favoriteExercises.length > 0) {
        listData.push({ type: "divider", title: "Favoriten" });
        favoriteExercises.forEach(ex =>
            listData.push({ type: "exercise", data: ex })
        );
    }

    if (otherExercises.length > 0) {
        listData.push({ type: "divider", title: "Alle Übungen" });
        otherExercises.forEach(ex =>
            listData.push({ type: "exercise", data: ex })
        );
    }

    useEffect(() => {
        const loadExercises = async () => {
            setLoading(true);
            const user = auth.currentUser;
            if (!user) {
                console.error("Kein User angemeldet.");
                setLoading(false);
                return;
            }

            try {
                const qGlobal =
                    query(collection(db, "exercises"),
                        where("isGlobal", "==", true),
                    );

                const qUser =
                    collection(db, "users", user.uid, "exercises");

                const qFavorites =
                    collection(db,"users", user.uid, "favorites");

                const [
                    snapshotG,
                    snapshotU,
                    snapshotF,
                ] = await Promise.all([
                    getDocs(qGlobal),
                    getDocs(qUser),
                    getDocs(qFavorites),
                ]);

                const favoriteIds = new Set(
                    snapshotF.docs.map(doc => doc.id)
                );

                const globalExercises = snapshotG.docs.map(doc => ({
                    id: doc.id,
                    name: doc.data().name || "unnamed",
                    ...doc.data(),
                    isFavorite: favoriteIds.has(doc.id),
                }));

                const userExercises = snapshotU.docs.map(doc => ({
                    id: doc.id,
                    name: doc.data().name || "unnamed",
                    ...doc.data(),
                    isFavorite: favoriteIds.has(doc.id),
                }));

                const allExercises = [...globalExercises, ...userExercises];
                setExercises(allExercises);

            } catch (e) {
                console.error("Fehler beim Laden:", e);
            }finally {
                setLoading(false);
            }
        };

        loadExercises();
    }, []);



    async function toggleFavorite(exercise: Exercise) {
        const user = auth.currentUser;
        if (!user) return;

        const ref = doc(
            db,
            "users",
            user.uid,
            "favorites",
            exercise.id,
        );

        // new exercise Object in list to reload
        setExercises(prev =>
            prev.map(ex =>
                ex.id === exercise.id
                    ? { ...ex, isFavorite: !ex.isFavorite }
                    : ex
            )
        );

        // toggle favorite in db
        if (exercise.isFavorite) {
            await deleteDoc(ref);
            exercise.isFavorite = false;
            console.log(exercise.name+": no fav");
        } else {
            await setDoc(ref, {
                createdAt: new Date(),
            });
            exercise.isFavorite = true;
            console.log(exercise.name+": fav");
        }

    }




    return (
        <View style={styles.container}>

            {/* Search Bar */}
            <TextInput placeholder={"Übung suchen..."}
                       placeholderTextColor='white'
                       value={filter}
                       onChangeText={setFilter}
                       style={styles.search}/>

            {/* TODO: Filter with tags */}

            {/* Exercise List with favorites and regular */}
            <FlatList
                data={listData}
                keyExtractor={(item, index) =>
                    item.type === "divider" ? `divider-${index}` : item.data.id
                }
                renderItem={({ item }) => {

                    {/* Dividing line with Text */}
                    if (item.type === "divider") {
                        return (
                            <View style={ styles.divider }>
                                <Text style={ styles.dividerText }>
                                    { item.title }
                                </Text>
                                <View style={ styles.line } />
                            </View>
                        );
                    }

                    {/* Exercise Item */}
                    return (
                        <ExerciseItem
                            exercise={item.data}
                            onPress={async ()=> toggleFavorite(item.data)}
                            //onPress={async ()=> router.push("/screens/stats/SingleExerciseScreen")}
                        />
                    );
                }}
                contentContainerStyle={ styles.listContent }
            />

            {/* Loading Overlay */}
            <LoadingOverlay visible={loading} />

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        marginTop: 20,
    },
    search:{
        padding:10,
        color: 'white',
        fontSize:20,
        backgroundColor:'black',
        margin:20,
        borderRadius: 50,
    },
    divider: {
        marginVertical: 12,
    },
    dividerText: {
        fontWeight: "600",
        color: "#666"
    },
    line: {
        flex: 1,
        borderBottomColor: 'gray',
        borderBottomWidth: 2,
        height: 1,
        backgroundColor: "#ccc",
        marginTop: 4
    },
    listContent: {
        marginHorizontal: 16,
    },
});