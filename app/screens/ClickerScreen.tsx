import { Text, View, Button } from 'react-native';
import { useEffect, useState } from 'react';
import {useLocalSearchParams, router} from "expo-router";
import { db } from "../firebaseConfig";
import { collection, query, where, getDocs, addDoc, updateDoc, onSnapshot, serverTimestamp } from "firebase/firestore";

export default function Clicker() {
    const [count, setCount] = useState(0);
    const { name } = useLocalSearchParams();
    const nameStr = Array.isArray(name) ? name[0] : name;

    const handleButtonPress = async () => {
        const newCount = count+1;
        setCount(newCount);
        await addOrUpdateButtonPressByName(nameStr, newCount);
    }

    const resetButton = async () => {
        const newCount = 0;
        setCount(0);
        await addOrUpdateButtonPressByName(nameStr, newCount);
    }

    useEffect(() => {
        const q = query(collection(db, "ButtonPress"), where("name", "==", nameStr));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty){
                setCount(snapshot.docs[0].data().clicks);
            }else{
                setCount(0);
            }
        });
        return () => unsubscribe();
    }, [nameStr]);

    //TODO: read clicks from firebase and show in label

    return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', borderColor: 'blue', borderWidth: 2}}>
            <View style={{justifyContent: 'center', alignItems: 'center', borderColor: 'green', borderWidth: 2, padding: 20}}>
                <Text>{nameStr} hat {count} mal geklickt</Text>
            </View>

            <View style={{flexDirection: 'row', borderWidth: 2, borderColor: 'red',  justifyContent: 'space-between', alignItems: 'center', width: '40%'}}>
                <View style={{flex: 1, marginRight: 20}}>
                    <Button title="Klick mich" onPress={handleButtonPress}/>
                </View>

                <View style={{flex: 1}}>
                    <Button title="Reset" onPress={resetButton} />
                </View>
            </View>
            <View>
                <Button title="Weiter" onPress={()=> router.push("/screens/HomeScreen")}/>
            </View>
        </View>
    );
}

async function addOrUpdateButtonPressByName(name: string, clicks: number){
    const ref = collection(db, "ButtonPress");
    const q = query(ref, where("name", "==", name));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty){
        // neu anlegen
        await addDoc(ref, {
            name,
            clicks,
            createdAt: serverTimestamp(),
            lastEdited: serverTimestamp(),
        });
        console.log("New ButtonPress added");
    }else{
        // edit doc
        const docRef = querySnapshot.docs[0].ref;
        await updateDoc(docRef, {
            clicks,
            lastEdited: serverTimestamp(),
        });
        console.log(`ButtonPress for ${name} edited`);
    }
}

async function getButtonPressCount(name: string){
    const ref = collection(db, "ButtonPress");
    const q = query(ref, where("name", "==", name));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
        clicks: doc.data().clicks,
    }));
}