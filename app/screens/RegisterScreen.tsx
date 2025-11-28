import {useRouter} from "expo-router";
import {Text, View, Button, TextInput,TouchableOpacity,StyleSheet,Image } from 'react-native';
import {useState} from "react";

export default function RegisterScreen() {
    console.log("App executed");

    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [eye, setEye] = useState(false);


    return(
        <View style={styles.container}>
            <Text style={styles.title}>Willkommen bei</Text>
            <Text style={styles.appname}>APPNAME !</Text>
            <Text></Text>
            <Text></Text>

            <Text style={styles.title2}>Konto erstellen</Text>
            <Text style={styles.title3}>Mit Email registrieren</Text>

            <Text style={styles.text}>Email</Text>
            <TextInput style={styles.emailInput} placeholder="email@domain.com" value={email} onChangeText={setEmail}/>
            <Text style={styles.text}>Passwort</Text>
            <View style={{flexDirection: 'row', justifyContent:"flex-start", alignItems: "center"}}>
                <TextInput style={styles.pasInput} placeholder="********" value={password} onChangeText={setPassword} secureTextEntry={!eye}/>
                <TouchableOpacity style={{flex:0.2}} onPress={()=>{if(!eye){setEye(true);}else{setEye(false);}}}>
                    <Image source={require("../assets/icons/EyeOff.png")} style={styles.icon} />
                </TouchableOpacity>
            </View>


            <Button title="Registrieren" onPress={() => router.push(`/screens/ClickerScreen?name=${email}`)} disabled={email.trim() === ""}></Button>


        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
    },
    pasInput:{
        flex:0.8,
        marginBottom: 20,
        borderWidth: 2,
        borderColor: 'grey'
    },
    emailInput:{
        marginBottom: 20,
        borderWidth: 2,
        borderColor: 'grey'
    },
    appname: {
        fontSize: 45,
        fontWeight: "bold",
        alignSelf: "center",
    },
    title: {
        fontSize: 40,
        fontWeight: "condensedBold",
        alignSelf: "center",
    },
    title2: {
        fontSize: 24,
        alignSelf: "center",

    },
    title3: {
        fontSize: 20,
        alignSelf: "center",
    },
    text:{
        fontSize: 24,
        justifyContent: "flex-start",
    },
    icon:{
        width: 24,
        height: 24,
        marginBottom: 2
    },

})