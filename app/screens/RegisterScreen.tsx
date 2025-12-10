import {useRouter} from "expo-router";
import {Text, View, Pressable, TextInput,TouchableOpacity,StyleSheet } from 'react-native';
import {useState} from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import {Colors} from "../theme";

export default function RegisterScreen() {
    console.log("App executed");

    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [hidden, setHidden] = useState(true);


    return(

        <View style={styles.container}>
            <Text style={styles.title}>Willkommen bei</Text>
            <Text style={styles.appname}>APPNAME!</Text>

            <View style={styles.inputs}>
                <View style={styles.inputRow}>
                    <Ionicons
                        name="person-outline"
                        size={28}
                        color="#555"
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

            <Pressable
                onPress={() => router.push("/(tabs)/HomeScreenProxy")}
                style={({ pressed }) => [
                    styles.button,
                    {backgroundColor: pressed ? Colors.secondary : Colors.primary}
                ]}
            >
                <Text style={styles.text}>Registrieren</Text>
            </Pressable>
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
        fontWeight: "condensedBold",
        alignSelf: "center",
    },
    appname: {
        fontSize: 45,
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