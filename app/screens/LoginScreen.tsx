import {useRouter} from "expo-router";
import {Text, View, Pressable, TextInput,TouchableOpacity,StyleSheet } from 'react-native';
import {useState} from "react";
import { Colors } from "../theme"
import Ionicons from "@expo/vector-icons/Ionicons";



export default function LoginScreen(){
    console.log("App executed");

    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [hidden, setHidden] = useState(true);

    return(
        <View style={styles.container}>
            <Text style={styles.title}>Anmelden</Text>

            <View style={styles.inputs}>
                <View style={styles.inputRow}>
                    <Ionicons
                        name="person-outline"
                        size={28}
                        color="black"
                        style={styles.icon}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="E-Mail"
                        value={email}
                        onChangeText={setEmail}
                    />
                </View>

                <View style={styles.inputRow}>
                    <Ionicons
                        name="lock-closed-outline"
                        size={28}
                        color="#555"
                        style={styles.icon}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Passwort"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={hidden}/>

                    <TouchableOpacity onPress={() => setHidden(!hidden)}>
                        <Ionicons
                            name={hidden ? "eye-outline" : "eye-off-outline"}
                            size={24}
                            color="#555"
                            style={styles.eyeIcon}
                        />
                    </TouchableOpacity>
                </View>
            </View>


            <View>
                <Pressable
                    onPress={() => router.push("/(tabs)/HomeScreenProxy")}
                    style={({ pressed }) => [
                        styles.button,
                        {backgroundColor: pressed ? Colors.secondary : Colors.primary}
                    ]}
                >
                    <Text style={styles.text}>Einloggen</Text>
                </Pressable>

                <View style={{flexDirection:"row",justifyContent:"space-around",alignItems: "center"}}>
                    <View style={styles.line}/>
                    <Text>Oder</Text>
                    <View style={styles.line}/>
                </View>

                <Pressable
                    onPress={() => router.push("/screens/RegisterScreen")}
                    style={({ pressed }) => [
                        styles.button,
                        {backgroundColor: pressed ? Colors.secondary : Colors.primary}
                    ]}
                >
                    <Text style={styles.text}>Konto erstellen</Text>
                </Pressable>
            </View>




        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        marginHorizontal: 40,
    },
    inputs: {
        marginBottom: 30,
    },
    input: {
        flex: 1,
        height: 40,
    },
    inputRow:{
        flexDirection: "row",
        alignItems: "center", // Icon vertikal zentrieren
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 10,
        paddingHorizontal: 10,
        marginVertical: 5,
    },
    title: {
        fontSize: 40,
        fontWeight: "bold",
        alignSelf: "center",
        marginBottom: 30,
    },
    text:{
        color: "white",
        fontSize: 16,
    },
    icon:{
        marginRight: 10,
    },
    eyeIcon: {
        marginLeft: 8,
    },
    line: {
        flex: 1,
        borderBottomColor: 'gray',
        borderBottomWidth: 1,
        marginVertical: "5%",
        marginHorizontal:5
    },
    button: {
        paddingVertical: 8,
        borderRadius: 10,
        alignItems: "center",
    }
})