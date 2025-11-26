import { View,Text,TextInput,Button, TouchableOpacity,StyleSheet } from "react-native";
import { useState } from 'react';
import {useRouter, router} from "expo-router";


export default function UserScreen() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [birthdate, setBirthdate] = useState('dd/MM/yyyy');
    const [weight, setWeight] = useState<number>(0); //<number> notwendig??
    const [height, setHeight] = useState(0);



    return (
        <View style={styles.layout}>
            <View style={styles.header}>
                <Button title={"Zurück"} color="purple" onPress={()=>router.back()}/>
                <Text style={styles.text}>Benutzer</Text>
                <Button title={"Speichern"} color="purple" onPress={()=>router.back()}/>
            </View>
            <View style={styles.container}>
                <Text style={styles.text}>Name</Text>
                <TextInput style={styles.inputContainer} placeholder="Benutzername" value={name} onChangeText={setName}/>
                <Text style={styles.text}>Email</Text>
                <TextInput style={styles.inputContainer} placeholder="E-mail" value={email} onChangeText={setEmail}/>
            </View>
            <View style={{
                    borderBottomColor: 'gray',
                    borderBottomWidth: 1,
                    marginVertical: "5%",}}/>
            <View style={styles.container}>
                <Text style={styles.text}>Geburtstag</Text>
                <TextInput style={styles.inputContainer} placeholder="dd.mm.yyyy" value={birthdate} onChangeText={setBirthdate}/>
                <Text style={styles.text}>Gewicht (in kg)</Text>
                <TextInput style={styles.inputContainer} placeholder="0" keyboardType="numeric" value={weight.toString()} onChangeText={text => setWeight(Number(text))}/>
                <Text style={styles.text}>Größe (in cm)</Text>
                <TextInput style={styles.inputContainer} placeholder="0.00" keyboardType="numeric" value={height.toString()} onChangeText={text => setHeight(Number(text))}/>
                </View>

        </View>

);
}


const styles = StyleSheet.create({
    layout:{
        flex: 1,
        alignItems: "stretch",
    },
    header: {
        height: '10%',
        alignItems: "center",
        justifyContent: "space-between",
        flexDirection: "row"
    },
    inputContainer: {
        alignItems: "stretch",
        borderWidth: 1,
    },
    text: {
        alignItems: "stretch",
        justifyContent: "center",
    },
    container: {
        alignItems: "baseline",
        flexDirection: "column"
    },

})