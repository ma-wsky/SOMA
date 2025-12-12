import { useRouter } from "expo-router";
import { View, Text, Pressable } from "react-native";
import { useState, useEffect } from 'react';
import { auth, db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { Colors } from "../styles/theme"
import { userStyles as styles } from "../styles/userStyles";


export default function UserScreen() {

    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [currentName, setCurrentName] = useState<string>("");
    const [currentMail, setCurrentMail] = useState<string>("");
    const [currentBirthdate, setCurrentBirthdate] = useState<string>("");
    const [currentWeight, setCurrentWeight] = useState<string>("");
    const [currentHeight, setCurrentHeight] = useState<string>("");


    const handleEdit = async () => {
        router.replace("/screens/EditUserScreen");
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
                const ref = doc(db, "users", user.uid);
                const snapshot = await getDoc(ref);

                if (snapshot.exists()) {
                    const data = snapshot.data();
                    setCurrentName(data.name || "Noch kein Name gesetzt");
                    setCurrentMail(data.email || "Noch keine E-Mail gesetzt");
                    setCurrentBirthdate(data.birthdate || "Noch kein Datum gesetzt");
                    setCurrentWeight(data.weight || "Noch kein Gewicht gesetzt");
                    setCurrentHeight(data.height || "Noch keine Größe gesetzt");
                }
            } catch (e) {
                console.error("Fehler beim Laden:", e);
            }

            setLoading(false);
        };

        loadUserData();
    }, []);

    return (
        <View style={styles.userContainer}>

            <View style={styles.buttonWrapper}>
                <Pressable
                    onPress={handleEdit}
                    style={({ pressed }) => [
                        styles.button,
                        {backgroundColor: pressed ? Colors.secondary : Colors.primary},
                        {borderColor: pressed ? Colors.secondary : Colors.primary}
                    ]}
                >
                    <Text style={styles.buttonText}>Bearbeiten</Text>
                </Pressable>
            </View>

            <View style={styles.circleWrapper}>
                <View style={styles.circle}></View>
            </View>

            <View style={styles.layout}>

                <View style={styles.wrapper}>
                    <Text style={styles.text}>Name</Text>

                    <View style={{flexDirection: "row",}}>
                        <View style={styles.fieldWrapper}>
                            <Text style={styles.field}>{currentName}</Text>
                        </View>
                    </View>

                </View>

                <View style={styles.wrapper}>
                    <Text style={styles.text}>E-Mail</Text>

                    <View style={{flexDirection: "row",}}>
                        <View style={styles.fieldWrapper}>
                            <Text style={styles.field}>{currentMail}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.line}/>

                <View style={styles.wrapper}>
                    <Text style={styles.text}>Geburtsdatum</Text>

                    <View style={{flexDirection: "row",}}>
                        <View style={styles.fieldWrapper}>
                            <Text style={styles.field}>{currentBirthdate}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.wrapper}>
                    <Text style={styles.text}>Gewicht</Text>

                    <View style={{flexDirection: "row",}}>
                        <View style={styles.fieldWrapper}>
                            <Text style={styles.field}>{currentWeight} Kg</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.wrapper}>
                    <Text style={styles.text}>Größe</Text>

                    <View style={{flexDirection: "row",}}>
                        <View style={styles.fieldWrapper}>
                            <Text style={styles.field}>{currentHeight} cm</Text>
                        </View>
                    </View>
                </View>

            </View>
        </View>
    );
}