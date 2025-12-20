import { View,Text,TextInput,FlatList,StyleSheet } from "react-native";
import { useState, useEffect } from 'react';
import {useRouter, router} from "expo-router";
import ExerciseItem from "../../components/ExerciseItem";
import { auth, db } from "../../firebaseConfig";
import { getDocs, where, query, collection } from "firebase/firestore";
import LoadingOverlay from "../../components/LoadingOverlay";


type Exercise = {
    id: string;
    name: string;
    muscleGroup?: string;
    equipment?: string;
    ownerId?: string | null;
    isGlobal?: boolean;
    isFavorite?: boolean;
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

    const favoriteExercises = filteredExercises.filter(e => e.isGlobal);
    const otherExercises = filteredExercises.filter(e => !e.isGlobal);

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
                    query(collection(db, "exercises"),
                        where("ownerId", "==", user.uid)
                    );

                const snapshotG = await getDocs(qGlobal);
                const snapshotU = await getDocs(qUser);

                const globalExercises = snapshotG.docs.map(doc => ({
                    id: doc.id,
                    name: doc.data().name || "unnamed",
                    ...doc.data()
                }));

                const userExercises = snapshotU.docs.map(doc => ({
                    id: doc.id,
                    name: doc.data().name || "unnamed",
                    ...doc.data()
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
                            onPress={async ()=> console.log(item.data.name)}
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